import React, { useState } from 'react';
import { useSusu } from '../../context/SusuContext';
import { X, CheckCircle2, Lock, ArrowRight, ShieldCheck, Smartphone, CreditCard } from 'lucide-react';
import { generatePaystackReference, initializePaystackCheckout } from '../../utils/paystack';

interface PaystackModalProps {
  isOpen: boolean; onClose: () => void; selectedDates: string[]; memberId: string;
}

export const PaystackModal: React.FC<PaystackModalProps> = ({ isOpen, onClose, selectedDates, memberId }) => {
  const { group, members, processPayment, platformPaymentConfig, agentPaymentConfig } = useSusu();
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [paymentRef, setPaymentRef] = useState('');

  if (!isOpen) return null;

  const currentMember = members.find((m) => m.id === memberId) || members[0];
  const daysCount = selectedDates.length || 1;
  const totalAmount = group? group.fixedDailyAmount * daysCount : 0;
  const isFrozen = platformPaymentConfig.emergencyPayoutFreeze;
  const isOnlineDisabled =!agentPaymentConfig.allowPaystackOnline;

  const getValidPaystackKey = () => {
  // OPTION 1: Single Master Paystack for ALL agents
  const key = platformPaymentConfig.masterPublicKey 
           || platformPaymentConfig.publicKey
           || import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

  return key && key.startsWith('pk_') && key.length > 30 ? key : '';
};

  const handleExecutePayment = () => {
    if (isFrozen || isOnlineDisabled ||!currentMember) return;
    const activeKey = getValidPaystackKey();

    if (!activeKey) {
      alert('Payment config error: Super Admin has not set a valid Paystack Public Key. Key must start with pk_live_ or pk_test_. Please check Supabase payment_configs table.');
      console.error('NO VALID PAYSTACK KEY FOUND. platformPaymentConfig:', platformPaymentConfig);
      return;
    }

    setProcessing(true);
    const prefix = agentPaymentConfig.customReferencePrefix || 'SUSU-';
    const generatedRef = `${prefix}${generatePaystackReference()}`;
    setPaymentRef(generatedRef);

    initializePaystackCheckout({
      key: activeKey,
      email: currentMember.email || 'member@susu.platform',
      amount: totalAmount,
      currency: group?.currency || 'GHS',
      ref: generatedRef,
      onSuccess: (res: any) => {
        processPayment(currentMember.id, selectedDates, 'paystack', res.reference);
        setProcessing(false);
        setCompleted(true);
      },
      onClose: () => setProcessing(false)
    });
  };

  const handleDone = () => { setCompleted(false); setProcessing(false); onClose(); };

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

        {!completed? (
          <div style={{ padding: '1.5rem' }}>
            {isFrozen && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '0.75rem', borderRadius: '8px', fontSize: '0.8rem', marginBottom: '1rem', fontWeight: 600 }}>Platform Notice: Master emergency payout freeze is active.</div>}
            <div style={{ background: 'var(--color-slate-50)', border: '1px solid var(--color-slate-200)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div><span style={{ fontSize: '0.8rem', color: 'var(--color-slate-600)', display: 'block' }}>Contribution for {daysCount} {daysCount === 1? 'day' : 'days'}</span><span style={{ fontSize: '0.75rem', color: 'var(--color-emerald-700)', fontWeight: 600 }}>{selectedDates.join(', ')}</span></div>
              <div style={{ textAlign: 'right' }}><span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-emerald-950)' }}>{group?.currency}{totalAmount}</span></div>
            </div>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-md)', padding: '0.85rem 1rem', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: 600, color: '#166534' }}><ShieldCheck size={16} color="#16a34a" /> Paystack Secured Checkout</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem', color: '#15803d' }}><span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><CreditCard size={14} /> Cards</span><span>•</span><span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Smartphone size={14} /> Mobile Money</span></div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--color-slate-500)', marginBottom: '1.5rem' }}><Lock size={14} color="var(--color-emerald-600)" /> 256-Bit SSL Encrypted by Paystack</div>
            <button className="btn-gold" onClick={handleExecutePayment} disabled={processing || isFrozen || isOnlineDisabled} style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', fontSize: '1rem', opacity: (isFrozen || isOnlineDisabled)? 0.5 : 1 }}>
              {processing? 'Verifying Transaction...' : <>{`Pay ${group?.currency}${totalAmount} Now`} <ArrowRight size={18} /></>}
            </button>
            <div style={{ marginTop: '0.75rem', fontSize: '0.65rem', color: '#999', textAlign: 'center' }}>Debug Key: {(getValidPaystackKey() || 'NO_KEY').substring(0,25)}... | Env: {platformPaymentConfig.environment}</div>
          </div>
        ) : (
          <div style={{ padding: '2rem 1.5rem', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--color-emerald-100)', color: 'var(--color-emerald-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}><CheckCircle2 size={36} /></div>
            <h3 style={{ fontSize: '1.4rem', color: 'var(--color-emerald-950)', marginBottom: '0.25rem' }}>Payment Successful!</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-slate-600)', marginBottom: '1.25rem' }}>Your daily Susu contribution has been logged.</p>
            <div style={{ background: 'var(--color-slate-100)', borderRadius: 'var(--radius-md)', padding: '1rem', textAlign: 'left', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}><span style={{ color: 'var(--color-slate-500)' }}>Reference:</span><span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{paymentRef}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--color-slate-500)' }}>Amount:</span><span style={{ fontWeight: 700 }}>{group?.currency}{totalAmount}</span></div>
            </div>
            <button className="btn-primary" onClick={handleDone} style={{ width: '100%', justifyContent: 'center' }}>Done & Return</button>
          </div>
        )}
      </div>
    </div>
  );
};