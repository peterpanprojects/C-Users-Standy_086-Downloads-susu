import React, { useState } from 'react';
import { useSusu } from '../../context/SusuContext';
import { X, Send, Copy, Check, Link, Mail, Phone, Key, ShieldCheck } from 'lucide-react';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({ isOpen, onClose }) => {
  const { inviteMember, group } = useSusu();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [generatedInvite, setGeneratedInvite] = useState<{ token: string; inviteUrl: string; uniqueCode: string } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

   const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!group) {
      alert('Please create or select an active Susu group first.');
      return;
    }
    if (!name || (!email && !phone)) {
      alert('Please provide member name and at least an email or phone number.');
      return;
    }
    try {
      const result = await inviteMember(name, email, phone);
      setGeneratedInvite(result);
    } catch (err: any) {
      alert(err.message || 'Failed to invite member');
    }
  };

  const handleCopyLink = () => {
    if (!generatedInvite) return;
    navigator.clipboard.writeText(generatedInvite.inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleCopyCode = () => {
    if (!generatedInvite) return;
    navigator.clipboard.writeText(generatedInvite.uniqueCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  const handleReset = () => {
    setName('');
    setEmail('');
    setPhone('');
    setGeneratedInvite(null);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '520px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Key size={20} color="var(--color-gold-600)" />
            <h3 style={{ fontSize: '1.3rem' }}>Invite Member & Generate Unique Code</h3>
          </div>
          <button onClick={handleReset} style={{ background: 'transparent', cursor: 'pointer', border: 'none' }}>
            <X size={20} />
          </button>
        </div>

        {!group ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <p style={{ color: 'var(--color-slate-600)', marginBottom: '1.5rem' }}>
              No active group selected. Please create or select a Susu group before inviting members.
            </p>
            <button className="btn-primary" onClick={onClose}>Close</button>
          </div>
        ) : !generatedInvite ? (
          <form onSubmit={handleSubmit}>
            <div style={{ background: 'var(--color-emerald-50)', border: '1px solid var(--color-emerald-200)', borderRadius: '8px', padding: '0.6rem 0.85rem', marginBottom: '1rem', fontSize: '0.82rem', color: 'var(--color-emerald-950)' }}>
              Inviting to circle: <strong>{group.name}</strong> ({group.currency}{group.fixedDailyAmount}/day)
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-slate-600)', marginBottom: '1.25rem' }}>
              A <strong>Unique Member Login Code</strong> will be generated. Only this invited individual will be authorized to access the savings portal with this code.
            </p>

            <div className="form-group">
              <label className="form-label">Member Full Name *</label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Mail size={16} style={{ position: 'absolute', right: '12px', top: '14px', color: '#888' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number (SMS / WhatsApp)</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="tel"
                  className="form-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <Phone size={16} style={{ position: 'absolute', right: '12px', top: '14px', color: '#888' }} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button type="button" className="btn-secondary" onClick={handleReset}>
                Cancel
              </button>
              <button type="submit" className="btn-gold">
                <Send size={16} /> Generate Unique Code & Invite
              </button>
            </div>
          </form>
        ) : (
          <div>
            <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'var(--color-emerald-100)',
                  color: 'var(--color-emerald-700)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 0.75rem'
                }}
              >
                <Key size={26} color="var(--color-gold-600)" />
              </div>
              <h4 style={{ fontSize: '1.25rem', marginBottom: '0.25rem', color: 'var(--color-emerald-950)' }}>
                Unique Member Code Generated!
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-slate-600)' }}>
                Share this exclusive login code with <strong>{name}</strong>:
              </p>
            </div>

            {/* Unique Code Box */}
            <div
              style={{
                background: 'var(--color-gold-50)',
                border: '2px dashed var(--color-gold-500)',
                borderRadius: '12px',
                padding: '1.25rem',
                textAlign: 'center',
                margin: '1rem 0'
              }}
            >
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 800, color: 'var(--color-gold-900)' }}>
                Member Secret Login Code
              </span>
              <div
                style={{
                  fontSize: '2rem',
                  letterSpacing: '4px',
                  fontWeight: 900,
                  color: 'var(--color-emerald-950)',
                  margin: '0.3rem 0 0.5rem',
                  fontFamily: 'monospace'
                }}
              >
                {generatedInvite.uniqueCode}
              </div>
              <button
                className="btn-gold"
                style={{ padding: '0.4rem 1rem', fontSize: '0.82rem', margin: '0 auto' }}
                onClick={handleCopyCode}
              >
                {copiedCode ? <Check size={14} /> : <Copy size={14} />} {copiedCode ? 'Copied Code!' : 'Copy Unique Code'}
              </button>
            </div>

            {/* Direct Link Box */}
            <div
              style={{
                background: 'var(--color-slate-100)',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.5rem',
                marginBottom: '1.25rem'
              }}
            >
              <span
                style={{
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {generatedInvite.inviteUrl}
              </span>
              <button
                className="btn-outline"
                style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                onClick={handleCopyLink}
              >
                {copiedLink ? <Check size={12} /> : <Copy size={12} />} {copiedLink ? 'Copied' : 'Copy Link'}
              </button>
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--color-emerald-800)', background: 'var(--color-emerald-50)', padding: '0.6rem 0.8rem', borderRadius: '6px', textAlign: 'center' }}>
              ✓ Only <strong>{name}</strong> is authorized to log in using code <strong>{generatedInvite.uniqueCode}</strong>.
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.25rem' }}>
              <button className="btn-primary" onClick={handleReset} style={{ width: '100%' }}>
                Done & Return to Members List
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
