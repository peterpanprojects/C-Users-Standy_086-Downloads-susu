import React, { useState } from 'react';
import { useSusu } from '../../context/SusuContext';
import { UserRole } from '../../types/susu';
import { X } from 'lucide-react';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
  mode?: 'signin' | 'signup';
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  mode = 'signin'
}) => {
  const { setRole, members } = useSusu();
  const [customEmail, setCustomEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successAccount, setSuccessAccount] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectAccount = (role: UserRole, email: string, memberId?: string, isDevAdmin?: boolean) => {
    setIsLoading(true);
    setSuccessAccount(email);

    setTimeout(() => {
      setIsLoading(false);
      if (isDevAdmin || role === 'super_admin') {
        setRole('super_admin');
        onClose();
        onNavigate('/admin/developer');
      } else if (role === 'agent') {
        setRole('agent');
        onClose();
        onNavigate('/agent/dashboard');
      } else {
        setRole('member', memberId || members[0]?.id || '');
        onClose();
        onNavigate('/member/dashboard');
      }
    }, 600);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail) return;
    if (customEmail.toLowerCase().includes('peterpan') || customEmail.toLowerCase().includes('admin')) {
      handleSelectAccount('super_admin', customEmail, undefined, true);
    } else if (customEmail.toLowerCase().includes('agent')) {
      handleSelectAccount('agent', customEmail);
    } else {
      handleSelectAccount('member', customEmail, members[0]?.id || '');
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 3000 }}>
      <div className="modal-content" style={{ maxWidth: '420px', padding: '2rem' }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            right: '16px',
            top: '16px',
            background: 'transparent',
            color: '#666',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>

        {/* Google Header Logo */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" style={{ display: 'inline-block', marginBottom: '0.5rem' }}>
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <h3 style={{ fontSize: '1.4rem', color: '#1f1f1f', fontWeight: 600 }}>
            {mode === 'signup' ? 'Sign up with Google' : 'Choose a Google Account'}
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#5f6368', marginTop: '0.25rem' }}>
            to continue to <strong style={{ color: 'var(--color-emerald-950)' }}>Susu Savings Vault</strong>
          </p>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                border: '3px solid #e0e0e0',
                borderTopColor: '#4285F4',
                borderRadius: '50%',
                margin: '0 auto 1rem'
              }}
            />
            <p style={{ fontSize: '0.9rem', color: '#3c4043' }}>Authenticating {successAccount}...</p>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
              {/* Dynamic Enrolled Members */}
              {members.slice(0, 3).map((mem) => (
                <button
                  key={mem.id}
                  type="button"
                  onClick={() => handleSelectAccount('member', mem.email, mem.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.85rem',
                    padding: '0.85rem 1rem',
                    border: '1px solid #dadce0',
                    borderRadius: '10px',
                    background: '#fff',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'var(--color-slate-200)',
                      color: 'var(--color-slate-800)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '0.95rem'
                    }}
                  >
                    {mem.name.charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#202124' }}>{mem.name}</div>
                    <div style={{ fontSize: '0.78rem', color: '#5f6368' }}>{mem.email}</div>
                  </div>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      background: 'var(--color-slate-100)',
                      color: 'var(--color-slate-700)',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      fontWeight: 700
                    }}
                  >
                    Member
                  </span>
                </button>
              ))}
            </div>

            <div style={{ borderTop: '1px solid #e0e0e0', paddingTop: '1rem', marginTop: '1rem' }}>
              <form onSubmit={handleCustomSubmit}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#3c4043', display: 'block', marginBottom: '0.4rem' }}>
                  Use another @gmail.com account
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="email"
                    className="form-input"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    style={{ fontSize: '0.85rem', padding: '0.5rem 0.75rem' }}
                  />
                  <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                    Continue
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
