import React, { useState } from 'react';
import { useSusu } from '../../context/SusuContext';
import {
  ShieldCheck,
  Settings,
  Eye,
  EyeOff,
  Save,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  Users,
  FileText,
  Sliders,
  Check,
  Building2,
  Smartphone,
  Percent,
  Clock
} from 'lucide-react';
import { PaymentGatewayConfigForm } from '../../components/payment/PaymentGatewayConfigForm';
import '../../styles/payment-config.css';

interface AgentPaymentConfigPageProps {
  onNavigate?: (path: string) => void;
}

export const AgentPaymentConfigPage: React.FC<AgentPaymentConfigPageProps> = ({ onNavigate }) => {
  const {
    group,
    members,
    schedule,
    agentPaymentConfig,
    updateAgentPaymentConfig,
    platformPaymentConfig
  } = useSusu();

  const [activeTab, setActiveTab] = useState<'provider' | 'susu_payout'>('provider');

  // Susu Group Payout State
  const [susuForm, setSusuForm] = useState(agentPaymentConfig);
  const [saved, setSaved] = useState(false);

  React.useEffect(() => {
    setSusuForm(agentPaymentConfig);
  }, [agentPaymentConfig]);

  // Save Susu Group Payout Details
  const handleSaveSusuPayout = (e: React.FormEvent) => {
    e.preventDefault();
    updateAgentPaymentConfig(susuForm);
    setSaved(true);
    setTimeout(() => setSaved(false), 3500);
  };

  // Compute pool metrics for simulation strictly for this group
  const groupMembers = group ? members.filter((m) => m.groupId === group.id) : [];
  const currentWeek = schedule?.find((s) => s.status === 'current') || schedule?.[0];
  const totalWeeklyPool = ((group?.fixedDailyAmount || 50) * 7) * (groupMembers.length || 1);
  const agentEarnings = (totalWeeklyPool * (susuForm.agentCommissionPercent || 1.5)) / 100;
  const netMemberPayout = totalWeeklyPool - agentEarnings;

  return (
    <div className="payment-config-wrapper">
      {/* Header Banner */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span
            style={{
              background: 'var(--color-gold-100)',
              color: 'var(--color-gold-900)',
              padding: '0.25rem 0.75rem',
              borderRadius: '999px',
              fontSize: '0.75rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <ShieldCheck size={14} color="#E5A93C" /> AGENT PAYMENT CONFIGURATION
          </span>
          {group?.name && (
            <span style={{ fontSize: '0.8rem', color: 'var(--color-slate-500)' }}>
              Group: <strong>{group.name}</strong>
            </span>
          )}
        </div>
        <h1 style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--color-emerald-950)', margin: '0 0 0.4rem 0' }}>
          Payment Gateway & Payout Configuration
        </h1>
        <p style={{ color: 'var(--color-slate-600)', fontSize: '0.94rem', margin: 0 }}>
          Manage online payment gateways, API keys, direct store checkout processing, and rotating Susu payout accounts.
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="payment-config-tabs-nav">
        <button
          type="button"
          className={`payment-config-tab-btn ${activeTab === 'provider' ? 'active' : ''}`}
          onClick={() => setActiveTab('provider')}
        >
          <Settings size={16} /> Provider Settings
        </button>
        <button
          type="button"
          className={`payment-config-tab-btn ${activeTab === 'susu_payout' ? 'active' : ''}`}
          onClick={() => setActiveTab('susu_payout')}
        >
          <CreditCard size={16} /> Susu Pool Payouts & Commission
        </button>
      </div>

      {/* Success Notification */}
      {saved && (
        <div
          style={{
            background: '#064e3b',
            color: '#a7f3d0',
            border: '1px solid #059669',
            padding: '0.95rem 1.25rem',
            borderRadius: '10px',
            marginBottom: '1.5rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            boxShadow: '0 4px 12px rgba(6, 78, 59, 0.4)'
          }}
        >
          <CheckCircle2 size={20} color="#34d399" />
          Susu pool payout account & commission settings saved successfully!
        </div>
      )}

      {/* Emergency Platform Freeze Alert from Super Admin */}
      {platformPaymentConfig?.emergencyPayoutFreeze && (
        <div
          style={{
            background: '#450a0a',
            border: '1px solid #dc2626',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}
        >
          <AlertTriangle size={24} color="#f87171" />
          <div>
            <strong style={{ color: '#fca5a5', display: 'block', fontSize: '0.92rem' }}>
              Super Admin Emergency Payout Freeze Active
            </strong>
            <span style={{ color: '#f87171', fontSize: '0.82rem' }}>
              Automated disbursements are temporarily paused across the platform. Collections remain active.
            </span>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 1: PROVIDER SETTINGS (EXACT MATCH WITH SCREENSHOT)
          ========================================================================= */}
      {activeTab === 'provider' && (
        <PaymentGatewayConfigForm isSuperAdmin={false} />
      )}

      {/* =========================================================================
          TAB 2: SUSU POOL PAYOUTS & COMMISSION
          ========================================================================= */}
      {activeTab === 'susu_payout' && (
        <form onSubmit={handleSaveSusuPayout}>
          {/* Card: Payout Destination Account */}
          <div className="payment-card-dark">
            <h2 className="payment-card-title">
              <Building2 size={20} color="#10b981" /> Agent Group Payout Destination
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
              <div className="payment-form-group">
                <label className="payment-field-label">Payout Method</label>
                <select
                  className="payment-field-input payment-field-select"
                  value={susuForm.payoutMethod}
                  onChange={(e) => setSusuForm({ ...susuForm, payoutMethod: e.target.value as any })}
                >
                  <option value="momo">Mobile Money (MTN / Telecel / AT)</option>
                  <option value="bank">Commercial Bank Transfer</option>
                </select>
              </div>

              {susuForm.payoutMethod === 'momo' ? (
                <>
                  <div className="payment-form-group">
                    <label className="payment-field-label">MoMo Provider</label>
                    <select
                      className="payment-field-input payment-field-select"
                      value={susuForm.momoProvider}
                      onChange={(e) => setSusuForm({ ...susuForm, momoProvider: e.target.value as any })}
                    >
                      <option value="MTN">MTN Mobile Money</option>
                      <option value="Telecel">Telecel Cash</option>
                      <option value="AirtelTigo">AT Money</option>
                    </select>
                  </div>

                  <div className="payment-form-group">
                    <label className="payment-field-label">MoMo Phone Number</label>
                    <input
                      type="tel"
                      className="payment-field-input"
                      value={susuForm.momoNumber}
                      onChange={(e) => setSusuForm({ ...susuForm, momoNumber: e.target.value })}
                    />
                  </div>

                  <div className="payment-form-group">
                    <label className="payment-field-label">Account Holder Name</label>
                    <input
                      type="text"
                      className="payment-field-input"
                      value={susuForm.momoAccountName}
                      onChange={(e) => setSusuForm({ ...susuForm, momoAccountName: e.target.value })}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="payment-form-group">
                    <label className="payment-field-label">Bank Name</label>
                    <input
                      type="text"
                      className="payment-field-input"
                      value={susuForm.bankName}
                      onChange={(e) => setSusuForm({ ...susuForm, bankName: e.target.value })}
                    />
                  </div>

                  <div className="payment-form-group">
                    <label className="payment-field-label">Account Number</label>
                    <input
                      type="text"
                      className="payment-field-input"
                      value={susuForm.bankAccountNumber}
                      onChange={(e) => setSusuForm({ ...susuForm, bankAccountNumber: e.target.value })}
                    />
                  </div>

                  <div className="payment-form-group">
                    <label className="payment-field-label">Account Name</label>
                    <input
                      type="text"
                      className="payment-field-input"
                      value={susuForm.bankAccountName}
                      onChange={(e) => setSusuForm({ ...susuForm, bankAccountName: e.target.value })}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Card: Agent Commission & Rules */}
          <div className="payment-card-dark">
            <h2 className="payment-card-title">
              <Percent size={20} color="#f59e0b" /> Commission & Cutoff Settings
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
              <div className="payment-form-group">
                <label className="payment-field-label">Agent Commission Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="15"
                  className="payment-field-input"
                  value={susuForm.agentCommissionPercent}
                  onChange={(e) =>
                    setSusuForm({ ...susuForm, agentCommissionPercent: parseFloat(e.target.value) || 0 })
                  }
                />
                <div className="payment-field-help">
                  Deducted automatically from the weekly rotating pool prior to member disbursement.
                </div>
              </div>

              <div className="payment-form-group">
                <label className="payment-field-label">Daily Contribution Cutoff</label>
                <input
                  type="time"
                  className="payment-field-input"
                  value={susuForm.dailyCutoffTime}
                  onChange={(e) => setSusuForm({ ...susuForm, dailyCutoffTime: e.target.value })}
                />
                <div className="payment-field-help">
                  Transactions logged after cutoff count towards the subsequent contribution day.
                </div>
              </div>
            </div>

            {/* Simulation Preview */}
            <div
              style={{
                background: '#0b1120',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '10px',
                padding: '1.15rem 1.25rem',
                marginTop: '1.25rem'
              }}
            >
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#e2e8f0', fontSize: '0.88rem' }}>
                Weekly Rotation Pool Projection
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', fontSize: '0.84rem' }}>
                <div>
                  <span style={{ color: '#94a3b8' }}>Gross Pool: </span>
                  <strong style={{ color: '#ffffff' }}>GH₵{totalWeeklyPool.toLocaleString()}</strong>
                </div>
                <div>
                  <span style={{ color: '#94a3b8' }}>Agent Commission ({susuForm.agentCommissionPercent}%): </span>
                  <strong style={{ color: '#f59e0b' }}>GH₵{agentEarnings.toLocaleString()}</strong>
                </div>
                <div>
                  <span style={{ color: '#94a3b8' }}>Net Payout to Member: </span>
                  <strong style={{ color: '#34d399' }}>GH₵{netMemberPayout.toLocaleString()}</strong>
                </div>
              </div>
            </div>

            <button type="submit" className="btn-save-payment-config" style={{ marginTop: '1.5rem' }}>
              <Save size={18} /> Save Payout Settings
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AgentPaymentConfigPage;
