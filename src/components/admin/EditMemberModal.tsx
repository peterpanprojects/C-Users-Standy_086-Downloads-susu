import React, { useState, useEffect } from 'react';
import { useSusu } from '../../context/SusuContext';
import { X, User, Save, RotateCcw } from 'lucide-react';
import { GroupMember, InviteStatus } from '../../types/susu';

interface EditMemberModalProps {
  member: GroupMember | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EditMemberModal: React.FC<EditMemberModalProps> = ({ member, isOpen, onClose }) => {
  const { updateMemberProfile, members } = useSusu();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [positionInRotation, setPositionInRotation] = useState<number>(1);
  const [reliabilityScore, setReliabilityScore] = useState<number>(100);
  const [inviteStatus, setInviteStatus] = useState<InviteStatus>('active');
  const [slotLocked, setSlotLocked] = useState<boolean>(true);

  useEffect(() => {
    if (member && isOpen) {
      setName(member.name || '');
      setEmail(member.email || '');
      setPhone(member.phone || '');
      setPositionInRotation(member.positionInRotation || 1);
      setReliabilityScore(member.reliabilityScore ?? 100);
      setInviteStatus(member.inviteStatus || 'active');
      setSlotLocked(member.slotLocked ?? (member.inviteStatus === 'active'));
    }
  }, [member, isOpen]);

  if (!isOpen || !member) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMemberProfile(member.id, {
      name: name.trim() || member.name,
      email: email.trim(),
      phone: phone.trim(),
      positionInRotation: Number(positionInRotation),
      reliabilityScore: Math.min(100, Math.max(0, Number(reliabilityScore))),
      inviteStatus,
      slotLocked
    });
    onClose();
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div className="modal-content" style={{ maxWidth: '520px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--color-slate-200)', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ background: 'var(--color-emerald-100)', padding: '0.4rem', borderRadius: '8px' }}>
              <User size={20} color="var(--color-emerald-800)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', margin: 0, color: 'var(--color-emerald-950)' }}>Edit Member</h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--color-slate-500)' }}>Manage member rotation and account settings</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-slate-400)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-slate-700)', display: 'block', marginBottom: '0.35rem' }}>
              Full Name *
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div className="form-group">
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-slate-700)', display: 'block', marginBottom: '0.35rem' }}>
                Rotation Slot #
              </label>
              <input
                type="number"
                min="1"
                max={Math.max(members.length, 1)}
                className="input-field"
                value={positionInRotation}
                onChange={(e) => setPositionInRotation(Number(e.target.value))}
                required
              />
            </div>

            <div className="form-group">
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-slate-700)', display: 'block', marginBottom: '0.35rem' }}>
                Reliability %
              </label>
              <input
                type="number"
                min="0"
                max="100"
                className="input-field"
                value={reliabilityScore}
                onChange={(e) => setReliabilityScore(Number(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-slate-700)', display: 'block', marginBottom: '0.35rem' }}>
                Status
              </label>
              <select
                className="input-field"
                value={inviteStatus}
                onChange={(e) => setInviteStatus(e.target.value as InviteStatus)}
              >
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="removed">Removed</option>
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1', background: 'var(--color-slate-50)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-slate-200)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', margin: 0 }}>
                <input
                  type="checkbox"
                  checked={slotLocked}
                  onChange={(e) => setSlotLocked(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--color-emerald-700)' }}
                />
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-slate-800)' }}>
                  Lock Member Slot Selection
                </span>
              </label>
              <p style={{ margin: '0.25rem 0 0 1.5rem', fontSize: '0.76rem', color: 'var(--color-slate-500)' }}>
                When checked, the member cannot modify or swap this rotation slot in their Member Portal. Uncheck only if you want to allow the member to pick an available slot.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--color-slate-200)' }}>
            <button type="button" className="btn-secondary" onClick={onClose} style={{ padding: '0.5rem 1rem' }}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Save size={16} /> Save Member
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
