// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { agentName, momoNumber, bankCode, percentage } = await req.json()

    // 1. Create Transfer Recipient in Paystack
    const recipientRes = await fetch("https://api.paystack.co/transferrecipient", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("PAYSTACK_SECRET_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "mobile_money",
        name: agentName,
        account_number: momoNumber,
        bank_code: bankCode,
        currency: "GHS",
      }),
    })
    const recipient = await recipientRes.json()
    if (!recipient.status) throw new Error(recipient.message)

    // 2. Create Subaccount
    const subRes = await fetch("https://api.paystack.co/subaccount", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("PAYSTACK_SECRET_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        business_name: agentName,
        settlement_bank: bankCode,
        account_number: momoNumber,
        percentage_charge: percentage,
        description: `Susu Agent - ${agentName}`,
      }),
    })
    const subaccount = await subRes.json()
    if (!subaccount.status) throw new Error(subaccount.message)

    return new Response(JSON.stringify({
      subaccount_code: subaccount.data.subaccount_code,
      recipient_code: recipient.data.recipient_code
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } })

  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    })
  }
})