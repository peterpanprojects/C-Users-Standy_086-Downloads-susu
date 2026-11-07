import React, { useState } from 'react';
import { useSusu } from '../../context/SusuContext';
import { X, Layers, Plus, Calendar, Banknote, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';
import { getNearestMonday } from '../../utils/dates';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newGroupId: string) => void;
}

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { createGroup, activeAgentId, agentAccount, addNotification } = useSusu();

  const [name, setName] = useState('');
  const [fixedDailyAmount, setFixedDailyAmount] = useState<number>(20);
  const [currency, setCurrency] = useState('GH₵');
  const [cycleStartDate, setCycleStartDate] = useState(getNearestMonday());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const agentDisplayName =
    agentAccount.kycData?.fullName ||
    `${agentAccount.firstName} ${agentAccount.surname}`.trim() ||
    'Agent Organizer';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Please enter a group name.');
      return;
    }

    if (fixedDailyAmount <= 0) {
      setErrorMessage('Fixed daily contribution must be greater than 0.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newGroup = createGroup(
        name.trim(),
        Number(fixedDailyAmount),
        cycleStartDate,
        currency,
        activeAgentId
      );

      addNotification({
        type: 'info',
        title: 'New Susu Circle Created',
        description: `Group "${name.trim()}" (${currency}${fixedDailyAmount}/day) is ready. You can now invite members and configure payout dates.`,
        time: 'Just now'
      });

      setName('');
      setFixedDailyAmount(20);
      setCurrency('GH₵');
      setCycleStartDate(getNearestMonday());

      if (onSuccess) {
        onSuccess(newGroup.id);
      }
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create group. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div className="modal-content" style={{ maxWidth: '520px', borderRadius: '16px', padding: '1.75rem' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.25rem',
            paddingBottom: '0.85rem',
            borderBottom: '1px solid var(--color-slate-100)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(229, 169, 60, 0.2) 0%, rgba(37, 139, 111, 0.25) 100%)',
                border: '1px solid rgba(229, 169, 60, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Layers size={22} color="var(--color-gold-600)" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--color-emerald-950)' }}>
                Create Susu Group
              </h2>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-slate-500)' }}>
                Launch a new rotating savings circle for your members
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-slate-400)',
              padding: '0.25rem'
            }}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Organizer Agent Tag */}
        <div
          style={{
            background: 'var(--color-emerald-50)',
            border: '1px solid var(--color-emerald-200)',
            borderRadius: '10px',
            padding: '0.65rem 0.95rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.82rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-emerald-900)' }}>
            <ShieldCheck size={16} color="var(--color-emerald-700)" />
            <span>Agent Organizer: <strong>{agentDisplayName}</strong></span>
          </div>
          <span style={{ fontSize: '0.72rem', background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
            Multi-Group Enabled
          </span>
        </div>

        {errorMessage && (
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              padding: '0.65rem 0.85rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              marginBottom: '1rem'
            }}
          >
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Group Name */}
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
              Group / Circle Name *
            </label>
            <input
              type="text"
              className="form-input"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ padding: '0.65rem 0.85rem' }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)', marginTop: '0.25rem', display: 'block' }}>
              Give each circle a distinctive name so you and your members can easily recognize it.
            </span>
          </div>

          {/* Amount & Currency Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                Daily Contribution *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  className="form-input"
                  min={1}
                  required
                  value={fixedDailyAmount}
                  onChange={(e) => setFixedDailyAmount(Number(e.target.value))}
                  style={{ padding: '0.65rem 0.85rem' }}
                />
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--color-slate-500)', marginTop: '0.25rem', display: 'block' }}>
                Paid Mon–Sun by each member
              </span>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                Currency
              </label>
              <select
                className="form-input"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                style={{ padding: '0.65rem 0.85rem' }}
              >
                <option value="GH₵">GH₵ (Ghana Cedi)</option>
                <option value="₦">₦ (Nigerian Naira)</option>
                <option value="$">$ (US Dollar)</option>
                <option value="£">£ (British Pound)</option>
              </select>
            </div>
          </div>

          {/* Cycle Start Date */}
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
              Cycle Start Date (Must be a Monday)
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="date"
                className="form-input"
                required
                value={cycleStartDate}
                onChange={(e) => setCycleStartDate(e.target.value)}
                style={{ padding: '0.65rem 0.85rem' }}
              />
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--color-slate-500)', marginTop: '0.25rem', display: 'block' }}>
              Standard Susu runs weekly Monday through Sunday. Defaults to nearest Monday.
            </span>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--color-slate-100)' }}>
            <button
              type="button"
              className="btn-outline"
              onClick={onClose}
              disabled={isSubmitting}
              style={{ padding: '0.65rem 1.25rem' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-gold"
              disabled={isSubmitting}
              style={{ padding: '0.65rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              {isSubmitting ? (
                <span>Creating Circle...</span>
              ) : (
                <>
                  <Plus size={16} /> Create Group
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
