import { createHash } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const DAY_MS = 24 * 60 * 60 * 1000;

function getServices() {
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, PAYSTACK_SECRET_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !PAYSTACK_SECRET_KEY) {
    throw new Error('Payout processing requires SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and PAYSTACK_SECRET_KEY.');
  }
  return {
    supabase: createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false }
    }),
    paystackSecretKey: PAYSTACK_SECRET_KEY
  };
}

function currencyCode(currency) {
  const codes = { 'GH₵': 'GHS', '₦': 'NGN', '$': 'USD', '£': 'GBP' };
  return codes[currency] || currency;
}

function getDuePayoutWeeks(cycleStartDate, today, maxWeekNumber) {
  const start = Date.parse(`${cycleStartDate}T00:00:00Z`);
  const current = Date.parse(`${today}T00:00:00Z`);
  const dueWeeks = [];
  for (let weekNumber = 1; weekNumber <= maxWeekNumber; weekNumber += 1) {
    const weekStart = start + (weekNumber - 1) * 7 * DAY_MS;
    const weekEnd = weekStart + 6 * DAY_MS;
    if (weekEnd > current) break;
    dueWeeks.push({
      weekNumber,
      weekStartDate: new Date(weekStart).toISOString().slice(0, 10),
      weekEndDate: new Date(weekEnd).toISOString().slice(0, 10)
    });
  }
  return dueWeeks;
}

async function createTransfer(paystackSecretKey, amount, currency, recipientCode, reference, reason) {
  const response = await fetch('https://api.paystack.co/transfer', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${paystackSecretKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      source: 'balance',
      amount: Math.round(amount * 100),
      currency,
      recipient: recipientCode,
      reference,
      reason
    }),
    signal: AbortSignal.timeout(20000)
  });
  const result = await response.json();
  if (!response.ok || result?.status !== true || !result?.data) {
    throw new Error(result?.message || 'Paystack rejected the agent payout transfer.');
  }
  return result.data;
}

export default async function processPayouts(request, response) {
  response.setHeader('Cache-Control', 'no-store');
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).json({ error: 'Method not allowed.' });
  }
  if (!process.env.CRON_SECRET || request.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return response.status(401).json({ error: 'Unauthorized payout scheduler request.' });
  }

  try {
    const { supabase, paystackSecretKey } = getServices();
    const today = new Date().toISOString().slice(0, 10);
    const { data: groups, error: groupsError } = await supabase
      .from('susu_groups')
      .select('id, name, agent_id, fixed_daily_amount, currency, cycle_start_date, status')
      .eq('status', 'active');
    if (groupsError) throw groupsError;

    const results = [];
    for (const group of groups || []) {
      const { data: members, error: membersError } = await supabase
        .from('group_members')
        .select('id, name, position_in_rotation')
        .eq('group_id', group.id)
        .neq('invite_status', 'removed')
        .order('position_in_rotation');
      if (membersError) throw membersError;
      if (!members?.length) continue;
      const maxWeekNumber = Math.max(...members.map(member => Number(member.position_in_rotation) || 0));
      const dueWeeks = getDuePayoutWeeks(group.cycle_start_date, today, maxWeekNumber);

      for (const payoutWeek of dueWeeks) {
        const recipient = members.find(member => member.position_in_rotation === payoutWeek.weekNumber);
        if (!recipient) continue;
        const payoutId = `payout-${group.id}-${payoutWeek.weekNumber}`;
        const { data: existing, error: existingError } = await supabase
          .from('payout_disbursements')
          .select('id')
          .eq('id', payoutId)
          .maybeSingle();
        if (existingError) throw existingError;
        if (existing) continue;

        const { data: contributions, error: contributionsError } = await supabase
          .from('daily_payments')
          .select('member_id, payment_date, amount, platform_fee, payment_method, status')
          .eq('group_id', group.id)
          .gte('payment_date', payoutWeek.weekStartDate)
          .lte('payment_date', payoutWeek.weekEndDate)
          .eq('status', 'paid');
        if (contributionsError) throw contributionsError;

        const paidDays = new Set((contributions || []).map(payment => `${payment.member_id}:${payment.payment_date}`));
        const allContributionsVerified = members.every(member =>
          Array.from({ length: 7 }, (_, index) => {
            const date = new Date(Date.parse(`${payoutWeek.weekStartDate}T00:00:00Z`) + index * DAY_MS).toISOString().slice(0, 10);
            return paidDays.has(`${member.id}:${date}`);
          }).every(Boolean)
        );
        if (!allContributionsVerified) continue;

        const poolAmount = (contributions || []).reduce(
          (sum, payment) => sum + Math.max(0, Number(payment.amount) - Number(payment.platform_fee || 0)),
          0
        );
        const transferAmount = (contributions || [])
          .filter(payment => payment.payment_method === 'paystack')
          .reduce((sum, payment) => sum + Math.max(0, Number(payment.amount) - Number(payment.platform_fee || 0)), 0);
        const currency = currencyCode(group.currency);
        const reference = `SUSU-${createHash('sha256').update(payoutId).digest('hex').slice(0, 24)}`;
        const unsupportedCurrency = !['GHS', 'NGN'].includes(currency);
        let recipientCode;
        if (transferAmount > 0 && !unsupportedCurrency) {
          const { data: configRow, error: configError } = await supabase
            .from('payment_configs')
            .select('config')
            .eq('entity_type', `agent_${group.agent_id}`)
            .maybeSingle();
          if (configError) throw configError;
          recipientCode = configRow?.config?.paystackRecipientCode || configRow?.config?.recipientCode;
        }
        const failureReason = transferAmount > 0
          ? unsupportedCurrency
            ? `Paystack transfers are not enabled for ${currency}.`
            : !recipientCode
              ? 'Agent Paystack recipient is not configured.'
              : null
          : null;
        const initialStatus = transferAmount > 0
          ? failureReason ? 'transfer_failed' : 'transferring_to_agent'
          : 'awaiting_agent';

        const { error: insertError } = await supabase.from('payout_disbursements').insert({
          id: payoutId,
          group_id: group.id,
          agent_id: group.agent_id,
          member_id: recipient.id,
          week_number: payoutWeek.weekNumber,
          week_start_date: payoutWeek.weekStartDate,
          week_end_date: payoutWeek.weekEndDate,
          currency,
          pool_amount: poolAmount,
          transfer_amount: transferAmount,
          status: initialStatus,
          failure_reason: failureReason,
          transfer_reference: transferAmount > 0 ? reference : null
        });
        if (insertError) {
          if (insertError.code === '23505') continue;
          throw insertError;
        }

        if (transferAmount === 0) {
          results.push({ payoutId, status: 'awaiting_agent', note: 'No Paystack-collected funds to transfer.' });
          continue;
        }

        if (failureReason) {
          results.push({ payoutId, status: 'transfer_failed', error: failureReason });
          continue;
        }

        let transfer;
        try {
          transfer = await createTransfer(
            paystackSecretKey,
            transferAmount,
            currency,
            recipientCode,
            reference,
            `Susu week ${payoutWeek.weekNumber}: ${group.name}`
          );
        } catch (error) {
          if (error instanceof TypeError || error?.name === 'TimeoutError' || error?.name === 'AbortError') {
            results.push({ payoutId, status: 'transferring_to_agent', note: 'Transfer outcome is uncertain; reconcile with Paystack before retrying.' });
            continue;
          }
          const { error: updateError } = await supabase
            .from('payout_disbursements')
            .update({ status: 'transfer_failed', failure_reason: error.message })
            .eq('id', payoutId);
          if (updateError) throw updateError;
          results.push({ payoutId, status: 'transfer_failed', error: error.message });
          continue;
        }

        const { error: updateError } = await supabase
          .from('payout_disbursements')
          .update({ transfer_code: transfer.transfer_code || null })
          .eq('id', payoutId);
        if (updateError) throw updateError;
        results.push({ payoutId, status: 'transferring_to_agent', transferCode: transfer.transfer_code });
      }
    }

    return response.status(200).json({ processed: results.length, results });
  } catch (error) {
    console.error('Scheduled payout processing failed:', error);
    return response.status(500).json({ error: error instanceof Error ? error.message : 'Payout processing failed.' });
  }
}
