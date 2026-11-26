import { randomBytes } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Server payment access is not configured.');
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

function getRequestOrigin(request) {
  const readHeader = value => Array.isArray(value) ? value[0] : value;
  const host = readHeader(request.headers['x-forwarded-host']) || readHeader(request.headers.host);
  const protocol = readHeader(request.headers['x-forwarded-proto']) || (host?.startsWith('localhost') ? 'http' : 'https');
  const origin = request.headers.origin;
  const parsedOrigin = origin ? new URL(origin) : null;
  if (
    !host ||
    !parsedOrigin ||
    parsedOrigin.host !== host ||
    parsedOrigin.protocol !== `${protocol}:` ||
    !['http', 'https'].includes(protocol)
  ) {
    throw new Error('Unable to verify the checkout return address.');
  }
  return parsedOrigin.origin;
}

function normalizeCurrency(currency) {
  if (currency === 'GH₵' || currency === 'GHS') return 'GHS';
  if (currency === '₦' || currency === 'NGN') return 'NGN';
  if (currency === '$' || currency === 'USD') return 'USD';
  if (currency === '£' || currency === 'GBP') return 'GBP';
  return currency;
}

function validPaymentDates(dates) {
  return Array.isArray(dates) &&
    dates.length > 0 &&
    dates.length <= 7 &&
    dates.every(date =>
      typeof date === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(date) &&
      Number.isFinite(Date.parse(`${date}T00:00:00.000Z`)) &&
      new Date(`${date}T00:00:00.000Z`).toISOString().slice(0, 10) === date
    ) &&
    new Set(dates).size === dates.length;
}

async function paystackRequest(path, secretKey, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);
  try {
    const result = await fetch(`https://api.paystack.co${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    const payload = await result.json();
    if (!result.ok || payload?.status !== true) {
      throw new Error(payload?.message || 'Paystack could not process this request.');
    }
    return payload.data;
  } finally {
    clearTimeout(timeoutId);
  }
}

function parseMetadata(metadata) {
  if (typeof metadata === 'string') {
    try {
      return JSON.parse(metadata);
    } catch {
      return null;
    }
  }
  return metadata && typeof metadata === 'object' ? metadata : null;
}

async function initializeCheckout(request, response, supabase, secretKey) {
  const { memberId, groupId, dates } = request.body || {};
  if (
    typeof memberId !== 'string' ||
    typeof groupId !== 'string' ||
    !validPaymentDates(dates)
  ) {
    return response.status(400).json({ error: 'A member, group, and one to seven unique payment dates are required.' });
  }

  const { data: member, error: memberError } = await supabase
    .from('group_members')
    .select('id, group_id, name, email, invite_status')
    .eq('id', memberId)
    .maybeSingle();
  if (memberError) throw memberError;
  if (!member || member.group_id !== groupId || member.invite_status !== 'active') {
    return response.status(404).json({ error: 'An active member in this Susu group could not be found.' });
  }

  const { data: group, error: groupError } = await supabase
    .from('susu_groups')
    .select('id, name, fixed_daily_amount, currency, status')
    .eq('id', groupId)
    .maybeSingle();
  if (groupError) throw groupError;
  if (!group || group.status !== 'active') {
    return response.status(404).json({ error: 'This Susu group is not active.' });
  }

  const { data: existingPayments, error: paymentsError } = await supabase
    .from('daily_payments')
    .select('payment_date')
    .eq('member_id', memberId)
    .eq('group_id', groupId)
    .eq('status', 'paid')
    .in('payment_date', dates);
  if (paymentsError) throw paymentsError;
  if (existingPayments?.length) {
    return response.status(409).json({ error: 'One or more selected dates have already been paid. Refresh your payment page and try again.' });
  }

  const { data: feeConfig, error: feeConfigError } = await supabase
    .from('payment_configs')
    .select('config')
    .eq('entity_type', 'super_admin')
    .maybeSingle();
  if (feeConfigError) throw feeConfigError;
  const feePercent = Number(feeConfig?.config?.globalPlatformFeePercent ?? feeConfig?.config?.commission_percent ?? 2);
  if (!Number.isFinite(feePercent) || feePercent < 0 || feePercent > 100) {
    throw new Error('The platform payment fee is invalid.');
  }

  const dailyAmountMinor = Math.round(Number(group.fixed_daily_amount) * 100);
  if (!Number.isSafeInteger(dailyAmountMinor) || dailyAmountMinor <= 0) {
    throw new Error('The group contribution amount is invalid.');
  }
  const contributionMinor = dailyAmountMinor * dates.length;
  const feeMinor = Math.round(contributionMinor * feePercent / 100);
  const totalMinor = contributionMinor + feeMinor;
  const currency = normalizeCurrency(group.currency);
  if (!/^[A-Z]{3}$/.test(currency)) throw new Error('The group currency is not supported by Paystack.');

  const reference = `SUSU-${randomBytes(16).toString('hex')}`;
  const origin = getRequestOrigin(request);
  const email = member.email?.trim() || 'member@susu.platform';
  const metadata = {
    susu_payment: {
      version: 1,
      memberId,
      groupId,
      dates,
      dailyAmountMinor,
      feeMinor,
      totalMinor,
      currency
    },
    custom_fields: [
      { display_name: 'Susu Group', variable_name: 'susu_group', value: group.name },
      { display_name: 'Member', variable_name: 'susu_member', value: member.name }
    ]
  };
  const transaction = await paystackRequest('/transaction/initialize', secretKey, {
    method: 'POST',
    body: JSON.stringify({
      email,
      amount: totalMinor,
      currency,
      reference,
      callback_url: `${origin}/payment/return`,
      metadata
    })
  });

  if (typeof transaction.authorization_url !== 'string' || !transaction.authorization_url.startsWith('https://checkout.paystack.com/')) {
    throw new Error('Paystack did not provide a valid hosted checkout address.');
  }
  return response.status(200).json({ authorizationUrl: transaction.authorization_url });
}

async function verifyCheckout(request, response, supabase, secretKey) {
  const { reference } = request.body || {};
  if (typeof reference !== 'string' || !/^SUSU-[a-f0-9]{32}$/.test(reference)) {
    return response.status(400).json({ error: 'A valid payment reference is required.' });
  }

  const transaction = await paystackRequest(`/transaction/verify/${encodeURIComponent(reference)}`, secretKey);
  if (transaction.status !== 'success' || transaction.reference !== reference) {
    return response.status(409).json({ error: 'Paystack has not confirmed this payment. No contribution was marked as paid.' });
  }
  const intent = parseMetadata(transaction.metadata)?.susu_payment;
  if (
    intent?.version !== 1 ||
    typeof intent.memberId !== 'string' ||
    typeof intent.groupId !== 'string' ||
    !validPaymentDates(intent.dates) ||
    !Number.isSafeInteger(intent.dailyAmountMinor) ||
    intent.dailyAmountMinor <= 0 ||
    !Number.isSafeInteger(intent.feeMinor) ||
    intent.feeMinor < 0 ||
    !Number.isSafeInteger(intent.totalMinor) ||
    intent.totalMinor !== intent.dailyAmountMinor * intent.dates.length + intent.feeMinor ||
    typeof intent.currency !== 'string' ||
    !/^[A-Z]{3}$/.test(intent.currency) ||
    transaction.amount !== intent.totalMinor ||
    transaction.currency !== intent.currency
  ) {
    return response.status(422).json({ error: 'The Paystack transaction does not match this Susu payment.' });
  }

  const { data: member, error: memberError } = await supabase
    .from('group_members')
    .select('id, group_id')
    .eq('id', intent.memberId)
    .maybeSingle();
  if (memberError) throw memberError;
  if (!member || member.group_id !== intent.groupId) {
    return response.status(404).json({ error: 'The member for this payment could not be found.' });
  }

  const { data: existingPayments, error: existingError } = await supabase
    .from('daily_payments')
    .select('payment_date, paystack_reference')
    .eq('member_id', intent.memberId)
    .eq('group_id', intent.groupId)
    .eq('status', 'paid')
    .in('payment_date', intent.dates);
  if (existingError) throw existingError;
  if (existingPayments?.some(payment => payment.paystack_reference !== reference)) {
    return response.status(409).json({ error: 'A selected contribution date has already been paid by another transaction. Contact support before trying again.' });
  }

  const paidAt = transaction.paid_at || new Date().toISOString();
  const dailyAmount = intent.dailyAmountMinor / 100;
  const platformFee = intent.feeMinor / 100;
  const rows = intent.dates.map((date, index) => ({
    id: `pay-${intent.memberId}-${date}`,
    group_id: intent.groupId,
    member_id: intent.memberId,
    payment_date: date,
    amount: dailyAmount,
    platform_fee: index === 0 ? platformFee : 0,
    status: 'paid',
    payment_method: 'paystack',
    paystack_reference: index === 0 ? reference : null,
    paid_at: paidAt
  }));
  const { error: saveError } = await supabase
    .from('daily_payments')
    .upsert(rows, { onConflict: 'group_id,member_id,payment_date' });
  if (saveError) throw saveError;

  return response.status(200).json({
    paidDates: intent.dates,
    reference,
    paidAt,
    memberId: intent.memberId,
    groupId: intent.groupId
  });
}

export default async function handlePaystackCheckout(request, response) {
  response.setHeader('Cache-Control', 'no-store');
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Method not allowed.' });
  }

  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) return response.status(500).json({ error: 'Server payment processing is not configured.' });

  try {
    getRequestOrigin(request);
    const supabase = getSupabase();
    if (request.body?.action === 'initialize') {
      return await initializeCheckout(request, response, supabase, secretKey);
    }
    if (request.body?.action === 'verify') {
      return await verifyCheckout(request, response, supabase, secretKey);
    }
    return response.status(400).json({ error: 'A valid checkout action is required.' });
  } catch (error) {
    console.error('Paystack hosted checkout failed:', error);
    return response.status(502).json({
      error: error instanceof Error ? error.message : 'Paystack checkout could not be completed.'
    });
  }
}
