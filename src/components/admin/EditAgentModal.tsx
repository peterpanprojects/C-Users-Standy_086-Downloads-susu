import React, { useState, useEffect } from 'react';
import { useSusu } from '../../context/SusuContext';
import { X, ShieldCheck, Save } from 'lucide-react';
import { AdminApprovalStatus, AgentAccount } from '../../types/susu';

interface EditAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent?: AgentAccount | null;
}

export const EditAgentModal: React.FC<EditAgentModalProps> = ({ isOpen, onClose, agent }) => {
  const { agentAccount, updateAgentAccount } = useSusu();
  const targetAgent = agent || agentAccount;

  const [firstName, setFirstName] = useState(targetAgent.firstName || '');
  const [surname, setSurname] = useState(targetAgent.surname || '');
  const [email, setEmail] = useState(targetAgent.email || '');
  const [phone, setPhone] = useState(targetAgent.phone || '');
  const [licenseNumber, setLicenseNumber] = useState(targetAgent.licenseNumber || '');
  const [adminApprovalStatus, setAdminApprovalStatus] = useState<AdminApprovalStatus>(targetAgent.adminApprovalStatus || 'none');
  const [isActivated, setIsActivated] = useState(targetAgent.isActivated || false);
  const [isKycSubmitted, setIsKycSubmitted] = useState(targetAgent.isKycSubmitted || false);
  const [adminReviewNotes, setAdminReviewNotes] = useState(targetAgent.adminReviewNotes || '');

  useEffect(() => {
    if (isOpen) {
      setFirstName(targetAgent.firstName || '');
      setSurname(targetAgent.surname || '');
      setEmail(targetAgent.email || '');
      setPhone(targetAgent.phone || '');
      setLicenseNumber(targetAgent.licenseNumber || '');
      setAdminApprovalStatus(targetAgent.adminApprovalStatus || 'none');
      setIsActivated(targetAgent.isActivated || false);
      setIsKycSubmitted(targetAgent.isKycSubmitted || false);
      setAdminReviewNotes(targetAgent.adminReviewNotes || '');
    }
  }, [isOpen, targetAgent]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateAgentAccount(targetAgent.id, {
      firstName: firstName.trim(),
      surname: surname.trim(),
      email: email.trim(),
      phone: phone.trim(),
      licenseNumber: licenseNumber.trim(),
      adminApprovalStatus,
      isActivated,
      isKycSubmitted,
      adminReviewNotes: adminReviewNotes.trim(),
      ...(adminApprovalStatus === 'verified' && !targetAgent.adminApprovedAt
        ? { adminApprovedAt: new Date().toISOString() }
        : {})
    });
    onClose();
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div className="modal-content" style={{ maxWidth: '580px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--color-slate-200)', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ background: 'var(--color-emerald-100)', padding: '0.4rem', borderRadius: '8px' }}>
              <ShieldCheck size={20} color="var(--color-emerald-800)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', margin: 0, color: 'var(--color-emerald-950)' }}>Edit Agent Account</h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--color-slate-500)' }}>Super Admin management console</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-slate-400)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-slate-700)', display: 'block', marginBottom: '0.35rem' }}>
                First Name
              </label>
              <input
                type="text"
                className="input-field"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-slate-700)', display: 'block', marginBottom: '0.35rem' }}>
                Surname
              </label>
              <input
                type="text"
                className="input-field"
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                required
              />
            </div>
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
                required
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-slate-700)', display: 'block', marginBottom: '0.35rem' }}>
                Official License ID
              </label>
              <input
                type="text"
                className="input-field"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-slate-700)', display: 'block', marginBottom: '0.35rem' }}>
                KYC Verification Status
              </label>
              <select
                className="input-field"
                value={adminApprovalStatus}
                onChange={(e) => setAdminApprovalStatus(e.target.value as AdminApprovalStatus)}
              >
                <option value="verified">Verified &amp; Approved</option>
                <option value="pending_admin_approval">Pending Admin Approval</option>
                <option value="rejected">Rejected</option>
                <option value="none">No KYC (Unregistered)</option>
              </select>
            </div>
          </div>

          <div style={{ background: 'var(--color-slate-50)', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid var(--color-slate-200)', marginBottom: '1rem', display: 'flex', gap: '2rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={isActivated}
                onChange={(e) => setIsActivated(e.target.checked)}
                style={{ width: '16px', height: '16px' }}
              />
              <span>Account Activated (Fee Paid)</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={isKycSubmitted}
                onChange={(e) => setIsKycSubmitted(e.target.checked)}
                style={{ width: '16px', height: '16px' }}
              />
              <span>KYC Form Submitted</span>
            </label>
          </div>

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-slate-700)', display: 'block', marginBottom: '0.35rem' }}>
              Admin Review Notes
            </label>
            <input
              type="text"
              className="input-field"
              value={adminReviewNotes}
              onChange={(e) => setAdminReviewNotes(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" className="btn-secondary" onClick={onClose} style={{ padding: '0.5rem 1rem' }}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Save size={16} /> Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
