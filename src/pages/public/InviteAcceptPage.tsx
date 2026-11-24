import React, { useState, useEffect } from 'react';
import { useSusu } from '../../context/SusuContext';
import { ShieldCheck, CheckCircle2, ArrowRight, Lock } from 'lucide-react';
import { supabase } from '../../services/db';

interface InviteAcceptPageProps {
  token: string;
  onNavigate: (path: string) => void;
}

export const InviteAcceptPage: React.FC<InviteAcceptPageProps> = ({ token, onNavigate }) => {
  const { acceptInviteToken, group, members, schedule, selectRotationSlot } = useSusu();

  const [loading, setLoading] = useState(true);
  const [inviteValid, setInviteValid] = useState(false);
  const [inviteData, setInviteData] = useState<any>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<number>(1);
  const [accepted, setAccepted] = useState(false);




useEffect(() => {
  const checkInvite = async () => {
    try {
      const { data, error } = await supabase.from('group_invites').select('*').eq('token', token).single();
      
      if (error || !data) {
        setInviteValid(false); setLoading(false); return;
      }

      // Expire after 7 days
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        setInviteValid(false); setLoading(false); return;
      }

      // 🔒 ONE-TIME: If not pending, it's used — block instantly
      if (data.status !== 'pending') {
        setInviteValid(false);
        setLoading(false);
        return;
      }

      setInviteData(data);
      setInviteValid(true);
      setName(data.member_name || '');
      setPhone(data.member_phone || '');
      setSelectedSlot(data.position || 1);
    } catch {
      setInviteValid(false);
    } finally {
      setLoading(false);
    }
  };
  checkInvite();
}, [token]);







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

  const { data: fresh } = await supabase
    .from('group_invites')
    .select('status, expires_at')
    .eq('token', token)
    .single();

  if (!fresh || fresh.status !== 'pending') {
    alert("❌ This link has already been used! One-time link only.");
    setInviteValid(false);
    return;
  }

  if (fresh.expires_at && new Date(fresh.expires_at) < new Date()) {
    alert("❌ Link expired");
    setInviteValid(false);
    return;
  }

  if (selectedSlot && matchingMember?.id) {
    selectRotationSlot(matchingMember.id, selectedSlot, 'super_admin');
  }
  
  const ok = await acceptInviteToken(token, name, phone);
  
  if (!ok) {
    alert("Failed to accept");
    setInviteValid(false);
    return;
  }

  setAccepted(true);
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
            <p style={{ fontSize: '0.85rem', color: 'var(--color-slate-600)' }}>Welcome to {group?.name}. Use your Member Code to access your portal.</p>
            {matchingMember?.uniqueCode ? (
              <div style={{ marginTop: '1rem', padding: '0.85rem', background: 'var(--color-gold-100)', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-600)' }}>Your Member Code</div>
                <strong style={{ fontSize: '1.2rem', letterSpacing: '0.08em' }}>{matchingMember.uniqueCode}</strong>
              </div>
            ) : (
              <p role="alert" style={{ color: '#b91c1c', fontSize: '0.85rem', marginTop: '0.75rem' }}>Your Member Code could not be loaded. Please contact your Agent.</p>
            )}
            <button type="button" className="btn-outline" onClick={() => onNavigate('/member/login')} style={{ marginTop: '1rem' }}>Go to Member Portal</button>
          </div>
        )}
      </div>
    </div>
  );
};