import React, { useState } from 'react';
import { useSusu } from '../../context/SusuContext';
import {
  ShieldCheck,
  Key,
  Link as LinkIcon,
  ArrowRight,
  AlertCircle,
  Users,
  CheckCircle2
} from 'lucide-react';

interface MemberPortalPageProps {
  onNavigate: (path: string) => void;
  initialTab?: 'token' | 'code';
}

export const MemberPortalPage: React.FC<MemberPortalPageProps> = ({
  onNavigate,
  initialTab = 'token'
}) => {
  const { loginWithUniqueCode, members, group } = useSusu();
  const [activeTab, setActiveTab] = useState<'token' | 'code'>(initialTab);

  // Invite Token Form state
  const [tokenInput, setTokenInput] = useState('');
  const [tokenError, setTokenError] = useState<string | null>(null);

  // Unique Code Form state
  const [uniqueCode, setUniqueCode] = useState('');
  const [codeError, setCodeError] = useState<string | null>(null);

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTokenError(null);

    let cleanToken = tokenInput.trim();
    if (!cleanToken) {
      setTokenError('Please enter or paste your invitation token or link.');
      return;
    }

    // If user pasted a full URL (e.g. http://localhost:5173/invite/invite-xxx)
    if (cleanToken.includes('/invite/')) {
      const parts = cleanToken.split('/invite/');
      cleanToken = parts[parts.length - 1].split('?')[0].split('#')[0];
    }

    // Check if token exists in members list
    const found = members.find(
      (m) => m.inviteToken && m.inviteToken.toLowerCase() === cleanToken.toLowerCase()
    );

    if (found && found.inviteToken) {
      onNavigate(`/invite/${found.inviteToken}`);
    } else {
      // Still navigate to /invite/:token so the InviteAcceptPage handles it gracefully
      onNavigate(`/invite/${cleanToken}`);
    }
  };

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCodeError(null);

    const cleanCode = uniqueCode.trim().toUpperCase();
    if (!cleanCode) {
      setCodeError('Please enter your unique member code.');
      return;
    }

    const success = loginWithUniqueCode(cleanCode);
    if (success) {
      onNavigate('/member/dashboard');
    } else {
      setCodeError(
        'Unrecognized Member Code. Please check the code assigned by your Agent or contact your group organizer.'
      );
    }
  };

  return (

    <div style={{ maxWidth: '520px', margin: '2.5rem auto', padding: '0 1rem' }}>
      <div className="card" style={{ padding: '2.5rem 2rem' }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            className="brand-logo"
            style={{
              display: 'inline-flex',
              background: 'var(--color-emerald-950)',
              padding: '0.65rem',
              borderRadius: '14px',
              marginBottom: '0.75rem',
              border: '1px solid rgba(229, 169, 60, 0.3)'
            }}
          >
            <ShieldCheck size={32} color="#E5A93C" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.35rem', letterSpacing: '-0.02em' }}>
            Member Portal Access
          </h1>

          <p style={{ fontSize: '0.88rem', color: 'var(--color-slate-600)' }}>
            Join your Susu circle with an invitation link or sign in with your unique member code.
          </p>
        </div>

        {/* Tab Selection */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.35rem',
            background: 'var(--color-slate-100)',
            padding: '0.35rem',
            borderRadius: '12px',
            marginBottom: '1.75rem'
          }}
        >
          <button
            type="button"
            className={`role-btn ${activeTab === 'token' ? 'active' : ''}`}
            style={{
              padding: '0.65rem 0.5rem',
              textAlign: 'center',
              fontSize: '0.85rem',
              fontWeight: activeTab === 'token' ? 700 : 600,
              borderRadius: '8px',
              border: activeTab === 'token' ? '1px solid var(--color-gold-600)' : '1px solid var(--color-slate-200)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              backgroundColor: activeTab === 'token' ? 'var(--color-gold-500)' : '#ffffff',
              color: activeTab === 'token' ? 'var(--color-emerald-950)' : 'var(--color-slate-800)',
              boxShadow: activeTab === 'token' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s ease'
            }}
            onClick={() => {
              setActiveTab('token');
              setTokenError(null);
            }}
          >
            <LinkIcon size={15} /> I Have an Invite Token
          </button>

          <button
            type="button"
            className={`role-btn ${activeTab === 'code' ? 'active' : ''}`}
            style={{
              padding: '0.65rem 0.5rem',
              textAlign: 'center',
              fontSize: '0.85rem',
              fontWeight: activeTab === 'code' ? 700 : 600,
              borderRadius: '8px',
              border: activeTab === 'code' ? '1px solid var(--color-gold-600)' : '1px solid var(--color-slate-200)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              backgroundColor: activeTab === 'code' ? 'var(--color-gold-500)' : '#ffffff',
              color: activeTab === 'code' ? 'var(--color-emerald-950)' : 'var(--color-slate-800)',
              boxShadow: activeTab === 'code' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s ease'
            }}
            onClick={() => {
              setActiveTab('code');
              setCodeError(null);
            }}
          >
            <Key size={15} /> Member Unique Code
          </button>
        </div>

        {/* TAB 1: I HAVE AN INVITE TOKEN */}
        {activeTab === 'token' && (
          <div>
            <div
              style={{
                background: 'var(--color-emerald-50)',
                border: '1px solid var(--color-emerald-200)',
                borderRadius: '10px',
                padding: '0.85rem 1rem',
                marginBottom: '1.25rem',
                fontSize: '0.82rem',
                color: 'var(--color-emerald-950)',
                lineHeight: 1.45
              }}
            >
              <div style={{ fontWeight: 800, marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <LinkIcon size={15} /> New Circle Invitation
              </div>
              Paste the invite token or full link sent to you by your Susu group Agent organizer to join the rotation.
            </div>

            {tokenError && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  background: '#fee2e2',
                  border: '1px solid #fca5a5',
                  color: '#dc2626',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{tokenError}</span>
              </div>
            )}

            <form onSubmit={handleTokenSubmit}>
              <div className="form-group">
                <label className="form-label">Paste Invite Token or Link *</label>
                <input
                  type="text"
                  className="form-input"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  style={{
                    fontSize: '0.95rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px'
                  }}
                  required
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)', display: 'block', marginTop: '0.4rem' }}>
                  Your Agent generated this invitation link exclusively for you.
                </span>
              </div>

              <button
                type="submit"

                className="btn-gold"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '0.85rem',
                  fontSize: '1rem',
                  marginTop: '0.5rem'
                }}
              >
                Continue to Accept Invitation <ArrowRight size={18} />
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: UNIQUE MEMBER CODE LOGIN */}
        {activeTab === 'code' && (
          <div>
            <div
              style={{
                background: 'var(--color-gold-100)',
                border: '1px solid var(--color-gold-300)',
                borderRadius: '10px',
                padding: '0.85rem 1rem',
                marginBottom: '1.25rem',
                fontSize: '0.82rem',
                color: 'var(--color-gold-900)',
                lineHeight: 1.45
              }}
            >
              <div style={{ fontWeight: 800, marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Key size={15} /> Existing Member Access
              </div>
              Contributing circle members sign in directly using the <strong>Unique Member Code</strong> assigned by their group Agent.
            </div>

            {codeError && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  background: '#fee2e2',
                  border: '1px solid #fca5a5',
                  color: '#dc2626',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{codeError}</span>
              </div>
            )}

            <form onSubmit={handleCodeSubmit}>
              <div className="form-group">
                <label className="form-label">Enter Your Unique Member Code *</label>
                <input
                  type="text"
                  className="form-input"
                  value={uniqueCode}
                  onChange={(e) => setUniqueCode(e.target.value.toUpperCase())}
                  style={{
                    fontSize: '1.25rem',
                    textAlign: 'center',
                    letterSpacing: '2px',
                    fontWeight: 700,
                    padding: '0.75rem'
                  }}
                  required
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)', display: 'block', marginTop: '0.4rem', textAlign: 'center' }}>
                  Assigned by your Susu group organizer.
                </span>
              </div>

              <button
                type="submit"

                className="btn-primary"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '0.85rem',
                  fontSize: '1rem',
                  marginTop: '0.5rem'
                }}
              >
                Access Member Dashboard <ArrowRight size={18} />
              </button>
            </form>
          </div>
        )}

        {/* Cross Link: Agent / Super Admin */}
        <div
          style={{
            textAlign: 'center',
            marginTop: '2rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--color-slate-200)',
            fontSize: '0.85rem',
            color: 'var(--color-slate-600)'
          }}
        >
          <span>Are you a Susu Agent Organizer or Super Admin? </span>
          <button
            type="button"
            onClick={() => onNavigate('/login')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-emerald-800)',
              fontWeight: 700,
              cursor: 'pointer',
              padding: 0
            }}
          >
            Sign In as Agent / Admin →
          </button>
        </div>
      </div>
    </div>
  );
};
