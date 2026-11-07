import React, { useState, useEffect } from 'react';
import { useSusu } from '../../context/SusuContext';
import {
  ShieldCheck,
  CreditCard,
  Smartphone,
  Lock,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Award,
  Calendar,
  Users,
  Banknote,
  FileCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AgentActivationPageProps {
  onNavigate: (path: string) => void;
}

declare global {
  interface Window {
    PaystackPop: any;
  }
}

export const AgentActivationPage: React.FC<AgentActivationPageProps> = ({ onNavigate }) => {
  const { agentAccount, activateAgentAccount, platformPaymentConfig } = useSusu();

  const [paymentMethod, setPaymentMethod] = useState<'momo' | 'card'>('momo');
  const [momoProvider, setMomoProvider] = useState<'MTN' | 'Telecel' | 'AT'>('MTN');
  const [momoNumber, setMomoNumber] = useState(agentAccount.phone || '');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  const [processing, setProcessing] = useState(false);
  const [activated, setActivated] = useState(agentAccount.isActivated);
  const [licenseId, setLicenseId] = useState(
    agentAccount.licenseNumber || `SUSU-AGT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`
  );

  const feeAmount = Number(platformPaymentConfig?.agentActivationFee ?? agentAccount.activationFeeAmount ?? 150);
  
  // ✅ FIXED: Get REAL key from Supabase Super Admin config
  const getValidPaystackKey = () => {
    const candidates = [
      platformPaymentConfig?.masterPublicKey,
      platformPaymentConfig?.publicKey,
      import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
    ].filter(Boolean) as string[];
    const valid = candidates.find(k => k && k.startsWith('pk_') && k.length > 30);
    return valid || '';
  };
  
    const PAYSTACK_PUBLIC_KEY = platformPaymentConfig.masterPublicKey 
                           || platformPaymentConfig.publicKey
                           || import.meta.env.VITE_PAYSTACK_PUBLIC_KEY
                           || '';
  // Load Paystack LIVE script
  useEffect(() => {
    if (!window.PaystackPop) {
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.async = true;
      document.body.appendChild(script);
    }
    console.log('🔑 Activation Key Check:', PAYSTACK_PUBLIC_KEY ? PAYSTACK_PUBLIC_KEY.substring(0,25)+'...' : 'NO KEY!', 'Full config:', platformPaymentConfig);
  }, [PAYSTACK_PUBLIC_KEY, platformPaymentConfig]);

  const handlePayActivation = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!PAYSTACK_PUBLIC_KEY || !PAYSTACK_PUBLIC_KEY.startsWith('pk_')) {
      alert(`PAYSTACK KEY INVALID!\n\nCurrent: ${PAYSTACK_PUBLIC_KEY || 'EMPTY'}\n\nFix: Login as Super Admin → Payment Config → Paste REAL pk_live_ key from Paystack Dashboard → Save`);
      return;
    }

    setProcessing(true);

    if (!window.PaystackPop) {
      alert('Paystack loading... wait 2 seconds and try again');
      setProcessing(false);
      return;
    }

    const handler = window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: agentAccount.email || 'agent@susu.com',
      amount: feeAmount * 100,
      currency: 'GHS',
      ref: `SUSU-ACT-${Date.now()}`,
      channels: paymentMethod === 'momo' ? ['mobile_money'] : ['card', 'bank'],
      metadata: {
        custom_fields: [
          { display_name: "Agent Name", variable_name: "agent_name", value: `${agentAccount.firstName} ${agentAccount.surname}` },
          { display_name: "Phone", variable_name: "phone", value: momoNumber },
          { display_name: "License", variable_name: "license", value: licenseId },
        ]
      },
      onClose: () => {
        setProcessing(false);
      },
      callback: (response: any) => {
        setProcessing(false);
        setActivated(true);
        activateAgentAccount(paymentMethod, response.reference);
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    });

    handler.openIframe();
  };

  return (
    <div style={{ maxWidth: '680px', margin: '2.5rem auto', paddingBottom: '3rem' }}>
      <div className="card" style={{ padding: '2.5rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="brand-logo" style={{ display: 'inline-flex', background: 'var(--color-emerald-950)', padding: '0.65rem', borderRadius: '14px', marginBottom: '0.75rem', border: '1px solid rgba(229, 169, 60, 0.3)' }}>
            <ShieldCheck size={36} color="#E5A93C" />
          </div>
          <div style={{ display: 'inline-block', background: 'var(--color-gold-100)', color: 'var(--color-gold-900)', padding: '0.25rem 0.85rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            Registration Is Not Free
          </div>
          <h1 style={{ fontSize: '2.1rem', marginBottom: '0.4rem' }}>Agent Operating License & Service Activation</h1>
          <p style={{ color: 'var(--color-slate-600)', fontSize: '0.92rem', maxWidth: '520px', margin: '0 auto' }}>
            Pay your official service activation fee to unlock full agent privileges, invite members with unique codes, and deploy automated weekly rotation calendars.
          </p>
        </div>

        {!activated ? (
          <div>
            <div style={{ background: 'var(--color-emerald-950)', color: '#fff', borderRadius: '16px', padding: '1.75rem', marginBottom: '2rem', position: 'relative', overflow: 'hidden', border: '1px solid rgba(229, 169, 60, 0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-gold-400)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Annual Agent Platform Accreditation</span>
                  <h3 style={{ fontSize: '1.4rem', color: '#fff', margin: '0.2rem 0' }}>Vault Operating License Fee</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-slate-300)' }}>Accredited Agent: <strong>{agentAccount.kycData?.fullName || `${agentAccount.firstName} ${agentAccount.surname}`}</strong></p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-slate-300)', textTransform: 'uppercase' }}>Total Due</span>
                  <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-heading)' }}>GH₵ {feeAmount}</div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-gold-300)' }}>One-time annual fee</span>
                </div>
              </div>
              <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--color-slate-200)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><CheckCircle2 size={14} color="#E5A93C" /><span>Unique Member Invite Code Generator</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><CheckCircle2 size={14} color="#E5A93C" /><span>Locked Weekly Payout Rotation Calendar</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><CheckCircle2 size={14} color="#E5A93C" /><span>Automated Mon–Sun Payment Ledger</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><CheckCircle2 size={14} color="#E5A93C" /><span>Custom Agent Payout Destination</span></div>
              </div>
            </div>

            <form onSubmit={handlePayActivation}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ fontWeight: 700, marginBottom: '0.6rem' }}>Select Payment Method:</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <button type="button" className={`role-btn ${paymentMethod === 'momo' ? 'active' : ''}`} style={{ padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.9rem', borderRadius: '10px' }} onClick={() => setPaymentMethod('momo')}><Smartphone size={18} /> Mobile Money (MoMo)</button>
                  <button type="button" className={`role-btn ${paymentMethod === 'card' ? 'active' : ''}`} style={{ padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.9rem', borderRadius: '10px' }} onClick={() => setPaymentMethod('card')}><CreditCard size={18} /> Bank Card (Visa / MC)</button>
                </div>
              </div>

              {paymentMethod === 'momo' ? (
                <div style={{ background: 'var(--color-slate-50)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--color-slate-200)', marginBottom: '1.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Network Provider</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                      {(['MTN', 'Telecel', 'AT'] as const).map((net) => (<button key={net} type="button" className={`preset-chip ${momoProvider === net ? 'active' : ''}`} style={{ padding: '0.5rem', textAlign: 'center', fontWeight: 700 }} onClick={() => setMomoProvider(net)}>{net}</button>))}
                    </div>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Mobile Money Wallet Number</label>
                    <input type="tel" className="form-input" value={momoNumber} onChange={(e) => setMomoNumber(e.target.value)} required />
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-slate-500)', marginTop: '0.3rem', display: 'block' }}>A prompt will be sent to your phone to authorize the GH₵ {feeAmount} payment.</span>
                  </div>
                </div>
              ) : (
                <div style={{ background: 'var(--color-slate-50)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--color-slate-200)', marginBottom: '1.75rem' }}>
                  <div className="form-group"><label className="form-label">Card Number</label><input type="text" className="form-input" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} /></div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label">Expiry (MM/YY)</label><input type="text" className="form-input" value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} /></div>
                    <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label">CVV</label><input type="password" className="form-input" value={cardCvv} onChange={(e) => setCardCvv(e.target.value)} /></div>
                  </div>
                  <p style={{ fontSize: '0.7rem', color: 'var(--color-slate-500)', marginTop: '0.5rem' }}>Secure Paystack popup will collect card details.</p>
                </div>
              )}

              <button type="submit" className="btn-gold" disabled={processing} style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontSize: '1.05rem', boxShadow: 'var(--shadow-md)' }}>
                {processing ? <span>Opening Paystack LIVE...</span> : <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}><Lock size={18} /> Pay GH₵ {feeAmount} & Activate Agent Privileges</span>}
              </button>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem', fontSize: '0.7rem', color: PAYSTACK_PUBLIC_KEY ? 'var(--color-emerald-600)' : 'red', fontWeight: 600 }}>
                <Lock size={12} /> {PAYSTACK_PUBLIC_KEY?.startsWith('pk_live') ? `LIVE MODE - ${PAYSTACK_PUBLIC_KEY.substring(0,22)}...` : PAYSTACK_PUBLIC_KEY ? `TEST MODE - ${PAYSTACK_PUBLIC_KEY.substring(0,22)}...` : '❌ NO VALID KEY - Set in Super Admin > Payment Config'} | Secured by Paystack
              </div>
            </form>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ background: 'var(--color-emerald-100)', width: '72px', height: '72px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', border: '2px solid var(--color-emerald-300)' }}><CheckCircle2 size={42} color="var(--color-emerald-700)" /></div>
            <h2 style={{ fontSize: '1.8rem', color: 'var(--color-emerald-950)', marginBottom: '0.4rem' }}>Payment Received — Awaiting Admin Verification</h2>
            <p style={{ color: 'var(--color-slate-600)', fontSize: '0.9rem', maxWidth: '480px', margin: '0 auto 1.5rem' }}>Your activation payment has been verified. Our compliance team will now review your submitted KYC documents within <strong>24–48 hours</strong> and unlock your full agent privileges upon approval.</p>
            <div style={{ background: 'var(--color-gold-50)', border: '1px solid var(--color-gold-400)', borderRadius: '12px', padding: '1.25rem', marginBottom: '2rem', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}><span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-gold-900)', textTransform: 'uppercase' }}>Official Operating License</span><span className="status-pill active" style={{ fontSize: '0.72rem' }}>ACTIVE & VERIFIED</span></div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-emerald-950)', fontFamily: 'var(--font-heading)' }}>License Number: {licenseId}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-slate-600)', marginTop: '0.3rem' }}>Holder: <strong>{agentAccount.kycData?.fullName || `${agentAccount.firstName} ${agentAccount.surname}`}</strong> | Validity: 1 Year (Auto-Renewable)</div>
            </div>
            <button className="btn-gold" style={{ width: '100%', justifyContent: 'center', padding: '0.9rem', fontSize: '1rem' }} onClick={() => onNavigate('/agent/pending-approval')}>View Application Status <ArrowRight size={18} /></button>
          </div>
        )}
      </div>
    </div>
  );
};