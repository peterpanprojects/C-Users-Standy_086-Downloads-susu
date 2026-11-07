import React, { useState } from 'react';
import { useSusu } from '../../context/SusuContext';
import { X, CheckCircle, Banknote, Calendar } from 'lucide-react';

interface ManualPayModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMemberId?: string;
  defaultDateStr?: string;
}

export const ManualPayModal: React.FC<ManualPayModalProps> = ({
  isOpen,
  onClose,
  defaultMemberId,
  defaultDateStr
}) => {
  const { members, markCashPayment, group, agentPaymentConfig } = useSusu();
  const groupMembers = group ? members.filter((m) => m.groupId === group.id) : [];
  const [selectedMemberId, setSelectedMemberId] = useState(defaultMemberId || groupMembers[0]?.id || '');
  const [dateStr, setDateStr] = useState(defaultDateStr || new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('Collected physical cash in-person');

  if (!isOpen) return null;

  if (!group) {
    return (
      <div className="modal-overlay">
        <div className="modal-content" style={{ padding: '2rem', textAlign: 'center' }}>
          <h3>No Active Group</h3>
          <p style={{ color: '#666', marginTop: '0.5rem' }}>Please select or create a Susu group first.</p>
          <button className="btn-primary" onClick={onClose} style={{ marginTop: '1rem' }}>Close</button>
        </div>
      </div>
    );
  }

  const isCashDisabled = !agentPaymentConfig.allowCashOverride;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCashDisabled || !selectedMemberId) return;

    markCashPayment(selectedMemberId, dateStr);
    const memName = groupMembers.find((m) => m.id === selectedMemberId)?.name || 'Member';
    alert(`Marked cash payment of ${group.currency}${group.fixedDailyAmount} for ${memName} on ${dateStr}!`);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Banknote color="#E5A93C" size={24} /> Record Manual Cash Payment
          </h3>
          <button onClick={onClose} style={{ background: 'transparent', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {isCashDisabled && (
          <div style={{ background: '#fef3c7', color: '#92400e', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: 600 }}>
            ⚠️ Cash Overrides Disabled: Your group is configured to only accept online payments. You can re-enable cash overrides in Agent Payment Config.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-slate-600)', marginBottom: '1.25rem' }}>
            Agent override for physical cash collected outside the Paystack online system.
          </p>

          <div className="form-group">
            <label className="form-label">Select Member</label>
            <select
              className="form-select"
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              disabled={isCashDisabled}
              required
            >
              {groupMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.phone || m.email})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Payment Date</label>
            <div style={{ position: 'relative' }}>
              <input
                type="date"
                className="form-input"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                disabled={isCashDisabled}
                required
              />
              <Calendar size={16} style={{ position: 'absolute', right: '12px', top: '14px', color: '#888' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Contribution Amount</label>
            <input
              type="text"
              className="form-input"
              value={`${group.currency} ${group.fixedDailyAmount}`}
              disabled
              style={{ background: 'var(--color-slate-100)', fontWeight: 700 }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Agent Audit Notes {agentPaymentConfig.requireCashReceiptProof && <span style={{ color: '#dc2626' }}>* (Required by Group Policy)</span>}
            </label>
            <input
              type="text"
              className="form-input"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={isCashDisabled}
              required={agentPaymentConfig.requireCashReceiptProof}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-gold"
              disabled={isCashDisabled}
              style={{ opacity: isCashDisabled ? 0.5 : 1, cursor: isCashDisabled ? 'not-allowed' : 'pointer' }}
            >
              <CheckCircle size={16} /> Confirm Cash Paid
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

