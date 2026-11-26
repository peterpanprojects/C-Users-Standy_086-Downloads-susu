import React, { useState } from 'react';
import { useSusu } from '../../context/SusuContext';
import { X, Lock, ArrowRight, ShieldCheck, Smartphone, CreditCard } from 'lucide-react';
import { calculatePlatformFee } from '../../utils/paymentFees';
import { DatabaseService } from '../../services/db';

interface PaystackModalProps {
  isOpen: boolean; onClose: () => void; selectedDates: string[]; memberId: string;
}

export const PaystackModal: React.FC<PaystackModalProps> = ({ isOpen, onClose, selectedDates, memberId }) => {
  const { group, members, platformPaymentConfig, agentPaymentConfig } = useSusu();
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const currentMember = members.find((m) => m.id === memberId) || members[0];
  const daysCount = selectedDates.length || 1;
  const totalAmount = group? group.fixedDailyAmount * daysCount : 0;
  const feePercent = platformPaymentConfig.globalPlatformFeePercent ?? 2;
  const platformFee = calculatePlatformFee(totalAmount, feePercent);
  const totalCharge = totalAmount + platformFee;
  const isFrozen = platformPaymentConfig.emergencyPayoutFreeze;
  const isOnlineDisabled =!agentPaymentConfig.allowPaystackOnline;

  const handleExecutePayment = async () => {
    if (isFrozen || isOnlineDisabled || !currentMember || !group) return;
    setErrorMessage('');
    setProcessing(true);
    try {
      const checkoutUrl = await DatabaseService.initializePaystackRedirect(
        currentMember.id,
        group.id,
        selectedDates
      );
      window.sessionStorage.setItem('memberPaymentReturnId', currentMember.id);
      window.location.assign(checkoutUrl);
    } catch (error) {
      setProcessing(false);
      setErrorMessage(error instanceof Error ? error.message : 'Unable to open Paystack checkout.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '480px', padding: '0', overflow: 'hidden' }}>
        <div style={{ background: 'linear-gradient(135deg, #0A2920, #061B14)', color: '#fff', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid var(--color-gold-500)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: '#00C3F7', color: '#000', padding: '0.35rem 0.6rem', borderRadius: '6px', fontWeight: 800, fontSize: '0.8rem' }}>paystack</div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-slate-200)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                {group?.name} <span style={{ background: platformPaymentConfig.environment === 'live'? '#22c55e' : '#f59e0b', color: '#000', fontSize: '0.65rem', padding: '0.1rem 0.35rem', borderRadius: '4px', fontWeight: 800 }}>{platformPaymentConfig.environment === 'live'? 'LIVE' : 'TEST'}</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-gold-400)' }}>{currentMember?.email}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', color: '#fff', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        <div style={{ padding: '1.5rem' }}>
            {errorMessage && (
              <div role="alert" style={{ background: '#fee2e2', color: '#991b1b', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {errorMessage}
              </div>
            )}
            {isFrozen && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '0.75rem', borderRadius: '8px', fontSize: '0.8rem', marginBottom: '1rem', fontWeight: 600 }}>Platform Notice: Master emergency payout freeze is active.</div>}
            <div style={{ background: 'var(--color-slate-50)', border: '1px solid var(--color-slate-200)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div><span style={{ fontSize: '0.8rem', color: 'var(--color-slate-600)', display: 'block' }}>Contribution for {daysCount} {daysCount === 1? 'day' : 'days'}</span><span style={{ fontSize: '0.75rem', color: 'var(--color-emerald-700)', fontWeight: 600 }}>{selectedDates.join(', ')}</span></div>
              <div style={{ textAlign: 'right' }}><span style={{ fontSize: '0.75rem', color: 'var(--color-slate-600)', display: 'block' }}>Contribution</span><span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-emerald-950)' }}>{group?.currency}{totalAmount.toFixed(2)}</span></div>
            </div>
            <div style={{ border: '1px solid var(--color-slate-200)', borderRadius: 'var(--radius-md)', padding: '0.85rem 1rem', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.45rem' }}><span style={{ color: 'var(--color-slate-600)' }}>Platform fee ({feePercent}%)</span><span>{group?.currency}{platformFee.toFixed(2)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, borderTop: '1px solid var(--color-slate-200)', paddingTop: '0.55rem' }}><span>Total charged</span><span>{group?.currency}{totalCharge.toFixed(2)}</span></div>
            </div>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-md)', padding: '0.85rem 1rem', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: 600, color: '#166534' }}><ShieldCheck size={16} color="#16a34a" /> Paystack Secured Checkout</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem', color: '#15803d' }}><span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><CreditCard size={14} /> Cards</span><span>•</span><span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Smartphone size={14} /> Mobile Money</span></div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--color-slate-500)', marginBottom: '1.5rem' }}><Lock size={14} color="var(--color-emerald-600)" /> 256-Bit SSL Encrypted by Paystack</div>
            <button className="btn-gold" onClick={handleExecutePayment} disabled={processing || isFrozen || isOnlineDisabled} style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', fontSize: '1rem', opacity: (isFrozen || isOnlineDisabled)? 0.5 : 1 }}>
              {processing ? 'Preparing secure Paystack checkout...' : <>Continue to Paystack <ArrowRight size={18} /></>}
            </button>
            <p style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--color-slate-500)', textAlign: 'center' }}>
              You’ll return to the app after Paystack confirms your payment.
            </p>
        </div>
      </div>
    </div>
  );
};