import { createHmac, timingSafeEqual } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

export const config = { api: { bodyParser: false } };

async function readRawBody(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks);
}

export default async function handlePaystackWebhook(request, response) {
  response.setHeader('Cache-Control', 'no-store');
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Method not allowed.' });
  }

  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secretKey || !supabaseUrl || !serviceRoleKey) {
    return response.status(500).json({ error: 'Payout webhook is not configured.' });
  }

  try {
    const rawBody = await readRawBody(request);
    const signature = request.headers['x-paystack-signature'];
    const expected = createHmac('sha512', secretKey).update(rawBody).digest('hex');
    const signatureBuffer = Buffer.from(typeof signature === 'string' ? signature : '', 'hex');
    const expectedBuffer = Buffer.from(expected, 'hex');
    if (signatureBuffer.length !== expectedBuffer.length || !timingSafeEqual(signatureBuffer, expectedBuffer)) {
      return response.status(401).json({ error: 'Invalid Paystack signature.' });
    }

    const event = JSON.parse(rawBody.toString('utf8'));
    if (!['transfer.success', 'transfer.failed', 'transfer.reversed'].includes(event?.event)) {
      return response.status(200).json({ received: true });
    }
    const transfer = event.data || {};
    if (typeof transfer.reference !== 'string') {
      return response.status(400).json({ error: 'Transfer reference is missing.' });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    const nextStatus = event.event === 'transfer.success' ? 'awaiting_agent' : 'transfer_failed';
    const { error } = await supabase
      .from('payout_disbursements')
      .update({
        status: nextStatus,
        transfer_code: transfer.transfer_code || null,
        failure_reason: nextStatus === 'transfer_failed' ? (transfer.reason || transfer.message || 'Paystack transfer failed.') : null
      })
      .eq('transfer_reference', transfer.reference)
      .eq('status', 'transferring_to_agent');
    if (error) throw error;

    return response.status(200).json({ received: true });
  } catch (error) {
    console.error('Paystack payout webhook failed:', error);
    return response.status(500).json({ error: 'Unable to process payout webhook.' });
  }
}
