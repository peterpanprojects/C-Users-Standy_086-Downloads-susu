import React from 'react';
import { useSusu } from '../../context/SusuContext';
import { X, AlertTriangle, Trash2 } from 'lucide-react';
import { GroupMember } from '../../types/susu';

interface DeleteMemberModalProps {
  member: GroupMember | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DeleteMemberModal: React.FC<DeleteMemberModalProps> = ({ member, isOpen, onClose }) => {
  const { removeMember } = useSusu();

  if (!isOpen || !member) return null;

  const handleDelete = () => {
    removeMember(member.id);
    onClose();
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div className="modal-content" style={{ maxWidth: '480px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--color-slate-200)', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ background: '#fee2e2', padding: '0.4rem', borderRadius: '8px' }}>
              <AlertTriangle size={20} color="#dc2626" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', margin: 0, color: '#991b1b' }}>Delete Member</h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--color-slate-500)' }}>Remove from Susu rotation &amp; directory</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-slate-400)' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ background: '#fff5f5', border: '1px solid #fecaca', borderRadius: '8px', padding: '1rem', marginBottom: '1.25rem', fontSize: '0.88rem', color: '#7f1d1d', lineHeight: 1.5 }}>
          <p style={{ margin: '0 0 0.5rem 0', fontWeight: 600 }}>
            Are you sure you want to remove <strong>"{member.name}"</strong>?
          </p>
          <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.82rem' }}>
            <li>Member will be removed from Rotation Slot #{member.positionInRotation}.</li>
            <li>Subsequent members' rotation positions will be automatically recalculated.</li>
            <li>Unique login code (<strong>{member.uniqueCode}</strong>) will be invalidated.</li>
          </ul>
        </div>

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
            <Trash2 size={16} /> Delete Member
          </button>
        </div>
      </div>
    </div>
  );
};
