import React, { useState, useEffect } from 'react';
import { useSusu } from '../../context/SusuContext';
import { X, UserCheck, Key, Save, Shield } from 'lucide-react';
import { GroupMember, InviteStatus } from '../../types/susu';
import { ProfilePictureUpload } from '../common/ProfilePictureUpload';

interface EditMemberProfileModalProps {
  member: GroupMember | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EditMemberProfileModal: React.FC<EditMemberProfileModalProps> = ({ member, isOpen, onClose }) => {
  const { updateMemberProfile } = useSusu();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [uniqueCode, setUniqueCode] = useState('');
  const [joinedAt, setJoinedAt] = useState('');
  const [inviteStatus, setInviteStatus] = useState<InviteStatus>('active');
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    if (member && isOpen) {
      setName(member.name || '');
      setEmail(member.email || '');
      setPhone(member.phone || '');
      setUniqueCode(member.uniqueCode || '');
      setJoinedAt(member.joinedAt || '');
      setInviteStatus(member.inviteStatus || 'active');
      setAvatarUrl(member.avatarUrl || '');
    }
  }, [member, isOpen]);

  if (!isOpen || !member) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMemberProfile(member.id, {
      name: name.trim() || member.name,
      email: email.trim(),
      phone: phone.trim(),
      uniqueCode: uniqueCode.trim().toUpperCase() || member.uniqueCode,
      joinedAt: joinedAt || member.joinedAt,
      inviteStatus,
      avatarUrl
    });
    onClose();
  };

  const handleGenerateCode = () => {
    const randomCode = `SUSU-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    setUniqueCode(randomCode);
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div className="modal-content" style={{ maxWidth: '540px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--color-slate-200)', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ background: 'var(--color-gold-100)', padding: '0.4rem', borderRadius: '8px' }}>
              <UserCheck size={20} color="var(--color-gold-800)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', margin: 0, color: 'var(--color-emerald-950)' }}>Edit Member Profile</h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--color-slate-500)' }}>Identity, authentication credentials &amp; membership</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-slate-400)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <ProfilePictureUpload
              currentAvatarUrl={avatarUrl}
              fallbackName={name || member.name}
              onAvatarChange={setAvatarUrl}
              size={76}
              title="Member Profile Picture"
              subtitle="Upload or change member headshot photo"
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-slate-700)', display: 'block', marginBottom: '0.35rem' }}>
              Full Legal Name *
            </label>
            <input
              type="text"
              className="input-field"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-slate-700)', display: 'block', marginBottom: '0.35rem' }}>
                Email Address
              </label>
              <input
                type="email"
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-slate-700)', display: 'block', marginBottom: '0.35rem' }}>
                Phone Number
              </label>
              <input
                type="tel"
                className="input-field"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          {/* Unique Access Code */}
          <div className="form-group" style={{ marginBottom: '1rem', background: 'var(--color-slate-50)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--color-slate-200)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-emerald-950)' }}>
                Unique Member Login Code
              </label>
              <button
                type="button"
                onClick={handleGenerateCode}
                style={{ background: 'none', border: 'none', color: 'var(--color-gold-700)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
              >
                <Key size={13} /> Re-generate Code
              </button>
            </div>
            <input
              type="text"
              className="input-field"
              value={uniqueCode}
              onChange={(e) => setUniqueCode(e.target.value)}
              style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.95rem' }}
              required
            />
            <span style={{ fontSize: '0.72rem', color: 'var(--color-slate-500)', marginTop: '0.3rem', display: 'block' }}>
              Member uses this code to log into the Member Portal without needing a password.
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div className="form-group">
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-slate-700)', display: 'block', marginBottom: '0.35rem' }}>
                Member Since Date
              </label>
              <input
                type="date"
                className="input-field"
                value={joinedAt}
                onChange={(e) => setJoinedAt(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-slate-700)', display: 'block', marginBottom: '0.35rem' }}>
                Membership Status
              </label>
              <select
                className="input-field"
                value={inviteStatus}
                onChange={(e) => setInviteStatus(e.target.value as InviteStatus)}
              >
                <option value="active">Active Circle Member</option>
                <option value="pending">Pending Invite Verification</option>
                <option value="accepted">Invite Accepted</option>
                <option value="removed">Suspended / Removed</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--color-slate-200)' }}>
            <button type="button" className="btn-secondary" onClick={onClose} style={{ padding: '0.5rem 1rem' }}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Save size={16} /> Save Member Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
