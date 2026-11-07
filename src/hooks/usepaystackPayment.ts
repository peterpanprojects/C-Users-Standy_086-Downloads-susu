import { useState } from 'react';
import { supabase } from '../services/db';

export function usePaystackPayment() {
  const [loading, setLoading] = useState(false);

  const payDaily = async (memberId: string, groupId: string, amount: number, email: string, paymentId: string) => {
    setLoading(true);
    const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
    if (!publicKey) {
      alert('Add VITE_PAYSTACK_PUBLIC_KEY to .env');
      setLoading(false);
      return;
    }

    // @ts-ignore - Paystack inline script
    const handler = window.PaystackPop.setup({
      key: publicKey,
      email,
      amount: amount * 100, // kobo
      currency: 'GHS',
      ref: `SUSU_${paymentId}_${Date.now()}`,
      callback: async function(response: any) {
        // Verify and save to Supabase
        if (supabase) {
          await supabase.from('daily_payments').update({
            status: 'paid',
            payment_method: 'paystack',
            paystack_reference: response.reference,
            paid_at: new Date().toISOString()
          }).eq('id', paymentId);
        }
        alert('Payment successful! ' + response.reference);
        window.location.reload();
        setLoading(false);
      },
      onClose: () => {
        setLoading(false);
      }
    });
    handler.openIframe();
  };

  return { payDaily, loading };
}