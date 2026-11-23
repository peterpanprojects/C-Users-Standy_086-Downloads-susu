export default async function verifyPaystackPayment(request, response) {
  response.setHeader('Cache-Control', 'no-store');
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Method not allowed.' });
  }

  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    return response.status(500).json({ error: 'Server payment verification is not configured.' });
  }

  const { reference, amount, currency } = request.body || {};
  if (
    typeof reference !== 'string' ||
    reference.length < 5 ||
    reference.length > 100 ||
    typeof amount !== 'number' ||
    !Number.isFinite(amount) ||
    amount <= 0 ||
    typeof currency !== 'string' ||
    !/^[A-Z]{3}$/.test(currency)
  ) {
    return response.status(400).json({ error: 'A valid payment reference, amount, and currency are required.' });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);
  try {
    const paystackResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: { Authorization: `Bearer ${secretKey}` },
        signal: controller.signal
      }
    );
    const payload = await paystackResponse.json();
    if (!paystackResponse.ok || payload?.status !== true || !payload?.data) {
      return response.status(502).json({ error: 'Unable to verify this payment with Paystack.' });
    }

    const transaction = payload.data;
    const expectedAmount = Math.round(amount * 100);
    if (
      transaction.status !== 'success' ||
      transaction.reference !== reference ||
      transaction.amount !== expectedAmount ||
      transaction.currency !== currency
    ) {
      return response.status(422).json({ error: 'The Paystack transaction does not match the expected amount and currency.' });
    }

    return response.status(200).json({ verified: true });
  } catch (error) {
    console.error('Paystack verification request failed:', error);
    return response.status(502).json({ error: 'Payment verification service is temporarily unavailable.' });
  } finally {
    clearTimeout(timeoutId);
  }
}
