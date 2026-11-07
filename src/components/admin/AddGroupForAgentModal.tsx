import React, { useState } from 'react';
import { useSusu } from '../../context/SusuContext';
import { X, Layers, Plus, Calendar, DollarSign, UserCheck } from 'lucide-react';
import { getNearestMonday } from '../../utils/dates';
import { AgentAccount } from '../../types/susu';

interface AddGroupForAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent?: AgentAccount | null;
}

export const AddGroupForAgentModal: React.FC<AddGroupForAgentModalProps> = ({ isOpen, onClose, agent }) => {
  const { createGroup, agents, agentAccount, group } = useSusu();
  const [selectedAgentId, setSelectedAgentId] = useState(agent?.id || agentAccount?.id || agents[0]?.id || '');
  const targetAgent = agent || agents.find(a => a.id === selectedAgentId) || agentAccount;

  const [groupName, setGroupName] = useState('');
  const [dailyAmount, setDailyAmount] = useState<number>(50);
  const [currency, setCurrency] = useState<string>('GH₵');
  const [startDate, setStartDate] = useState<string>(getNearestMonday());

  if (!isOpen) return null;

  const agentDisplayName = targetAgent.kycData?.fullName ||
    `${targetAgent.firstName} ${targetAgent.surname}`.trim() ||
    targetAgent.email ||
    'Registered Agent';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) {
      alert('Please enter a valid Susu group name.');
      return;
    }
    if (dailyAmount <= 0) {
      alert('Fixed daily amount must be greater than 0.');
      return;
    }

    createGroup(groupName.trim(), Number(dailyAmount), startDate, currency, targetAgent.id);
    setGroupName('');
    setDailyAmount(50);
    onClose();
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div className="modal-content" style={{ maxWidth: '540px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--color-slate-200)', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ background: 'var(--color-emerald-100)', padding: '0.4rem', borderRadius: '8px' }}>
              <Layers size={20} color="var(--color-emerald-800)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', margin: 0, color: 'var(--color-emerald-950)' }}>Add Susu Group for Agent</h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--color-slate-500)' }}>Initialize a new rotating savings circle</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-slate-400)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Assigned Agent Card */}
        <div style={{ background: 'var(--color-slate-50)', border: '1px solid var(--color-slate-200)', borderRadius: '10px', padding: '0.85rem 1rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: !agent ? '0.5rem' : '0' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--color-gold-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserCheck size={18} color="var(--color-gold-700)" />
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--color-slate-500)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>Assigning To Agent</span>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-emerald-950)' }}>
                {agentDisplayName}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-slate-600)', fontFamily: 'monospace' }}>
                License: {targetAgent.licenseNumber || 'PENDING'}
              </span>
            </div>
          </div>
          {!agent && (
            <div style={{ marginTop: '0.5rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-slate-600)', display: 'block', marginBottom: '0.2rem' }}>
                Select Agent to assign circle:
              </label>
              <select
                className="form-select"
                value={selectedAgentId}
                onChange={(e) => setSelectedAgentId(e.target.value)}
                style={{ fontSize: '0.85rem', padding: '0.35rem 0.65rem' }}
              >
                {agents.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.kycData?.fullName || `${a.firstName} ${a.surname}`.trim() || a.email} ({a.email})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {group && (
          <div style={{ background: 'rgba(234, 179, 8, 0.1)', border: '1px solid #facc15', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.82rem', color: '#854d0e' }}>
            <strong>Note:</strong> Currently group "<strong>{group.name}</strong>" is active. Creating a new group will set this new group as the active circle for this agent.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-slate-700)', display: 'block', marginBottom: '0.35rem' }}>
              Group Name *
            </label>
            <input
              type="text"
              className="input-field"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-slate-700)', display: 'block', marginBottom: '0.35rem' }}>
                Fixed Daily Amount *
              </label>
              <input
                type="number"
                min="1"
                step="1"
                className="input-field"
                value={dailyAmount}
                onChange={(e) => setDailyAmount(Number(e.target.value))}
                required
              />
            </div>

            <div className="form-group">
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-slate-700)', display: 'block', marginBottom: '0.35rem' }}>
                Currency
              </label>
              <select
                className="input-field"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="GH₵">GH₵ (Ghana Cedi - GHS)</option>
                <option value="₦">₦ (Nigerian Naira - NGN)</option>
                <option value="$">$ (US Dollar - USD)</option>
                <option value="£">£ (British Pound - GBP)</option>
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-slate-700)', display: 'block', marginBottom: '0.35rem' }}>
              Cycle Start Date (Monday)
            </label>
            <input
              type="date"
              className="input-field"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
            <span style={{ fontSize: '0.74rem', color: 'var(--color-slate-500)', marginTop: '0.25rem', display: 'block' }}>
              Susu cycles run weekly from Monday through Sunday.
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--color-slate-200)' }}>
            <button type="button" className="btn-secondary" onClick={onClose} style={{ padding: '0.5rem 1rem' }}>
              Cancel
            </button>
            <button type="submit" className="btn-gold" style={{ padding: '0.5rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Plus size={16} /> Create Group for Agent
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
