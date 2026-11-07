import React from 'react';
import { useSusu } from '../../context/SusuContext';
import {
  Lock,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Users,
  Calendar,
  CreditCard,
  Sliders,
  FileSpreadsheet,
  Banknote,
  AlertTriangle,
  Key
} from 'lucide-react';

interface AgentLockedPageProps {
  onNavigate: (path: string) => void;
}

export const AgentLockedPage: React.FC<AgentLockedPageProps> = ({ onNavigate }) => {
  const { agentAccount, platformPaymentConfig } = useSusu();

  const activationFee = Number(platformPaymentConfig?.agentActivationFee ?? agentAccount.activationFeeAmount ?? 150);
  const isKycPending = !agentAccount.isKycSubmitted;
  const isActivationPending = agentAccount.isKycSubmitted && !agentAccount.isActivated;

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', paddingBottom: '3rem' }}>
      {/* Lock Notice Banner */}
      <div className="card" style={{ padding: '2.5rem 2rem', textAlign: 'center', marginBottom: '2rem' }}>
        <div
          style={{
            width: '76px',
            height: '76px',
            borderRadius: '50%',
            background: 'var(--color-gold-100)',
            border: '2px solid var(--color-gold-500)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
            boxShadow: 'var(--shadow-glow-gold)'
          }}
        >
          <Lock size={38} color="var(--color-gold-900)" />
        </div>

        <div
          style={{
            display: 'inline-block',
            background: 'var(--color-danger-100)',
            color: 'var(--color-danger-600)',
            padding: '0.25rem 0.85rem',
            borderRadius: '999px',
            fontSize: '0.75rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '0.6rem'
          }}
        >
          Access Restricted
        </div>

        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem', color: 'var(--color-emerald-950)' }}>
          All Agent Privileges Are Locked
        </h1>

        <p style={{ color: 'var(--color-slate-600)', fontSize: '0.95rem', maxWidth: '580px', margin: '0 auto 1.75rem', lineHeight: 1.55 }}>
          In accordance with community banking compliance, <strong>all agent privileges are locked unless after official registration and paid service activation</strong>.
        </p>

        {/* 4-Step Progress Checklist */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1rem',
            textAlign: 'left',
            background: 'var(--color-slate-50)',
            padding: '1.25rem',
            borderRadius: '14px',
            border: '1px solid var(--color-slate-200)',
            marginBottom: '2rem'
          }}
        >
          {/* Step 1 */}
          <div style={{ borderRight: '1px dashed var(--color-slate-300)', paddingRight: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-emerald-700)', fontWeight: 700, fontSize: '0.8rem', marginBottom: '0.25rem' }}>
              <CheckCircle2 size={16} /> Step 1: Account Created
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-600)' }}>
              Agent login credentials &amp; OTP verified.
            </div>
          </div>

          {/* Step 2 */}
          <div style={{ borderRight: '1px dashed var(--color-slate-300)', paddingRight: '0.75rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: agentAccount.isKycSubmitted ? 'var(--color-emerald-700)' : 'var(--color-gold-700)',
                fontWeight: 700,
                fontSize: '0.8rem',
                marginBottom: '0.25rem'
              }}
            >
              {agentAccount.isKycSubmitted ? <CheckCircle2 size={16} /> : <Clock size={16} />}
              Step 2: KYC Registration
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-600)' }}>
              {agentAccount.isKycSubmitted ? 'KYC form submitted ✓' : 'Pending: Official identity & biometric registration.'}
            </div>
          </div>

          {/* Step 3 */}
          <div style={{ borderRight: '1px dashed var(--color-slate-300)', paddingRight: '0.75rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: agentAccount.isActivated ? 'var(--color-emerald-700)' : 'var(--color-danger-600)',
                fontWeight: 700,
                fontSize: '0.8rem',
                marginBottom: '0.25rem'
              }}
            >
              {agentAccount.isActivated ? <CheckCircle2 size={16} /> : <Lock size={16} />}
              Step 3: Paid Activation
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-600)' }}>
              {agentAccount.isActivated ? 'Activation fee paid ✓' : `Registration is not free. (GH₵ ${activationFee})`}
            </div>
          </div>

          {/* Step 4 */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: agentAccount.adminApprovalStatus === 'verified'
                  ? 'var(--color-emerald-700)'
                  : 'var(--color-slate-400)',
                fontWeight: 700,
                fontSize: '0.8rem',
                marginBottom: '0.25rem'
              }}
            >
              {agentAccount.adminApprovalStatus === 'verified'
                ? <CheckCircle2 size={16} />
                : <ShieldAlert size={16} />}
              Step 4: Admin Verification
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-600)' }}>
              {agentAccount.adminApprovalStatus === 'verified'
                ? 'KYC verified by Admin ✓'
                : 'Admin must review &amp; confirm your identity.'}
            </div>
          </div>
        </div>

        {/* Primary Call to Action Button */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {isKycPending ? (
            <button
              className="btn-gold"
              style={{ padding: '0.9rem 2rem', fontSize: '1rem' }}
              onClick={() => onNavigate('/agent/register-kyc')}
            >
              Complete 13-Field Registration Form <ArrowRight size={18} />
            </button>
          ) : (
            <button
              className="btn-gold"
              style={{ padding: '0.9rem 2rem', fontSize: '1rem' }}
              onClick={() => onNavigate('/agent/activate')}
            >
              Pay Service Activation Fee (GH₵ {activationFee}) <ArrowRight size={18} />
            </button>
          )}

          <button
            className="btn-outline"
            style={{ padding: '0.9rem 1.5rem', fontSize: '0.9rem' }}
            onClick={() => onNavigate('/')}
          >
            Return to Home
          </button>
        </div>
      </div>

      {/* Grid of Locked Privileges */}
      <div className="card" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--color-emerald-950)' }}>
          Privileges Locked Until Registration &amp; Activation:
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-slate-600)', marginBottom: '1.5rem' }}>
          The following core agent privileges remain locked until your account is verified and licensed:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              padding: '1rem',
              borderRadius: '10px',
              background: 'var(--color-slate-50)',
              border: '1px solid var(--color-slate-200)',
              opacity: 0.85
            }}
          >
            <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.4rem', borderRadius: '8px' }}>
              <Lock size={18} />
            </div>
            <div>
              <strong style={{ fontSize: '0.9rem', color: 'var(--color-slate-800)', display: 'block' }}>
                Member Invites &amp; Unique Codes
              </strong>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-slate-500)' }}>
                Cannot generate secret login codes or enroll members into rotation circles.
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              padding: '1rem',
              borderRadius: '10px',
              background: 'var(--color-slate-50)',
              border: '1px solid var(--color-slate-200)',
              opacity: 0.85
            }}
          >
            <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.4rem', borderRadius: '8px' }}>
              <Lock size={18} />
            </div>
            <div>
              <strong style={{ fontSize: '0.9rem', color: 'var(--color-slate-800)', display: 'block' }}>
                Weekly Rotation Calendar
              </strong>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-slate-500)' }}>
                Cannot schedule or reorder the weekly distribution calendar table.
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              padding: '1rem',
              borderRadius: '10px',
              background: 'var(--color-slate-50)',
              border: '1px solid var(--color-slate-200)',
              opacity: 0.85
            }}
          >
            <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.4rem', borderRadius: '8px' }}>
              <Lock size={18} />
            </div>
            <div>
              <strong style={{ fontSize: '0.9rem', color: 'var(--color-slate-800)', display: 'block' }}>
                Set Susu Amount &amp; Group Rules
              </strong>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-slate-500)' }}>
                Cannot configure fixed daily contribution amounts, currency, or start dates.
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              padding: '1rem',
              borderRadius: '10px',
              background: 'var(--color-slate-50)',
              border: '1px solid var(--color-slate-200)',
              opacity: 0.85
            }}
          >
            <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.4rem', borderRadius: '8px' }}>
              <Lock size={18} />
            </div>
            <div>
              <strong style={{ fontSize: '0.9rem', color: 'var(--color-slate-800)', display: 'block' }}>
                Agent Payment Setup
              </strong>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-slate-500)' }}>
                Cannot link receiving Mobile Money or bank payout accounts.
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              padding: '1rem',
              borderRadius: '10px',
              background: 'var(--color-slate-50)',
              border: '1px solid var(--color-slate-200)',
              opacity: 0.85
            }}
          >
            <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.4rem', borderRadius: '8px' }}>
              <Lock size={18} />
            </div>
            <div>
              <strong style={{ fontSize: '0.9rem', color: 'var(--color-slate-800)', display: 'block' }}>
                Audit Ledger &amp; Cash Override
              </strong>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-slate-500)' }}>
                Cannot log manual cash overrides or access member contribution transactions.
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              padding: '1rem',
              borderRadius: '10px',
              background: 'var(--color-slate-50)',
              border: '1px solid var(--color-slate-200)',
              opacity: 0.85
            }}
          >
            <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.4rem', borderRadius: '8px' }}>
              <Lock size={18} />
            </div>
            <div>
              <strong style={{ fontSize: '0.9rem', color: 'var(--color-slate-800)', display: 'block' }}>
                Financial Reporting &amp; CSV Export
              </strong>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-slate-500)' }}>
                Cannot generate cycle financial statements or export accounting data.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
