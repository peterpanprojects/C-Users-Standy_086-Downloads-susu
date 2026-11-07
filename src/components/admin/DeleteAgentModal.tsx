import React, { useState } from 'react';
import { useSusu } from '../../context/SusuContext';
import { X, AlertTriangle, Trash2 } from 'lucide-react';
import { AgentAccount } from '../../types/susu';

interface DeleteAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent?: AgentAccount | null;
}

export const DeleteAgentModal: React.FC<DeleteAgentModalProps> = ({ isOpen, onClose, agent }) => {
  const { agentAccount, group, deleteAgent } = useSusu();
  const targetAgent = agent || agentAccount;
  const [resetGroup, setResetGroup] = useState(true);

  if (!isOpen) return null;

  const agentDisplayName = targetAgent.kycData?.fullName ||
    `${targetAgent.firstName} ${targetAgent.surname}`.trim() ||
    'Agent Organizer';

  const handleDelete = () => {
    deleteAgent(targetAgent.id, { resetGroup });
    onClose();
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div className="modal-content" style={{ maxWidth: '500px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--color-slate-200)', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ background: '#fee2e2', padding: '0.4rem', borderRadius: '8px' }}>
              <AlertTriangle size={20} color="#dc2626" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', margin: 0, color: '#991b1b' }}>Delete / Reset Agent</h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--color-slate-500)' }}>Super Admin administrative action</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-slate-400)' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ background: '#fff5f5', border: '1px solid #fecaca', borderRadius: '8px', padding: '1rem', marginBottom: '1.25rem', fontSize: '0.88rem', color: '#7f1d1d', lineHeight: 1.5 }}>
          <p style={{ margin: '0 0 0.5rem 0', fontWeight: 600 }}>
            Are you sure you want to delete or reset agent <strong>"{agentDisplayName}"</strong>?
          </p>
          <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.82rem' }}>
            <li>Agent license ({targetAgent.licenseNumber || 'N/A'}) will be revoked.</li>
            <li>KYC approval and verification records will be wiped.</li>
            <li>Agent authentication and active session will be reset to default.</li>
          </ul>
        </div>

        {group && (
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', cursor: 'pointer', fontSize: '0.85rem' }}>
              <input
                type="checkbox"
                checked={resetGroup}
                onChange={(e) => setResetGroup(e.target.checked)}
                style={{ marginTop: '0.15rem', width: '16px', height: '16px' }}
              />
              <div>
                <strong>Also delete associated Susu Group: "{group.name}"</strong>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-slate-500)' }}>
                  This will also remove member rotation slots and payment records for this group.
                </div>
              </div>
            </label>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--color-slate-200)' }}>
          <button type="button" className="btn-secondary" onClick={onClose} style={{ padding: '0.5rem 1rem' }}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-danger"
            onClick={handleDelete}
            style={{ padding: '0.5rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
          >
            <Trash2 size={16} /> Confirm Delete Agent
          </button>
        </div>
      </div>
    </div>
  );
};
