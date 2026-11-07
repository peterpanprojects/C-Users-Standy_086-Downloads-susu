import React, { useState } from 'react';
import { AgentAccount } from '../../types/susu';
import { useSusu } from '../../context/SusuContext';
import { ShieldCheck, LogIn, AlertCircle, User as UserIcon, Eye, EyeOff } from 'lucide-react';

interface LoginPageProps { onNavigate: (path: string) => void; }

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { setRole, agents, setActiveAgentId, members, loginWithUniqueCode } = useSusu();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUniversalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
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

    // 3. FIXED: AGENT LOGIN - TRY SUPABASE FIRST (cross-device)
    try {
      const { supabase } = await import('../../services/db');
      if (supabase && input.includes('@')) {
        const { data, error } = await supabase
          .from('agent_accounts')
          .select('*')
          .eq('email', inputLower)
          .single();
        
        if (data && !error) {
          // Optional password check - remove if you don't store password
          const savedPassword = (data.kyc_data as any)?.password || (data as any).password;
          if (savedPassword && savedPassword !== password) {
            setErrorMessage('Invalid password.');
            setLoading(false); return;
          }
          if (!password || password.length < 6) {
            setErrorMessage('Password must be at least 6 characters.');
            setLoading(false); return;
          }

          // Save this agent to this device
          const foundAgent: AgentAccount = {
            id: data.id,
            firstName: data.first_name,
            surname: data.surname,
            email: data.email,
            phone: data.phone,
            isOtpVerified: data.is_otp_verified,
            isKycSubmitted: data.is_kyc_submitted,
            isActivated: data.is_activated,
            activationFeeAmount: Number(data.activation_fee_amount || 150),
            adminApprovalStatus: data.admin_approval_status,
            licenseNumber: data.license_number,
            kycData: data.kyc_data
          } as AgentAccount;

          localStorage.setItem('susu_current_agent_id', foundAgent.id);
          localStorage.setItem('susu_active_agent_id', foundAgent.id);
          localStorage.setItem('susu_current_agent_email', foundAgent.email.toLowerCase());
          
          // Also add to local agents list
          const existing = localStorage.getItem('susu_agents_v2');
          let list: AgentAccount[] = [];
          try { list = existing ? JSON.parse(existing) : []; } catch {}
          const filtered = list.filter(a => a.email.toLowerCase() !== foundAgent.email.toLowerCase());
          localStorage.setItem('susu_agents_v2', JSON.stringify([foundAgent, ...filtered]));

          setActiveAgentId(foundAgent.id);
          setRole('agent');

          if (!foundAgent.isKycSubmitted) onNavigate('/agent/register-kyc');
          else if (!foundAgent.isActivated) onNavigate('/agent/activate');
          else onNavigate('/agent/dashboard');
          
          setLoading(false); return;
        }
      }
    } catch (err) {
      console.warn('Supabase agent login failed, falling back to local', err);
    }

    // 4. Fallback: OLD localStorage agents (for offline dev)
    const allAgents: AgentAccount[] = (() => {
      const map = new Map<string, AgentAccount>();
      try {
        const v2 = localStorage.getItem('susu_agents_v2');
        if (v2) {
          const parsed = JSON.parse(v2) as AgentAccount[];
          parsed.forEach(a => { if (a.id) map.set(a.id, a); });
        }
      } catch {}
      agents.forEach(a => { if (a.id && !map.has(a.id)) map.set(a.id, a); });
      return Array.from(map.values());
    })();

    const matchingAgent = allAgents.find(
      (a) =>
        (a.email && a.email.toLowerCase() === inputLower) ||
        (a.phone && a.phone.replace(/\s+/g, '') === input.replace(/\s+/g, '')) ||
        (a.licenseNumber && a.licenseNumber.toUpperCase() === inputUpper)
    );

    if (matchingAgent) {
      const savedPassword = (matchingAgent as any).password;
      if (savedPassword && savedPassword !== password) {
        setErrorMessage('Invalid password.');
        setLoading(false); return;
      }
      if (!password || password.length < 6) {
        setErrorMessage('Password must be at least 6 characters.');
        setLoading(false); return;
      }
      setActiveAgentId(matchingAgent.id);
      setRole('agent');
      if (!matchingAgent.isKycSubmitted) onNavigate('/agent/register-kyc');
      else if (!matchingAgent.isActivated) onNavigate('/agent/activate');
      else onNavigate('/agent/dashboard');
      setLoading(false); return;
    }

    setErrorMessage('Unrecognized credentials. Agent not found in cloud. Please create account on this deployed site first.');
    setLoading(false);
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
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--color-slate-200)', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--color-slate-600)' }}>
          <div><span>New Agent? </span><button type="button" onClick={() => onNavigate('/signup')} style={{ background: 'none', border: 'none', color: 'var(--color-emerald-800)', fontWeight: 700, cursor: 'pointer', padding: 0 }}>Create Susu Group →</button></div>
          <div><span>Have invite token? </span><button type="button" onClick={() => onNavigate('/invite')} style={{ background: 'none', border: 'none', color: 'var(--color-emerald-800)', fontWeight: 700, cursor: 'pointer', padding: 0 }}>Accept Invite →</button></div>
        </div>
      </div>
    </div>
  );
};