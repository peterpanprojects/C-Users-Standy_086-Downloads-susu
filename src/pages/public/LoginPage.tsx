import React, { useState } from 'react';
import { useSusu } from '../../context/SusuContext';
import { ShieldCheck, LogIn, AlertCircle, User as UserIcon, Eye, EyeOff } from 'lucide-react';

interface LoginPageProps { onNavigate: (path: string) => void; }

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { setRole, setActiveAgentId, updateAgentAccount, members, loginWithUniqueCode } = useSusu();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const sendAgentSignInLink = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    const email = identifier.trim().toLowerCase();
    if (!email.includes('@')) {
      setErrorMessage('Enter the email address linked to your agent account.');
      return;
    }

    setLoading(true);
    try {
      const { supabase } = await import('../../services/db');
      if (!supabase) throw new Error('Supabase is not configured.');
      const { data: agent, error: lookupError } = await supabase
        .from('agent_accounts')
        .select('id')
        .eq('email', email)
        .maybeSingle();
      if (lookupError) throw lookupError;
      if (!agent) throw new Error('No agent profile was found for this email.');

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
          shouldCreateUser: true
        }
      });
      if (error) throw error;
      setSuccessMessage('A secure sign-in link has been sent. Open it on this device to restore your agent session.');
    } catch (error) {
      console.error('Unable to send agent sign-in link:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Unable to send a sign-in link.');
    } finally {
      setLoading(false);
    }
  };

  const handleUniversalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    const input = identifier.trim();
    if (!input) {
      setErrorMessage('Please enter your email, username, or member code.');
      setLoading(false); return;
    }

    const inputLower = input.toLowerCase();
    const inputUpper = input.toUpperCase();

    // 1. Super Admin
    const adminEmail = (import.meta.env.VITE_SUPER_ADMIN_EMAIL || 'admin@susu.platform').toLowerCase();
    const adminPass = import.meta.env.VITE_SUPER_ADMIN_INITIAL_PASSWORD || '';
    if (inputLower === adminEmail || inputLower === 'superadmin' || inputLower === 'admin') {
      if (adminPass && password !== adminPass) {
        setErrorMessage('Invalid Super Admin password.');
        setLoading(false); return;
      }
      if (!password || password.length < 6) {
        setErrorMessage('Please provide your secure administrator password (min 6 characters).');
        setLoading(false); return;
      }
      setRole('super_admin');
      onNavigate('/admin/developer');
      setLoading(false); return;
    }

    // 2. Member - check local + try Supabase uniqueCode
    const matchingMember = members.find(
      (m) =>
        (m.uniqueCode && m.uniqueCode.toUpperCase() === inputUpper) ||
        (m.inviteToken && m.inviteToken.toLowerCase() === inputLower) ||
        (m.email && m.email.toLowerCase() === inputLower)
    );
    if (matchingMember) {
      setRole('member', matchingMember.id);
      onNavigate('/member/dashboard');
      setLoading(false); return;
    }
    if (loginWithUniqueCode(input)) {
      onNavigate('/member/dashboard');
      setLoading(false); return;
    }

    // 3. Agent login uses Supabase Auth so the session survives refresh.
    try {
      const { supabase } = await import('../../services/db');
      if (!supabase || !input.includes('@')) {
        setErrorMessage('Enter the email address linked to your agent account.');
        setLoading(false); return;
      }

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: inputLower,
        password
      });
      if (authError) {
        setErrorMessage('Email or password is incorrect. For an older agent account, request a secure sign-in link by email.');
        setLoading(false); return;
      }
      if (!authData.user) {
        setErrorMessage('Supabase did not return a signed-in user.');
        setLoading(false); return;
      }

      let { data, error } = await supabase
        .from('agent_accounts')
        .select('*')
        .eq('user_id', authData.user.id)
        .maybeSingle();
      if (error) throw error;
      if (!data) {
        const result = await supabase
          .from('agent_accounts')
          .select('*')
          .eq('email', inputLower)
          .maybeSingle();
        if (result.error) throw result.error;
        data = result.data;
        if (data && data.user_id !== authData.user.id) {
          const { error: linkError } = await supabase
            .from('agent_accounts')
            .update({ user_id: authData.user.id })
            .eq('id', data.id);
          if (linkError) throw linkError;
        }
      }
      if (!data) {
        await supabase.auth.signOut();
        setErrorMessage('This Supabase login has no linked agent profile. Contact the administrator.');
        setLoading(false); return;
      }

      const foundAgent = {
        id: data.id,
        firstName: data.first_name,
        surname: data.surname,
        email: data.email,
        phone: data.phone || '',
        avatarUrl: data.avatar_url || '',
        isOtpVerified: Boolean(data.is_otp_verified),
        isKycSubmitted: Boolean(data.is_kyc_submitted),
        isActivated: Boolean(data.is_activated),
        activationFeeAmount: Number(data.activation_fee_amount || 150),
        activationPaidAt: data.activation_paid_at,
        activationTxRef: data.activation_tx_ref,
        adminApprovalStatus: data.admin_approval_status || 'none',
        adminApprovedAt: data.admin_approved_at,
        adminReviewNotes: data.admin_review_notes,
        licenseNumber: data.license_number || '',
        kycData: data.kyc_data
      };
      updateAgentAccount(foundAgent);
      setActiveAgentId(foundAgent.id);
      setRole('agent');
      if (!foundAgent.isKycSubmitted) onNavigate('/agent/register-kyc');
      else if (!foundAgent.isActivated) onNavigate('/agent/activate');
      else onNavigate('/agent/dashboard');
      setLoading(false); return;
    } catch (err) {
      console.error('Supabase agent login failed:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Unable to sign in. Please try again.');
      setLoading(false); return;
    }
  };

  return (
    <div style={{ maxWidth: '480px', margin: '2.5rem auto', padding: '0 1rem' }}>
      <div className="card" style={{ padding: '2.5rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div className="brand-logo" style={{ display: 'inline-flex', background: 'var(--color-emerald-950)', padding: '0.65rem', borderRadius: '14px', marginBottom: '0.75rem', border: '1px solid rgba(229, 169, 60, 0.3)' }}>
            <ShieldCheck size={32} color="#E5A93C" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.35rem' }}>Sign In to Susu Vault</h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--color-slate-600)' }}>Enter your credentials to access your portal</p>
        </div>

        {errorMessage && (
          <div style={{ padding: '0.75rem 1rem', background: '#fee2e2', border: '1px solid #fca5a5', color: '#dc2626', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1.25rem', display: 'flex', gap: '0.5rem' }}>
            <AlertCircle size={16} /> <span>{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div style={{ padding: '0.75rem 1rem', background: '#dcfce7', border: '1px solid #86efac', color: '#166534', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            {successMessage}
          </div>
        )}

        <form onSubmit={handleUniversalLogin}>
          <div className="form-group">
            <label className="form-label">Email, Username, or Member Code</label>
            <div style={{ position: 'relative' }}>
              <input type="text" className="form-input" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required />
              <UserIcon size={16} style={{ position: 'absolute', right: '12px', top: '14px', color: '#888' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password / Passcode</label>
            <div style={{ position: 'relative' }}>
              <input type={showPassword ? 'text' : 'password'} className="form-input" style={{ paddingRight: '2.5rem' }} value={password} onChange={(e) => setPassword(e.target.value)} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-gold" style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', fontSize: '1rem', marginTop: '1.25rem' }} disabled={loading}>
            <LogIn size={18} /> {loading ? 'Signing in...' : 'Sign In to Portal'}
          </button>
          <button type="button" onClick={sendAgentSignInLink} disabled={loading} style={{ width: '100%', marginTop: '0.75rem', padding: '0.65rem', border: '1px solid var(--color-slate-300)', borderRadius: '8px', background: '#fff', color: 'var(--color-emerald-800)', fontWeight: 700, cursor: 'pointer' }}>
            Email me a secure agent sign-in link
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--color-slate-200)', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--color-slate-600)' }}>
          <div><span>New Agent? </span><button type="button" onClick={() => onNavigate('/signup')} style={{ background: 'none', border: 'none', color: 'var(--color-emerald-800)', fontWeight: 700, cursor: 'pointer', padding: 0 }}>Create Susu Group →</button></div>
          <div><span>Have invite token? </span><button type="button" onClick={() => onNavigate('/invite')} style={{ background: 'none', border: 'none', color: 'var(--color-emerald-800)', fontWeight: 700, cursor: 'pointer', padding: 0 }}>Accept Invite →</button></div>
        </div>
      </div>
    </div>
  );
};