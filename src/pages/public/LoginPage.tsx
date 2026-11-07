import React, { useState } from 'react';
import { useSusu } from '../../context/SusuContext';
import {
  ShieldCheck,
  LogIn,
  Key,
  User as UserIcon,
  Lock,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';

interface LoginPageProps {
  onNavigate: (path: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { setRole, agents, setActiveAgentId, members, loginWithUniqueCode } = useSusu();

  // Unified form state
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleUniversalLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const input = identifier.trim();
    if (!input) {
      setErrorMessage('Please enter your email, username, or member code.');
      return;
    }

    const inputLower = input.toLowerCase();
    const inputUpper = input.toUpperCase();

    // 1. Super Admin Authentication
    const adminEmail = (import.meta.env.VITE_SUPER_ADMIN_EMAIL || 'admin@susu.platform').toLowerCase();
    const adminPass = import.meta.env.VITE_SUPER_ADMIN_INITIAL_PASSWORD || '';
    if (inputLower === adminEmail || inputLower === 'superadmin' || inputLower === 'admin') {
      if (adminPass && password !== adminPass) {
        setErrorMessage('Invalid Super Admin password.');
        return;
      }
      if (!password || password.length < 6) {
        setErrorMessage('Please provide your secure administrator password (min 6 characters).');
        return;
      }
      setRole('super_admin');
      onNavigate('/admin/developer');
      return;
    }

    // 2. Contributing Member Authentication (by Unique Code, Invite Token, or Email)
    const matchingMember = members.find(
      (m) =>
        (m.uniqueCode && m.uniqueCode.toUpperCase() === inputUpper) ||
        (m.inviteToken && m.inviteToken.toLowerCase() === inputLower) ||
        (m.email && m.email.toLowerCase() === inputLower)
    );

    if (matchingMember) {
      setRole('member', matchingMember.id);
      onNavigate('/member/dashboard');
      return;
    }

    if (loginWithUniqueCode(input)) {
      onNavigate('/member/dashboard');
      return;
    }

    // 3. Registered Agent Organizer Authentication
    const matchingAgent = agents.find(
      (a) =>
        (a.email && a.email.toLowerCase() === inputLower) ||
        (a.phone && a.phone.replace(/\s+/g, '') === input.replace(/\s+/g, '')) ||
        (a.firstName && a.firstName.toLowerCase() === inputLower) ||
        (a.licenseNumber && a.licenseNumber.toUpperCase() === inputUpper)
    );

    if (matchingAgent) {
      if (password && password.length < 6) {
        setErrorMessage('Password must be at least 6 characters.');
        return;
      }
      setActiveAgentId(matchingAgent.id);
      setRole('agent');
      if (!matchingAgent.isKycSubmitted) {
        onNavigate('/agent/register-kyc');
      } else if (!matchingAgent.isActivated) {
        onNavigate('/agent/activate');
      } else {
        onNavigate('/agent/dashboard');
      }
      return;
    }

    setErrorMessage(
      'Unrecognized login credentials. Please enter your registered Agent email, Super Admin account, or valid Member unique code.'
    );
  };

  return (

    <div style={{ maxWidth: '480px', margin: '2.5rem auto', padding: '0 1rem' }}>
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
            Sign In to Susu Vault
          </h1>

          <p style={{ fontSize: '0.88rem', color: 'var(--color-slate-600)' }}>
            Enter your credentials to access your working portal
          </p>
        </div>

        {/* Error Notice */}
        {errorMessage && (
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
            <span>{errorMessage}</span>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', margin: '1.25rem 0', color: '#888', fontSize: '0.78rem' }}>
          <div style={{ flex: 1, borderBottom: '1px solid #e2e8f0' }} />
          <span style={{ padding: '0 0.75rem', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>
            Or Sign In with Credentials
          </span>
          <div style={{ flex: 1, borderBottom: '1px solid #e2e8f0' }} />
        </div>

        <form onSubmit={handleUniversalLogin}>
          <div className="form-group">
            <label className="form-label">Email, Username, or Member Code</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
              <UserIcon size={16} style={{ position: 'absolute', right: '12px', top: '14px', color: '#888' }} />
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)', display: 'block', marginTop: '0.3rem' }}>
              Works for Agents, Super Admins, and Contributing Members.
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">Password / Passcode</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                style={{ paddingRight: '2.5rem' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748b',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title={showPassword ? 'Hide password' : 'View password'}
                aria-label={showPassword ? 'Hide password' : 'View password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn-gold"
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '0.85rem',
              fontSize: '1rem',
              marginTop: '1.25rem'
            }}
          >
            <LogIn size={18} /> Sign In to Portal
          </button>
        </form>

        {/* Footer Actions */}
        <div

          style={{
            textAlign: 'center',
            marginTop: '1.75rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--color-slate-200)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            fontSize: '0.85rem',
            color: 'var(--color-slate-600)'
          }}
        >
          <div>
            <span>New Agent Organizer? </span>
            <button
              type="button"
              onClick={() => onNavigate('/signup')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-emerald-800)',
                fontWeight: 700,
                cursor: 'pointer',
                padding: 0
              }}
            >
              Create Susu Group →
            </button>
          </div>

          <div>
            <span>Have a new invitation token or link? </span>
            <button
              type="button"
              onClick={() => onNavigate('/invite')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-emerald-800)',
                fontWeight: 700,
                cursor: 'pointer',
                padding: 0
              }}
            >
              Accept Invite / Enter Token →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
