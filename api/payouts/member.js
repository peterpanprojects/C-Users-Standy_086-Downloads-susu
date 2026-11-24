import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Member payout access is not configured on the server.');
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

function mapPayout(row, proofUrl) {
  return { ...row, proof_url: proofUrl };
}

export default async function handleMemberPayout(request, response) {
  response.setHeader('Cache-Control', 'no-store');
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Method not allowed.' });
  }

  const code = typeof request.body?.code === 'string' ? request.body.code.trim().toUpperCase() : '';
  const action = request.body?.action;
  if (!code || code.length > 64 || !['list', 'respond'].includes(action)) {
    return response.status(400).json({ error: 'A valid Member Code and payout action are required.' });
  }

  try {
    const supabase = getSupabase();
    const { data: member, error: memberError } = await supabase
      .from('group_members')
      .select('id, group_id')
      .eq('unique_code', code)
      .maybeSingle();
    if (memberError) throw memberError;
    if (!member) return response.status(401).json({ error: 'Member Code was not recognized.' });

    if (action === 'respond') {
      const { payoutId, memberResponse } = request.body;
      if (typeof payoutId !== 'string' || !['received', 'not_received'].includes(memberResponse)) {
        return response.status(400).json({ error: 'A valid payout and response are required.' });
      }

      const { data, error } = await supabase
        .from('payout_disbursements')
        .update({
          member_response: memberResponse,
          status: memberResponse === 'received' ? 'member_received' : 'member_disputed',
          member_responded_at: new Date().toISOString()
        })
        .eq('id', payoutId)
        .eq('member_id', member.id)
        .in('status', ['sent_to_member', 'member_disputed'])
        .select('*')
        .maybeSingle();
      if (error) throw error;
      if (!data) return response.status(409).json({ error: 'This payout is no longer waiting for a member response.' });
      return response.status(200).json({ ok: true });
    }

    const { data: payouts, error: payoutsError } = await supabase
      .from('payout_disbursements')
      .select('*')
      .eq('member_id', member.id)
      .order('week_start_date', { ascending: false });
    if (payoutsError) throw payoutsError;

    const withProofUrls = await Promise.all((payouts || []).map(async payout => {
      if (!payout.proof_path) return mapPayout(payout);
      const { data, error } = await supabase.storage
        .from('payout-proofs')
        .createSignedUrl(payout.proof_path, 1800);
      if (error) throw error;
      return mapPayout(payout, data.signedUrl);
    }));

    return response.status(200).json({
      memberId: member.id,
      groupId: member.group_id,
      payouts: withProofUrls
    });
  } catch (error) {
    console.error('Member payout request failed:', error);
    return response.status(500).json({ error: error instanceof Error ? error.message : 'Unable to load payout records.' });
  }
}
