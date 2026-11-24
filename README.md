# susu

Susu savings app - React + TypeScript + Vite

## Weekly payout delivery

Apply `database/schema.sql` to the Supabase project before using payout tracking. The schema creates a private `payout-proofs` storage bucket and policies for the scheduled member, their Agent, and Super Admin.

Agents and members must sign in through Supabase Auth for private payout actions. Members receive a secure email sign-in link using the email on their member profile. The Super Admin must have a Supabase Auth user whose matching `public.users` row has `role = 'super_admin'`.

Configure these server-only Vercel environment variables:

- `PAYSTACK_SECRET_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CRON_SECRET` (a long random value)

The daily Vercel cron checks ended weeks at 23:59 UTC and transfers the verified Paystack-collected contribution amount to the Agent using Paystack Transfers. Cash contributions remain with the Agent and are included in the member pool the Agent delivers. The Agent's Paystack recipient must be configured before payout; Paystack must also have sufficient available balance and Transfers enabled. Configure the Paystack webhook to call `/api/paystack/webhook` so the app only enables receipt upload after the transfer succeeds.

The Agent uploads the member's receipt from the Rotation Calendar. Members confirm or dispute delivery from their payout portal, and Super Admins can review statuses and proof under Payout Oversight. Payout proofs are private and accessed through short-lived signed links.