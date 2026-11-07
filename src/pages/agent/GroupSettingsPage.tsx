import React, { useState } from 'react';
import { useSusu } from '../../context/SusuContext';
import { Save, Settings, Key, ShieldCheck, CreditCard, Headphones, UserCheck } from 'lucide-react';
import { getNearestMonday } from '../../utils/dates';
import { AgentPaymentConfigPage } from './AgentPaymentConfigPage';
import { LiveSupportPage } from './LiveSupportPage';
import { AgentProfilePage } from './AgentProfilePage';

interface GroupSettingsPageProps {
  initialTab?: 'profile' | 'payments' | 'support' | 'agent';
  onNavigate?: (path: string) => void;
}

export const GroupSettingsPage: React.FC<GroupSettingsPageProps> = ({ initialTab = 'profile', onNavigate }) => {
  const { group, myGroups, setActiveGroupId, updateGroupSettings } = useSusu();

  const [activeTab, setActiveTab] = useState<'profile' | 'payments' | 'support' | 'agent'>(initialTab);

  const [name, setName] = useState(group?.name || '');
  const [fixedDailyAmount, setFixedDailyAmount] = useState(group?.fixedDailyAmount || 20);
  const [currency, setCurrency] = useState(group?.currency || 'GH₵');
  const [cycleStartDate, setCycleStartDate] = useState(group?.cycleStartDate || getNearestMonday());
  const [paystackPublicKey, setPaystackPublicKey] = useState(group?.paystackPublicKey || '');
  const [saved, setSaved] = useState(false);

  React.useEffect(() => {
    if (group) {
      setName(group.name || '');
      setFixedDailyAmount(group.fixedDailyAmount || 20);
      setCurrency(group.currency || 'GH₵');
      setCycleStartDate(group.cycleStartDate || getNearestMonday());
      setPaystackPublicKey(group.paystackPublicKey || '');
    }
  }, [group?.id, group?.name, group?.fixedDailyAmount, group?.currency, group?.cycleStartDate, group?.paystackPublicKey]);

  if (!group) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-slate-500)' }}>
        <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-slate-700)', marginBottom: '0.75rem' }}>
          No Susu group found for your agent account.
        </p>
        <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Create a group from the Groups or Dashboard page to configure its settings.
        </p>
        {onNavigate && (
          <button className="btn-gold" onClick={() => onNavigate('/agent/groups')}>
            Go to My Groups
          </button>
        )}
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateGroupSettings({
      name,
      fixedDailyAmount: Number(fixedDailyAmount),
      currency,
      cycleStartDate,
      paystackPublicKey
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Top Tabs Bar */}
      <div
        style={{
          display: 'flex',
          borderBottom: '2px solid var(--color-slate-200)',
          marginBottom: '2rem',
          gap: '0.5rem'
        }}
      >
        <button
          onClick={() => setActiveTab('profile')}
          style={{
            padding: '0.85rem 1.25rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'profile' ? '3px solid var(--color-gold-500)' : '3px solid transparent',
            color: activeTab === 'profile' ? 'var(--color-emerald-950)' : 'var(--color-slate-600)',
            fontWeight: activeTab === 'profile' ? 700 : 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.95rem'
          }}
        >
          <Settings size={18} /> Group Profile & Parameters
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          style={{
            padding: '0.85rem 1.25rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'payments' ? '3px solid var(--color-gold-500)' : '3px solid transparent',
            color: activeTab === 'payments' ? 'var(--color-emerald-950)' : 'var(--color-slate-600)',
            fontWeight: activeTab === 'payments' ? 700 : 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.95rem'
          }}
        >
          <CreditCard size={18} /> Payment & Payout Configuration
        </button>

        <button
          onClick={() => setActiveTab('support')}
          style={{
            padding: '0.85rem 1.25rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'support' ? '3px solid #818cf8' : '3px solid transparent',
            color: activeTab === 'support' ? '#818cf8' : 'var(--color-slate-600)',
            fontWeight: activeTab === 'support' ? 700 : 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.95rem'
          }}
        >
          <Headphones size={18} /> Live Support
        </button>

        <button
          onClick={() => setActiveTab('agent')}
          style={{
            padding: '0.85rem 1.25rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'agent' ? '3px solid var(--color-gold-500)' : '3px solid transparent',
            color: activeTab === 'agent' ? 'var(--color-emerald-950)' : 'var(--color-slate-600)',
            fontWeight: activeTab === 'agent' ? 700 : 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.95rem'
          }}
        >
          <UserCheck size={18} /> Agent Profile & Photo
        </button>
      </div>

      {activeTab === 'agent' ? (
        <AgentProfilePage onNavigate={onNavigate} />
      ) : activeTab === 'support' ? (
        <LiveSupportPage onNavigate={onNavigate} />
      ) : activeTab === 'payments' ? (
        <AgentPaymentConfigPage onNavigate={onNavigate} />
      ) : (
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '2rem', margin: 0 }}>Susu Group Profile</h1>
              <p style={{ color: 'var(--color-slate-600)', fontSize: '0.9rem', margin: '0.35rem 0 0 0' }}>
                Configure fixed contribution amounts, start dates, and Paystack credentials.
              </p>
            </div>
            {myGroups.length > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-slate-600)', fontWeight: 600 }}>Active Group:</span>
                <select
                  value={group.id}
                  onChange={(e) => setActiveGroupId(e.target.value)}
                  style={{
                    padding: '0.45rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid var(--color-slate-300)',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    background: '#fff',
                    color: 'var(--color-emerald-950)',
                    cursor: 'pointer'
                  }}
                >
                  {myGroups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.currency}{g.fixedDailyAmount}/day)
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="card">
            {saved && (
              <div
                style={{
                  background: 'var(--color-emerald-100)',
                  color: 'var(--color-emerald-900)',
                  padding: '0.85rem',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1.25rem',
                  fontWeight: 600
                }}
              >
                ✓ Settings saved successfully! Payout rotation schedule updated.
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--color-emerald-950)' }}>
                Group Profile & Parameters
              </h3>

              <div className="form-group">
                <label className="form-label">Susu Group Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Currency Symbol</label>
                  <select
                    className="form-select"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                  >
                    <option value="GH₵">GH₵ (GHS)</option>
                    <option value="₦">₦ (NGN)</option>
                    <option value="$">$ (USD)</option>
                    <option value="£">£ (GBP)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Fixed Daily Contribution Amount</label>
                  <input
                    type="number"
                    className="form-input"
                    value={fixedDailyAmount}
                    onChange={(e) => setFixedDailyAmount(Number(e.target.value))}
                    min={1}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Cycle Start Date (Monday Enforced)</label>
                <input
                  type="date"
                  className="form-input"
                  value={cycleStartDate}
                  onChange={(e) => setCycleStartDate(getNearestMonday(e.target.value))}
                  required
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)', marginTop: '0.25rem', display: 'block' }}>
                  Must be a Monday. Week 1 starts on this date.
                </span>
              </div>

              <h3 style={{ fontSize: '1.1rem', margin: '1.5rem 0 1rem', color: 'var(--color-emerald-950)' }}>
                Paystack Integration Credentials
              </h3>

              <div className="form-group">
                <label className="form-label">Paystack Public API Key (pk_test_...)</label>
                <input
                  type="text"
                  className="form-input"
                  value={paystackPublicKey}
                  onChange={(e) => setPaystackPublicKey(e.target.value)}
                  style={{ fontFamily: 'monospace' }}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)', marginTop: '0.25rem', display: 'block' }}>
                  Used to initialize Paystack Inline popup for online member checkouts.
                </span>
              </div>

              <button type="submit" className="btn-gold" style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', marginTop: '1.5rem' }}>
                <Save size={18} /> Save Settings
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
