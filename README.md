# Susu Savings Vault

Susu savings app built with React, TypeScript, and Vite.

## Paystack hosted checkout

Member contributions use Paystack's hosted checkout and return to `/payment/return` for server-side verification. Configure these server-only Vercel environment variables:

- `PAYSTACK_SECRET_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Never expose the service-role or Paystack secret key in a `VITE_` variable.