import { useState } from 'react';
import { supabase } from '../services/db';
import { verifyPaystackTransaction } from '../utils/paystack';

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
      callback: function(response: any) {
        void (async () => {
          try {
            await verifyPaystackTransaction(response.reference, amount, 'GHS');
            if (!supabase) throw new Error('Supabase is not configured.');
            const { error } = await supabase.from('daily_payments').update({
              status: 'paid',
              payment_method: 'paystack',
              paystack_reference: response.reference,
              paid_at: new Date().toISOString()
            }).eq('id', paymentId);
            if (error) throw new Error(`Failed to save payment: ${error.message}`);
            alert('Payment successful! ' + response.reference);
            window.location.reload();
          } catch (error) {
            console.error('Unable to verify or save payment:', error);
            alert(error instanceof Error ? error.message : 'Unable to verify or save payment.');
          } finally {
            setLoading(false);
          }
        })();
      },
      onClose: () => {
        setLoading(false);
      }
    });
    handler.openIframe();
  };

  return { payDaily, loading };
}