import React, { useEffect, useState } from 'react';
import { CheckCircle2, LoaderCircle, AlertCircle } from 'lucide-react';
import { DatabaseService } from '../../services/db';

interface PaymentReturnPageProps {
  onNavigate: (path: string) => void;
}

export const PaymentReturnPage: React.FC<PaymentReturnPageProps> = ({ onNavigate }) => {
  const [reference, setReference] = useState('');
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('Confirming your payment with Paystack...');
  const [paidDays, setPaidDays] = useState(0);

  const verifyPayment = async (paymentReference: string) => {
    setStatus('verifying');
    setMessage('Confirming your payment with Paystack...');
    try {
      const result = await DatabaseService.completePaystackRedirect(paymentReference);
      setPaidDays(result.paidDates.length);
      setStatus('success');
      setMessage('Your payment was confirmed and your contribution records have been updated.');
      window.history.replaceState({}, '', window.location.pathname);
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Unable to confirm this payment.');
    }
  };

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const paymentReference = query.get('reference') || query.get('trxref') || '';
    setReference(paymentReference);
    if (!paymentReference) {
      setStatus('error');
      setMessage('Paystack did not return a payment reference. Check your payment status before trying again.');
      return;
    }
    void verifyPayment(paymentReference);
  }, []);

  return (
    <div style={{ maxWidth: '520px', margin: '3rem auto', padding: '0 1rem' }}>
      <div className="card" style={{ padding: '2.5rem 2rem', textAlign: 'center' }}>
        {status === 'verifying' ? (
          <LoaderCircle size={48} color="var(--color-emerald-700)" style={{ margin: '0 auto 1rem' }} />
        ) : status === 'success' ? (
          <CheckCircle2 size={52} color="var(--color-emerald-600)" style={{ margin: '0 auto 1rem' }} />
        ) : (
          <AlertCircle size={52} color="#b91c1c" style={{ margin: '0 auto 1rem' }} />
        )}
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>
          {status === 'verifying' ? 'Verifying Payment' : status === 'success' ? 'Payment Confirmed' : 'Payment Not Confirmed'}
        </h1>
        <p role={status === 'error' ? 'alert' : 'status'} style={{ color: 'var(--color-slate-600)', fontSize: '0.9rem' }}>
          {message}
        </p>
        {status === 'success' && (
          <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--color-emerald-800)' }}>
            {paidDays} contribution {paidDays === 1 ? 'day' : 'days'} recorded.
          </p>
        )}
        {reference && status !== 'verifying' && (
          <p style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--color-slate-500)' }}>
            Reference: <span style={{ fontFamily: 'monospace' }}>{reference}</span>
          </p>
        )}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
          {status === 'error' && reference && (
            <button type="button" className="btn-outline" onClick={() => void verifyPayment(reference)}>
              Check payment again
            </button>
          )}
          {status !== 'verifying' && (
            <button type="button" className="btn-primary" onClick={() => onNavigate(status === 'success' ? '/member/login' : '/member/pay')}>
              {status === 'success' ? 'Return to Member Portal' : 'Back to Contributions'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
