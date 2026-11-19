// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { agentName, momoNumber, percentage } = await req.json()

    // Normalize phone: +233557388663 -> 0557388663
    let phone = String(momoNumber || "").replace(/\s/g, "")
    if (phone.startsWith("+233")) phone = "0" + phone.slice(4)
    if (phone.startsWith("233")) phone = "0" + phone.slice(3)

    // Auto-detect Ghana network from prefix - Paystack Live codes
    const prefix = phone.slice(0, 3)
    let bankCode = "MTN" // default MTN: 024,025,053,054,055,059
    if (["020", "050", "023"].includes(prefix)) bankCode = "VOD" // Telecel
    if (["026", "027", "056", "057"].includes(prefix)) bankCode = "ATL" // AirtelTigo

    // 1. Create Transfer Recipient
    const recipientRes = await fetch("https://api.paystack.co/transferrecipient", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("PAYSTACK_SECRET_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "mobile_money",
        name: agentName,
        account_number: phone,
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
        account_number: phone,
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