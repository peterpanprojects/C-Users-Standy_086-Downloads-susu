import React, { useState } from 'react';
import { useSusu } from '../../context/SusuContext';
import { ShieldCheck, ArrowRight, ArrowLeft, Lock, Key, Mail, User, Phone, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface SignupPageProps {
  onNavigate: (path: string) => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({ onNavigate }) => {
  const { setRole, createAgent } = useSusu();

  // Step 1: Form credentials
  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // No OTP step: proceed directly after initial validation

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!firstName.trim() || !surname.trim()) {
      setErrorMsg('Please provide both first name and surname.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    // Create new distinct agent record into context
    createAgent({
      firstName: firstName.trim(),
      surname: surname.trim(),
      email: email.trim(),
      phone: phone.trim(),
      isOtpVerified: true,
      isKycSubmitted: false,
      isActivated: false,
      adminApprovalStatus: 'none',
      kycData: {
        fullName: `${firstName.trim()} ${surname.trim()}`,
        dob: '',
        cityCountry: 'Accra, Ghana',
        gender: 'male',
        idCardType: 'ecowas_card',
        idCardNumber: '',
        digitalAddress: '',
        residentialAddress: '',
        occupation: '',
        maritalStatus: 'single',
        status: 'pending_verification'
      }
    });

    setRole('agent');
    onNavigate('/agent/register-kyc');
  };


  return (
    <div style={{ maxWidth: '520px', width: '100%', margin: '1rem auto 2.5rem' }}>
      <button
        type="button"
        onClick={() => onNavigate('/')}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--color-slate-600)',
          fontSize: '0.86rem',
          fontWeight: 600,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          cursor: 'pointer',
          padding: '0.4rem 0.5rem',
          marginBottom: '1rem',
          borderRadius: '8px',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-emerald-950)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-slate-600)')}
      >
        <ArrowLeft size={16} /> Back to Home
      </button>

      <div className="card" style={{ padding: '2.5rem 2rem' }}>
        {/* Header Icon & Title */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
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
          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Agent Organizer Sign Up
          </h2>

          <p style={{ fontSize: '0.85rem', color: 'var(--color-slate-600)', marginTop: '0.3rem' }}>
            Create an Agent administrator account to organize and manage community Susu groups.
          </p>
        </div>

        {/* Explicit Rule Banner: Only Agents can sign up or login */}
        <div
          style={{
            background: 'var(--color-emerald-50)',
            border: '1px solid var(--color-emerald-200)',
            borderRadius: '10px',
            padding: '0.85rem 1rem',
            marginBottom: '1.5rem',
            fontSize: '0.82rem',
            color: 'var(--color-emerald-950)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.6rem',
            lineHeight: 1.45
          }}
        >
          <Lock size={16} color="var(--color-emerald-700)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Notice: Only Agents can sign up or login.</strong>
            <br />
            Contributing group members access their savings portal strictly using unique invite codes issued by their Agent.
          </div>
        </div>

        {errorMsg && (
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
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', margin: '1rem 0 1.25rem', color: '#888', fontSize: '0.8rem' }}>
          <div style={{ flex: 1, borderBottom: '1px solid #e0e0e0' }} />
          <span style={{ padding: '0 0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>
            Or sign up with credentials
          </span>
          <div style={{ flex: 1, borderBottom: '1px solid #e0e0e0' }} />
        </div>

        <form onSubmit={handleInitialSubmit}>
              {/* 1. First Name & 2. Surname */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">First Name *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      className="form-input"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                    <User size={15} style={{ position: 'absolute', right: '12px', top: '13px', color: '#999' }} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Surname *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      className="form-input"
                      value={surname}
                      onChange={(e) => setSurname(e.target.value)}
                      required
                    />
                    <User size={15} style={{ position: 'absolute', right: '12px', top: '13px', color: '#999' }} />
                  </div>
                </div>
              </div>

              {/* 3. Email Address */}
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <Mail size={16} style={{ position: 'absolute', right: '12px', top: '13px', color: '#999' }} />
                </div>
              </div>

              {/* Phone number */}
              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="tel"
                    className="form-input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                  <Phone size={16} style={{ position: 'absolute', right: '12px', top: '13px', color: '#999' }} />
                </div>
              </div>

              {/* 4. Password & 5. Confirm Password */}
              <div className="form-group">
                <label className="form-label">Password * (minimum 6 characters)</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    style={{ paddingRight: '2.5rem' }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
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

              <div className="form-group">
                <label className="form-label">Confirm Password *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="form-input"
                    style={{ paddingRight: '2.5rem' }}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                    title={showConfirmPassword ? 'Hide password' : 'View password'}
                    aria-label={showConfirmPassword ? 'Hide password' : 'View password'}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
                  marginTop: '1.25rem',
                  fontSize: '0.98rem'
                }}
              >
                Create account & proceed <ArrowRight size={18} />
              </button>
            </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--color-slate-200)' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-slate-600)' }}>
            Already have an Agent account?{' '}
          </span>
          <button
            type="button"
            onClick={() => onNavigate('/login')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-emerald-700)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            Sign In Here
          </button>
        </div>
      </div>

    </div>
  );
};
