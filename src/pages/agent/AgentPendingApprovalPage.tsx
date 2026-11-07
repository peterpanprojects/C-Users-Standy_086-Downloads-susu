import React from 'react';
import { useSusu } from '../../context/SusuContext';
import { Clock, ShieldCheck, CheckCircle2, Mail, Phone, ArrowRight, AlertTriangle, XCircle } from 'lucide-react';

interface AgentPendingApprovalPageProps {
  onNavigate: (path: string) => void;
}

export const AgentPendingApprovalPage: React.FC<AgentPendingApprovalPageProps> = ({ onNavigate }) => {
  const { agentAccount } = useSusu();

  const isRejected = agentAccount.adminApprovalStatus === 'rejected';

  return (
    <div style={{ maxWidth: '680px', margin: '3rem auto', padding: '0 1rem 4rem' }}>
      {/* Status Card */}
      <div
        className="card"
        style={{
          padding: '3rem 2rem',
          textAlign: 'center',
          border: isRejected
            ? '2px solid var(--color-danger-400)'
            : '2px solid var(--color-gold-400)',
          background: isRejected
            ? 'linear-gradient(135deg, #fff5f5 0%, #fff 100%)'
            : 'linear-gradient(135deg, #fffbeb 0%, #fff 100%)'
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: '88px',
            height: '88px',
            borderRadius: '50%',
            background: isRejected ? '#fee2e2' : 'var(--color-gold-100)',
            border: `2px solid ${isRejected ? '#dc2626' : 'var(--color-gold-500)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            boxShadow: isRejected
              ? '0 0 24px rgba(220, 38, 38, 0.2)'
              : 'var(--shadow-glow-gold)'
          }}
        >
          {isRejected
            ? <XCircle size={44} color="#dc2626" />
            : <Clock size={44} color="var(--color-gold-600)" />}
        </div>

        {/* Badge */}
        <div
          style={{
            display: 'inline-block',
            background: isRejected ? '#fee2e2' : 'var(--color-gold-100)',
            color: isRejected ? '#dc2626' : 'var(--color-gold-800)',
            padding: '0.25rem 1rem',
            borderRadius: '999px',
            fontSize: '0.72rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.07em',
            marginBottom: '0.75rem'
          }}
        >
          {isRejected ? 'Application Rejected' : 'Pending Admin Review'}
        </div>

        <h1 style={{ fontSize: '2rem', marginBottom: '0.75rem', color: 'var(--color-emerald-950)' }}>
          {isRejected
            ? 'KYC Verification Rejected'
            : 'KYC Submitted — Awaiting Admin Approval'}
        </h1>

        <p style={{ color: 'var(--color-slate-600)', fontSize: '0.95rem', maxWidth: '520px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
          {isRejected ? (
            <>
              Your KYC application was reviewed and <strong>not approved</strong>. Please review the reason below and contact support to re-submit.
            </>
          ) : (
            <>
              Your registration form and payment have been received. Our compliance team will verify your identity and business details within <strong>24–48 hours</strong>. You will be notified once approved.
            </>
          )}
        </p>

        {/* Rejection Reason */}
        {isRejected && agentAccount.adminReviewNotes && (
          <div
            style={{
              background: '#fee2e2',
              border: '1px solid #fca5a5',
              borderRadius: '12px',
              padding: '1rem 1.25rem',
              marginBottom: '1.5rem',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', color: '#dc2626', fontWeight: 700, fontSize: '0.85rem' }}>
              <AlertTriangle size={16} /> Rejection Reason:
            </div>
            <p style={{ margin: 0, color: '#7f1d1d', fontSize: '0.9rem', lineHeight: 1.5 }}>
              {agentAccount.adminReviewNotes}
            </p>
          </div>
        )}

        {/* 4-Step Progress */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '0.75rem',
            textAlign: 'left',
            background: 'var(--color-slate-50)',
            padding: '1.25rem',
            borderRadius: '14px',
            border: '1px solid var(--color-slate-200)',
            marginBottom: '2rem'
          }}
        >
          {[
            { label: 'Account Created', done: true },
            { label: 'KYC Submitted', done: agentAccount.isKycSubmitted },
            { label: 'Payment Made', done: agentAccount.isActivated },
            { label: 'Admin Verified', done: agentAccount.adminApprovalStatus === 'verified', pending: !isRejected && agentAccount.adminApprovalStatus === 'pending_admin_approval', rejected: isRejected }
          ].map((step, i) => (
            <div key={i} style={{ borderRight: i < 3 ? '1px dashed var(--color-slate-300)' : 'none', paddingRight: i < 3 ? '0.5rem' : 0 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                color: step.done
                  ? 'var(--color-emerald-700)'
                  : step.rejected
                    ? '#dc2626'
                    : step.pending
                      ? 'var(--color-gold-700)'
                      : 'var(--color-slate-400)',
                fontWeight: 700,
                fontSize: '0.72rem',
                marginBottom: '0.2rem'
              }}>
                {step.done
                  ? <CheckCircle2 size={14} />
                  : step.rejected
                    ? <XCircle size={14} />
                    : step.pending
                      ? <Clock size={14} />
                      : <Clock size={14} />}
                Step {i + 1}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-slate-600)', lineHeight: 1.3 }}>
                {step.label}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {isRejected ? (
            <>
              <button
                className="btn-gold"
                style={{ padding: '0.85rem 2rem' }}
                onClick={() => onNavigate('/agent/register-kyc')}
              >
                Re-Submit KYC <ArrowRight size={16} />
              </button>
              <button
                className="btn-outline"
                style={{ padding: '0.85rem 1.5rem' }}
                onClick={() => onNavigate('/')}
              >
                Return to Home
              </button>
            </>
          ) : (
            <button
              className="btn-outline"
              style={{ padding: '0.85rem 1.75rem' }}
              onClick={() => onNavigate('/')}
            >
              Return to Home
            </button>
          )}
        </div>
      </div>

      {/* Info Note */}
      {!isRejected && (
        <div
          style={{
            marginTop: '1.5rem',
            background: 'var(--color-slate-50)',
            border: '1px solid var(--color-slate-200)',
            borderRadius: '12px',
            padding: '1.25rem 1.5rem'
          }}
        >
          <h4 style={{ fontSize: '0.9rem', color: 'var(--color-emerald-900)', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={16} color="var(--color-emerald-600)" /> What happens next?
          </h4>
          <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--color-slate-600)', fontSize: '0.85rem', lineHeight: 1.75 }}>
            <li>Our compliance team reviews your uploaded ID, selfie, and business certificate.</li>
            <li>Once verified, your agent license number is issued and privileges are unlocked.</li>
            <li>You will receive an SMS and email confirmation when approved.</li>
            <li>For support, contact: <strong style={{ color: 'var(--color-emerald-800)' }}>support@susu.gh</strong> or call <strong>+233 30 295 7700</strong></li>
          </ul>
        </div>
      )}
    </div>
  );
};
