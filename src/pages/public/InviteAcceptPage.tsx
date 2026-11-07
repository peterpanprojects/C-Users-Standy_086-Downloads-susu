import React, { useState, useEffect } from 'react';
import { useSusu } from '../../context/SusuContext';
import { ShieldCheck, CheckCircle2, ArrowRight, Lock, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../services/db';

interface InviteAcceptPageProps {
  token: string;
  onNavigate: (path: string) => void;
}

export const InviteAcceptPage: React.FC<InviteAcceptPageProps> = ({ token, onNavigate }) => {
  const { acceptInviteToken, setRole, group, members, schedule, selectRotationSlot } = useSusu();

  const [loading, setLoading] = useState(true);
  const [inviteValid, setInviteValid] = useState(false);
  const [inviteData, setInviteData] = useState<any>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<number>(1);
  const [accepted, setAccepted] = useState(false);

  // 🔥 CHECK SUPABASE DIRECTLY ON LOAD - Not local members!
  useEffect(() => {
    const checkInvite = async () => {
      try {
        const { data, error } = await supabase.from('group_invites').select('*').eq('token', token).single();
        
        if (error || !data) {
          setInviteValid(false);
          setLoading(false);
          return;
        }
        if (data.status !== 'pending') {
          setInviteValid(false);
          setLoading(false);
          return;
        }

        // Valid invite
        setInviteData(data);
        setInviteValid(true);
        setName(data.member_name || '');
        setPhone(data.member_phone || '');
        setSelectedSlot(data.position || 1);
        
        // Also try to find local member to prefill
        const local = members.find(m => m.inviteToken === token || m.id === data.member_id);
        if (local) {
          setName(local.name || data.member_name || '');
          setPhone(local.phone || data.member_phone || '');
          setSelectedSlot(local.positionInRotation || data.position || 1);
        }
      } catch (e) {
        setInviteValid(false);
      } finally {
        setLoading(false);
      }
    };
    checkInvite();
  }, [token, members]);

  const matchingMember = members.find((m) => m.inviteToken === token) || { id: inviteData?.member_id } as any;

  if (loading) {
    return (
      <div style={{ maxWidth: '480px', margin: '3rem auto', textAlign: 'center' }}>
        <div className="card" style={{ padding: '2.5rem 2rem' }}>Checking invitation...</div>
      </div>
    );
  }

  if (!inviteValid) {
    return (
      <div style={{ maxWidth: '480px', margin: '3rem auto', textAlign: 'center' }}>
        <div className="card" style={{ padding: '2.5rem 2rem' }}>
          <div className="brand-logo" style={{ display: 'inline-flex', background: 'var(--color-emerald-950)', padding: '0.6rem', borderRadius: '12px', marginBottom: '1rem' }}>
            <ShieldCheck size={32} color="#E5A93C" />
          </div>
          <h2 style={{ fontSize: '1.4rem' }}>Invitation Expired or Used</h2>
          <p style={{ color: 'var(--color-slate-600)', margin: '0.75rem 0 1.5rem', fontSize: '0.9rem' }}>
            This link is invalid, expired, or has already been used. One-time links can only be used once. Please ask your Agent for a new invitation.
          </p>
          <button className="btn-primary" onClick={() => onNavigate('/')}>Return to Home</button>
        </div>
      </div>
    );
  }

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault();

    // Double-check status right before accepting
    const { data: fresh } = await supabase.from('group_invites').select('status').eq('token', token).single();
    if (!fresh || fresh.status !== 'pending') {
      alert("❌ This link has already been used! Ask Agent for a new one.");
      setInviteValid(false);
      return;
    }

    if (selectedSlot && matchingMember?.id) {
      selectRotationSlot(matchingMember.id, selectedSlot, 'super_admin');
    }
    
    // AWAIT the burn
    const ok = await acceptInviteToken(token, name, phone);
    
    if (!ok) {
      alert("Failed to accept - link may have just been used.");
      setInviteValid(false);
      return;
    }

    setAccepted(true);
    setTimeout(() => {
      setRole('member', matchingMember.id || inviteData.member_id);
      onNavigate('/member/dashboard');
    }, 1500);
  };

  return (
    <div style={{ maxWidth: '480px', margin: '3rem auto' }}>
      <div className="card" style={{ padding: '2.5rem 2rem' }}>
        {!accepted ? (
          <>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div className="brand-logo" style={{ display: 'inline-flex', background: 'var(--color-emerald-950)', padding: '0.6rem', borderRadius: '12px', marginBottom: '0.75rem' }}>
                <ShieldCheck size={32} color="#E5A93C" />
              </div>
              <h2 style={{ fontSize: '1.5rem' }}>Accept Susu Invitation</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-slate-600)', marginTop: '0.25rem' }}>
                You have been invited to join <strong>{group?.name || 'Susu Circle'}</strong>.
              </p>
            </div>

            <div style={{ background: 'var(--color-emerald-50)', border: '1px solid var(--color-emerald-200)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--color-emerald-950)' }}>
              <div>Fixed Daily Contribution: <strong>{group?.currency}{group?.fixedDailyAmount} / day</strong> (Mon–Sun)</div>
              <div>Schedule: <strong>1 Payout Week</strong> during cycle rotation.</div>
            </div>

            <form onSubmit={handleAccept}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input type="text" className="form-input" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input type="tel" className="form-input" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="form-label">Create Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPassword ? 'text' : 'password'} className="form-input" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ paddingRight: '2.5rem' }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', padding: 0 }}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {schedule.length > 0 && (
                <div className="form-group">
                  <label className="form-label">Select Preferred Rotation Slot</label>
                  <select className="form-select" value={selectedSlot} onChange={(e) => setSelectedSlot(Number(e.target.value))}>
                    {schedule.map((s) => (
                      <option key={s.id} value={s.weekNumber} disabled={!s.isAvailable && s.memberId !== matchingMember.id}>
                        Week #{s.weekNumber} ({s.weekStartDate} to {s.weekEndDate}) - {s.isAvailable ? '✓ Available' : s.memberId === matchingMember.id ? '✓ Default Slot' : `Taken (${s.memberName})`}
                      </option>
                    ))}
                  </select>
                  <span style={{ fontSize: '0.75rem', color: '#92400e', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                    <Lock size={12} /> Important: Once you select your slot and join, it is locked and cannot be changed.
                  </span>
                </div>
              )}

              <button type="submit" className="btn-gold" style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', fontSize: '1rem', marginTop: '1rem' }}>
                Accept Invite & Join <ArrowRight size={18} />
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <CheckCircle2 size={54} color="var(--color-emerald-600)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.4rem', color: 'var(--color-emerald-950)', marginBottom: '0.5rem' }}>Invitation Accepted!</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-slate-600)' }}>Welcome to {group?.name}. Redirecting to your member dashboard...</p>
          </div>
        )}
      </div>
    </div>
  );
};