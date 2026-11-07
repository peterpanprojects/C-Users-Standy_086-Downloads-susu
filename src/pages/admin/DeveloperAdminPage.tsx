import React, { useState } from 'react';
import { useSusu } from '../../context/SusuContext';
import {
  ShieldCheck,
  Layers,
  Users,
  CreditCard,
  Activity,
  AlertTriangle,
  RefreshCw,
  Plus,
  Sliders,
  UserCheck,
  Edit,
  Eye,
  FileText,
  X
} from 'lucide-react';
import { MasterPaymentEngineTab } from '../../components/admin/MasterPaymentEngineTab';
import { EditAgentModal } from '../../components/admin/EditAgentModal';
import { EditAgentProfileModal } from '../../components/admin/EditAgentProfileModal';
import { AddGroupForAgentModal } from '../../components/admin/AddGroupForAgentModal';
import { DeleteAgentModal } from '../../components/admin/DeleteAgentModal';
import { EditMemberModal } from '../../components/admin/EditMemberModal';
import { EditMemberProfileModal } from '../../components/admin/EditMemberProfileModal';
import { DeleteMemberModal } from '../../components/admin/DeleteMemberModal';
import { KycDossierModal } from '../../components/admin/KycDossierModal';
import { GroupMember, AgentAccount } from '../../types/susu';

interface DeveloperAdminPageProps {
  initialTab?: 'overview' | 'agents' | 'groups' | 'users' | 'vault' | 'payments';
  onNavigate: (path: string) => void;
}

export const DeveloperAdminPage: React.FC<DeveloperAdminPageProps> = ({ initialTab = 'overview', onNavigate }) => {
  const {
    group,
    members,
    payments,
    schedule,
    posts,
    updateGroupSettings,
    updateMemberProfile,
    updateAgentAccount,
    deleteGroup,
    removeMember,
    resetSystemData,
    setRole,
    platformPaymentConfig,
    activeUser,
    agentAccount,
    agents,
    groups,
    setActiveAgentId,
    approveAgentKyc,
    rejectAgentKyc
  } = useSusu();

  const [activeTab, setActiveTab] = useState<'overview' | 'agents' | 'groups' | 'users' | 'vault' | 'payments'>(initialTab);
  const [agentSearchTerm, setAgentSearchTerm] = useState('');
  const [agentStatusFilter, setAgentStatusFilter] = useState<'all' | 'verified' | 'pending' | 'rejected'>('all');
  const [emergencyAlert, setEmergencyAlert] = useState<string | null>(null);

  React.useEffect(() => {
    setRole('super_admin');
  }, []);

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Super Admin Management Modals State
  const [selectedAgent, setSelectedAgent] = useState<AgentAccount | null>(null);
  const [isEditAgentOpen, setIsEditAgentOpen] = useState(false);
  const [isEditAgentProfileOpen, setIsEditAgentProfileOpen] = useState(false);
  const [isAddGroupOpen, setIsAddGroupOpen] = useState(false);
  const [isDeleteAgentOpen, setIsDeleteAgentOpen] = useState(false);
  const [dossierAgent, setDossierAgent] = useState<AgentAccount | null>(null);
  const [isKycDossierOpen, setIsKycDossierOpen] = useState(false);
  const [adminLightboxImg, setAdminLightboxImg] = useState<{ label: string; src: string } | null>(null);

  const [selectedMember, setSelectedMember] = useState<GroupMember | null>(null);
  const [isEditMemberOpen, setIsEditMemberOpen] = useState(false);
  const [isEditMemberProfileOpen, setIsEditMemberProfileOpen] = useState(false);
  const [isDeleteMemberOpen, setIsDeleteMemberOpen] = useState(false);

  // Feature Toggles State
  const [featureFlags, setFeatureFlags] = useState({
    paystackLive: true,
    cashOverrides: true,
    autoRotationShuffle: true,
    maintenanceMode: false,
    auditLogging: true
  });

// FIXED - useMemo to stop OOM
const totalPaidTransactions = React.useMemo(() => payments.filter(p => p.status === 'paid'), [payments]);
const totalVolumeCollected = React.useMemo(() => totalPaidTransactions.reduce((sum, p) => sum + p.amount, 0), [totalPaidTransactions]);
const totalPayoutPool = React.useMemo(() => schedule.reduce((sum, s) => sum + s.expectedPoolAmount, 0), [schedule]);
const platformCommission = React.useMemo(() => totalVolumeCollected * 0.02, [totalVolumeCollected]);
const displayCurrency = group?.currency || 'GH₵';
const filteredAgents = React.useMemo(() => {
  return agents.filter((agent) => {
    const term = agentSearchTerm.toLowerCase().trim();
    if (term) {
      const matchesSearch =
        agent.firstName.toLowerCase().includes(term) ||
        agent.surname.toLowerCase().includes(term) ||
        (agent.email && agent.email.toLowerCase().includes(term));
      if (!matchesSearch) return false;
    }
    if (agentStatusFilter === 'verified') return agent.adminApprovalStatus === 'verified';
    if (agentStatusFilter === 'pending') return agent.adminApprovalStatus === 'pending_admin_approval';
    if (agentStatusFilter === 'rejected') return agent.adminApprovalStatus === 'rejected';
    return true;
  });
}, [agents, agentSearchTerm, agentStatusFilter]);

const renderDocumentPreview = (label: string, src?: string) => {
  if (!src) return null;
  return (
    <div key={label} style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden', background: '#fff' }}>
      <div style={{ padding: '0.45rem 0.65rem', fontSize: '0.72rem', fontWeight: 700, background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>{label}</span>
        <button type="button" onClick={() => setAdminLightboxImg({ label, src })} style={{ background: '#065f46', color: '#fff', border: 'none', borderRadius: '6px', padding: '2px 8px', cursor: 'pointer', fontSize: '0.7rem' }}>View</button>
      </div>
      <div style={{ height: '80px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: '#999' }}>
        Click View to load
      </div>
    </div>
  );
};

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Header Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #061B14 0%, #0A2920 100%)',
          color: '#ffffff',
          border: '2px solid var(--color-gold-500)',
          padding: '2rem',
          marginBottom: '2rem'
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.5rem'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <span
                style={{
                  background: 'var(--color-gold-500)',
                  color: 'var(--color-emerald-950)',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase'
                }}
              >
                SUPER ADMIN PORTAL
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-emerald-300)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }} />
                Platform Active — Full Privileges
              </span>
            </div>
            <h1 style={{ fontSize: '2rem', color: '#ffffff', fontWeight: 800, letterSpacing: '-0.025em' }}>
              Platform Administration Console
            </h1>

            <p style={{ fontSize: '0.9rem', color: 'var(--color-slate-200)', marginTop: '0.25rem' }}>
              Authenticated as: <strong>{activeUser?.name || 'Super Admin'}</strong> — Full system administration, agent KYC verification & payment management
            </p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            <button
              onClick={() => setActiveTab('agents')}
              className="btn-gold"
              style={{
                padding: '0.65rem 1.25rem',
                fontSize: '0.88rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                boxShadow: '0 4px 14px rgba(229, 169, 60, 0.4)'
              }}
              title="View and manage all registered agents"
              id="btn-all-agents-header"
            >
              <UserCheck size={18} /> All Agents ({agents.length})
            </button>
            <button
              onClick={() => setIsAddGroupOpen(true)}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.35)',
                padding: '0.65rem 1.1rem',
                borderRadius: '12px',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
              title="Create a new Susu Group for Agents"
            >
              <Plus size={16} /> Add Group for Agent
            </button>
            <button
              onClick={() => setIsEditAgentOpen(true)}
              style={{
                background: 'rgba(255, 255, 255, 0.12)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                padding: '0.65rem 1.1rem',
                borderRadius: '12px',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
              title="Edit Agent Account Details"
            >
              <ShieldCheck size={16} /> Edit Agent
            </button>
            <button
              onClick={() => setIsEditAgentProfileOpen(true)}
              style={{
                background: 'rgba(255, 255, 255, 0.12)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                padding: '0.65rem 1.1rem',
                borderRadius: '12px',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
              title="Edit Agent Identity & KYC Profile"
            >
              <UserCheck size={16} /> Edit Agent Profile
            </button>
            <button
              onClick={() => {
                if (window.confirm('Clear all platform data and reset database cache?')) {
                  resetSystemData();
                  alert('Platform database state and cache have been reset.');
                }
              }}
              style={{
                background: 'rgba(239, 68, 68, 0.2)',
                color: '#f87171',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                padding: '0.65rem 1.2rem',
                borderRadius: '12px',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <RefreshCw size={16} /> Reset Platform Data
            </button>
          </div>
        </div>

        {emergencyAlert && (
          <div
            style={{
              marginTop: '1.25rem',
              padding: '0.85rem 1.25rem',
              background: 'rgba(239, 68, 68, 0.25)',
              border: '1px solid #ef4444',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: '#fca5a5',
              fontSize: '0.88rem'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={18} /> {emergencyAlert}
            </span>
            <button onClick={() => setEmergencyAlert(null)} style={{ background: 'transparent', color: '#fff', cursor: 'pointer' }}>
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* Tabs Bar */}
      <div
        style={{
          display: 'flex',
          borderBottom: '2px solid var(--color-slate-200)',
          marginBottom: '2rem',
          gap: '0.5rem',
          overflowX: 'auto'
        }}
      >
        <button
          onClick={() => setActiveTab('overview')}
          style={{
            padding: '0.85rem 1.25rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'overview' ? '3px solid var(--color-gold-500)' : '3px solid transparent',
            color: activeTab === 'overview' ? 'var(--color-emerald-950)' : 'var(--color-slate-600)',
            fontWeight: activeTab === 'overview' ? 700 : 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.95rem'
          }}
        >
          <Activity size={18} /> Overview & Metrics
        </button>

        <button
          onClick={() => setActiveTab('agents')}
          style={{
            padding: '0.85rem 1.25rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'agents' ? '3px solid var(--color-gold-500)' : '3px solid transparent',
            color: activeTab === 'agents' ? 'var(--color-emerald-950)' : 'var(--color-slate-600)',
            fontWeight: activeTab === 'agents' ? 700 : 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.95rem'
          }}
          id="tab-all-agents"
        >
          <UserCheck size={18} /> All Agents ({agents.length})
        </button>

        <button
          onClick={() => setActiveTab('groups')}
          style={{
            padding: '0.85rem 1.25rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'groups' ? '3px solid var(--color-gold-500)' : '3px solid transparent',
            color: activeTab === 'groups' ? 'var(--color-emerald-950)' : 'var(--color-slate-600)',
            fontWeight: activeTab === 'groups' ? 700 : 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.95rem'
          }}
        >
          <Layers size={18} /> Susu Groups ({groups.length})
        </button>

        <button
          onClick={() => setActiveTab('users')}
          style={{
            padding: '0.85rem 1.25rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'users' ? '3px solid var(--color-gold-500)' : '3px solid transparent',
            color: activeTab === 'users' ? 'var(--color-emerald-950)' : 'var(--color-slate-600)',
            fontWeight: activeTab === 'users' ? 700 : 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.95rem'
          }}
        >
          <Users size={18} /> User Directory ({1 + agents.length + members.length})
        </button>

        <button
          onClick={() => setActiveTab('vault')}
          style={{
            padding: '0.85rem 1.25rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'vault' ? '3px solid var(--color-gold-500)' : '3px solid transparent',
            color: activeTab === 'vault' ? 'var(--color-emerald-950)' : 'var(--color-slate-600)',
            fontWeight: activeTab === 'vault' ? 700 : 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.95rem'
          }}
        >
          <CreditCard size={18} /> Transactions & Payouts
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
          <Sliders size={18} /> Payment Engine & Gateway
          {platformPaymentConfig.emergencyPayoutFreeze && (
            <span style={{ background: '#ef4444', color: '#fff', fontSize: '0.65rem', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: 800 }}>
              FROZEN
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div>
          {/* Key Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            <div className="card">
              <div style={{ fontSize: '0.8rem', color: 'var(--color-slate-600)', textTransform: 'uppercase', fontWeight: 700 }}>
                Total Platform Volume
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-emerald-950)', margin: '0.4rem 0' }}>
                {displayCurrency} {totalVolumeCollected.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-emerald-700)' }}>
                Processed across {totalPaidTransactions.length} successful daily contributions
              </div>
            </div>

            <div className="card">
              <div style={{ fontSize: '0.8rem', color: 'var(--color-slate-600)', textTransform: 'uppercase', fontWeight: 700 }}>
                Total Payout Commitment
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-gold-700)', margin: '0.4rem 0' }}>
                {displayCurrency} {totalPayoutPool.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-slate-600)' }}>
                Across {members.length} weekly payout cycles
              </div>
            </div>

            <div className="card">
              <div style={{ fontSize: '0.8rem', color: 'var(--color-slate-600)', textTransform: 'uppercase', fontWeight: 700 }}>
                Platform Revenue (2%)
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-emerald-800)', margin: '0.4rem 0' }}>
                {displayCurrency} {platformCommission.toFixed(2)}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-slate-600)' }}>
                Automated platform service commission
              </div>
            </div>

            <div className="card">
              <div style={{ fontSize: '0.8rem', color: 'var(--color-slate-600)', textTransform: 'uppercase', fontWeight: 700 }}>
                System Health & Vitals
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#16a34a', margin: '0.4rem 0' }}>
                99.98%
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-slate-600)' }}>
                Paystack API: Connected & Healthy
              </div>
            </div>
          </div>

          {/* Quick Developer Controls */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="card">
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sliders size={20} color="var(--color-emerald-800)" /> Feature Flags & Control Switches
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Paystack Live Checkout</div>
                    <div style={{ fontSize: '0.75rem', color: '#666' }}>Allow direct online card/mobile money checkout</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={featureFlags.paystackLive}
                    onChange={(e) => setFeatureFlags((p) => ({ ...p, paystackLive: e.target.checked }))}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Agent Cash Overrides</div>
                    <div style={{ fontSize: '0.75rem', color: '#666' }}>Allow agents to manually confirm cash payments</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={featureFlags.cashOverrides}
                    onChange={(e) => setFeatureFlags((p) => ({ ...p, cashOverrides: e.target.checked }))}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Automated Rotation Shuffle</div>
                    <div style={{ fontSize: '0.75rem', color: '#666' }}>Allow agents to auto-randomize payout positions</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={featureFlags.autoRotationShuffle}
                    onChange={(e) => setFeatureFlags((p) => ({ ...p, autoRotationShuffle: e.target.checked }))}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: featureFlags.maintenanceMode ? '#dc2626' : '#202124' }}>
                      Maintenance Mode Lock
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#666' }}>Lock app for non-admin users during updates</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={featureFlags.maintenanceMode}
                    onChange={(e) => setFeatureFlags((p) => ({ ...p, maintenanceMode: e.target.checked }))}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                </div>
              </div>
            </div>

            <div className="card">
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={20} color="var(--color-emerald-800)" /> Platform Governance & Safeguards
              </h3>
              <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '0.5rem 0', fontWeight: 600 }}>Architecture Mode</td>
                    <td style={{ textAlign: 'right', color: '#16a34a', fontWeight: 600 }}>100% Client-Side Privacy / Self-Contained</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '0.5rem 0', fontWeight: 600 }}>Agent KYC Verification</td>
                    <td style={{ textAlign: 'right', color: 'var(--color-emerald-800)' }}>Mandatory Super Admin Approval</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '0.5rem 0', fontWeight: 600 }}>Member Access Security</td>
                    <td style={{ textAlign: 'right', color: 'var(--color-emerald-800)' }}>Unique Token & Member Code Gate</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '0.5rem 0', fontWeight: 600 }}>Daily Susu Rotation Integrity</td>
                    <td style={{ textAlign: 'right', color: '#16a34a' }}>Deterministic Weekly Pool Settlement</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.5rem 0', fontWeight: 600 }}>Data Storage Policy</td>
                    <td style={{ textAlign: 'right', color: 'var(--color-slate-600)' }}>Local Isolated Secure Browser Vault</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: ALL AGENTS */}
      {activeTab === 'agents' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Top Banner */}
          <div
            className="card"
            style={{
              padding: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              borderLeft: '4px solid var(--color-gold-500)'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span className="badge-agent">SUPER ADMIN AGENT MANAGEMENT</span>
                <span
                  style={{
                    fontSize: '0.75rem',
                    background: 'rgba(229, 169, 60, 0.18)',
                    color: 'var(--color-gold-900)',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontWeight: 700
                  }}
                >
                  {agents.length} Registered Agents
                </span>
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-emerald-950)', margin: '0 0 0.25rem 0' }}>
                All Registered Agents &amp; Regional Organizers
              </h2>
              <p style={{ color: 'var(--color-slate-600)', fontSize: '0.88rem', margin: 0 }}>
                Manage licensing, KYC accreditation, assigned Susu circles, and permissions for every agent across Ghana.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => {
                  setSelectedAgent(agents[0] || agentAccount);
                  setIsAddGroupOpen(true);
                }}
                className="btn-gold"
                style={{ fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                title="Initialize a new group for an agent"
              >
                <Plus size={16} /> Add Group for Agent
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="card" style={{ padding: '1.15rem' }}>
              <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--color-slate-500)', fontWeight: 700 }}>
                Total Agents
              </span>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-emerald-950)', margin: '0.25rem 0' }}>
                {agents.length}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-slate-600)' }}>Active in platform registry</span>
            </div>

            <div className="card" style={{ padding: '1.15rem' }}>
              <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--color-slate-500)', fontWeight: 700 }}>
                Fully Verified
              </span>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#16a34a', margin: '0.25rem 0' }}>
                {agents.filter(a => a.adminApprovalStatus === 'verified').length}
              </div>
              <span style={{ fontSize: '0.75rem', color: '#16a34a' }}>KYC Approved &amp; Licensed</span>
            </div>

            <div className="card" style={{ padding: '1.15rem' }}>
              <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--color-slate-500)', fontWeight: 700 }}>
                Pending Review
              </span>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ca8a04', margin: '0.25rem 0' }}>
                {agents.filter(a => a.adminApprovalStatus === 'pending_admin_approval' || (a.isKycSubmitted && a.adminApprovalStatus !== 'verified')).length}
              </div>
              <span style={{ fontSize: '0.75rem', color: '#ca8a04' }}>Awaiting Admin Approval</span>
            </div>

            <div className="card" style={{ padding: '1.15rem' }}>
              <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--color-slate-500)', fontWeight: 700 }}>
                Total Circles Managed
              </span>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-gold-700)', margin: '0.25rem 0' }}>
                {groups.length}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-slate-600)' }}>Across all agents</span>
            </div>
          </div>

          {/* Pending KYC Review Cards (if any) */}
          {agents.filter(a => a.adminApprovalStatus === 'pending_admin_approval' || (a.isKycSubmitted && a.adminApprovalStatus !== 'verified')).map(pendingAgent => {
            const pendingKyc = pendingAgent.kycData;
            return (
              <div
                key={`pending-${pendingAgent.id}`}
                className="card"
                style={{
                  border: '2px solid var(--color-gold-400)',
                  background: 'linear-gradient(180deg, #fffbeb 0%, #ffffff 100%)',
                  padding: '1.75rem',
                  marginBottom: '2rem',
                  boxShadow: '0 8px 24px rgba(229, 169, 60, 0.15)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fef08a', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--color-gold-400)' }}>
                      <AlertTriangle size={24} color="#ca8a04" />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#854d0e', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          ACTION REQUIRED: PENDING AGENT KYC REVIEW
                        </span>
                        <span className="status-pill pending" style={{ fontSize: '0.68rem', padding: '0.15rem 0.5rem' }}>
                          Awaiting Super Admin Verification
                        </span>
                      </div>
                      <h3 style={{ margin: 0, fontSize: '1.35rem', color: 'var(--color-emerald-950)', fontWeight: 800 }}>
                        {pendingKyc?.fullName || `${pendingAgent.firstName} ${pendingAgent.surname}`}
                        {pendingKyc?.tradeName && (
                          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-gold-700)', marginLeft: '0.5rem' }}>
                            ({pendingKyc.tradeName})
                          </span>
                        )}
                      </h3>
                      <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '0.2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <span>Email: <strong style={{ color: '#0f172a' }}>{pendingAgent.email}</strong></span>
                        <span>Phone: <strong style={{ color: '#0f172a' }}>{pendingAgent.phone}</strong></span>
                        <span>Nationality: <strong style={{ color: '#0f172a' }}>{pendingKyc?.nationality || 'Ghanaian'}</strong></span>
                        <span>Activation Fee: <strong style={{ color: '#16a34a' }}>Paid GH₵150 ✓ ({pendingAgent.activationTxRef || 'TX-ACT-VERIFIED'})</strong></span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                    <button
                      className="btn-gold"
                      style={{ padding: '0.6rem 1.25rem', fontSize: '0.88rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                      onClick={() => {
                        setDossierAgent(pendingAgent);
                        setIsKycDossierOpen(true);
                      }}
                    >
                      <Eye size={16} /> Inspect Full KYC Dossier
                    </button>
                    <button
                      className="btn-primary"
                      style={{ padding: '0.6rem 1.25rem', fontSize: '0.88rem', fontWeight: 700 }}
                      onClick={() => {
                        approveAgentKyc(pendingAgent.id, 'Identity and business verified by Super Admin.');
                        alert(`Agent ${pendingAgent.firstName} approved and licensed!`);
                      }}
                    >
                      ✅ Quick Approve
                    </button>
                    <button
                      style={{
                        background: '#fee2e2',
                        color: '#dc2626',
                        border: '1px solid #fca5a5',
                        borderRadius: '10px',
                        padding: '0.6rem 1rem',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '0.88rem'
                      }}
                      onClick={() => {
                        setDossierAgent(pendingAgent);
                        setIsKycDossierOpen(true);
                      }}
                    >
                      ❌ Reject...
                    </button>
                  </div>
                </div>

                {/* Comprehensive 8-column Information Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem', background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div><span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>ID Card Type & Number</span><strong style={{ fontFamily: 'monospace' }}>{pendingKyc?.idCardType?.toUpperCase()} ({pendingKyc?.idCardNumber || 'N/A'})</strong></div>
                  <div><span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>Date of Birth & Gender</span><strong>{pendingKyc?.dob || 'N/A'} • {pendingKyc?.gender?.toUpperCase() || 'N/A'}</strong></div>
                  <div><span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>Digital GPS Address</span><strong style={{ fontFamily: 'monospace', color: 'var(--color-emerald-800)' }}>{pendingKyc?.digitalAddress || 'N/A'}</strong></div>
                  <div><span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>Residential Address</span><strong>{pendingKyc?.residentialAddress || pendingKyc?.cityCountry || 'N/A'}</strong></div>
                  <div><span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>Business Reg Cert No.</span><strong style={{ fontFamily: 'monospace' }}>{pendingKyc?.businessCertificateNumber || 'N/A'}</strong></div>
                  <div><span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>Occupation & Experience</span><strong>{pendingKyc?.occupation || 'Collector'} ({pendingKyc?.yearsExperience || '3+ yrs'})</strong></div>
                  <div><span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>MoMo Settlement Account</span><strong>{pendingKyc?.payoutMomoNetwork || 'MTN'}: {pendingKyc?.payoutMomoNumber || pendingAgent.phone}</strong></div>
                  <div><span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>Next of Kin</span><strong>{pendingKyc?.nextOfKinName || 'N/A'} ({pendingKyc?.nextOfKinRelationship || 'Relative'})</strong></div>
                </div>

                {/* Document Previews Grid with Lightbox Zoom */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155' }}>
                      Attached Compliance Documents ({[pendingKyc?.idCardFrontUrl, pendingKyc?.idCardBackUrl, pendingKyc?.selfieUrl, pendingKyc?.businessCertificateUrl, pendingKyc?.utilityBillUrl].filter(Boolean).length} uploaded)
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setDossierAgent(pendingAgent);
                        setIsKycDossierOpen(true);
                      }}
                      style={{ background: 'none', border: 'none', color: 'var(--color-emerald-800)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      View in Fullscreen Lightbox
                    </button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.75rem' }}>
                    {renderDocumentPreview('ID Front', pendingKyc?.idCardFrontUrl)}
                    {renderDocumentPreview('ID Back', pendingKyc?.idCardBackUrl)}
                    {renderDocumentPreview('Selfie Photo', pendingKyc?.selfieUrl)}
                    {renderDocumentPreview('Business Cert', pendingKyc?.businessCertificateUrl)}
                    {renderDocumentPreview('Utility Bill', pendingKyc?.utilityBillUrl)}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Agents List Card */}
          <div className="card">
            {/* Filter Toolbar */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.25rem',
                flexWrap: 'wrap',
                gap: '1rem'
              }}
            >
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-slate-600)' }}>Filter:</span>
                <button
                  onClick={() => setAgentStatusFilter('all')}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: agentStatusFilter === 'all' ? '2px solid var(--color-emerald-700)' : '1px solid var(--color-slate-300)',
                    background: agentStatusFilter === 'all' ? 'var(--color-emerald-100)' : '#fff',
                    color: agentStatusFilter === 'all' ? 'var(--color-emerald-950)' : 'var(--color-slate-700)'
                  }}
                >
                  All ({agents.length})
                </button>
                <button
                  onClick={() => setAgentStatusFilter('verified')}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: agentStatusFilter === 'verified' ? '2px solid #16a34a' : '1px solid var(--color-slate-300)',
                    background: agentStatusFilter === 'verified' ? '#dcfce7' : '#fff',
                    color: agentStatusFilter === 'verified' ? '#166534' : 'var(--color-slate-700)'
                  }}
                >
                  Verified ({agents.filter(a => a.adminApprovalStatus === 'verified').length})
                </button>
                <button
                  onClick={() => setAgentStatusFilter('pending')}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: agentStatusFilter === 'pending' ? '2px solid #ca8a04' : '1px solid var(--color-slate-300)',
                    background: agentStatusFilter === 'pending' ? '#fef9c3' : '#fff',
                    color: agentStatusFilter === 'pending' ? '#854d0e' : 'var(--color-slate-700)'
                  }}
                >
                  Pending ({agents.filter(a => a.adminApprovalStatus === 'pending_admin_approval' || (a.isKycSubmitted && a.adminApprovalStatus !== 'verified')).length})
                </button>
              </div>

              <input
                type="text"
                value={agentSearchTerm}
                onChange={(e) => setAgentSearchTerm(e.target.value)}
                className="form-input"
                style={{ width: '320px', fontSize: '0.85rem', padding: '0.45rem 0.85rem' }}
              />
            </div>

            {/* Table of All Agents */}
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Agent Organizer</th>
                    <th>Contact Info</th>
                    <th>Assigned Susu Circles</th>
                    <th>KYC &amp; License</th>
                    <th style={{ textAlign: 'right' }}>Super Admin Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAgents.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-slate-500)' }}>
                        No agents matched the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredAgents.map((agent) => {
                      const agentDisplayName =
                        agent.kycData?.fullName ||
                        `${agent.firstName} ${agent.surname}`.trim() ||
                        'Agent Organizer';
                      const agentGroups = groups.filter(g => g.agentId === agent.id);
                      const isVerified = agent.adminApprovalStatus === 'verified';
                      const isPending = agent.adminApprovalStatus === 'pending_admin_approval' || (agent.isKycSubmitted && !isVerified);

                      return (
                        <tr key={agent.id}>
                          {/* Agent Info */}
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <img
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(agent.email || agent.id)}`}
                                alt={agentDisplayName}
                                style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f1f5f9', border: '1px solid #cbd5e1' }}
                              />
                              <div>
                                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-emerald-950)' }}>
                                  {agentDisplayName}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>
                                  ID: {agent.id}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Contact Info */}
                          <td>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{agent.email}</div>
                            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{agent.phone || 'No phone'}</div>
                          </td>

                          {/* Assigned Susu Circles */}
                          <td>
                            {agentGroups.length === 0 ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontStyle: 'italic' }}>None</span>
                                <button
                                  onClick={() => {
                                    setSelectedAgent(agent);
                                    setIsAddGroupOpen(true);
                                  }}
                                  className="btn-gold"
                                  style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
                                >
                                  + Assign Group
                                </button>
                              </div>
                            ) : (
                              <div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.25rem' }}>
                                  {agentGroups.map(g => (
                                    <span
                                      key={g.id}
                                      style={{
                                        fontSize: '0.72rem',
                                        background: '#ecfdf5',
                                        color: '#065f46',
                                        border: '1px solid #a7f3d0',
                                        borderRadius: '6px',
                                        padding: '2px 6px',
                                        fontWeight: 600
                                      }}
                                    >
                                      {g.name} ({g.currency}{g.fixedDailyAmount}/d)
                                    </span>
                                  ))}
                                </div>
                                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                                  {agentGroups.length} {agentGroups.length === 1 ? 'Circle' : 'Circles'} total
                                </span>
                              </div>
                            )}
                          </td>

                          {/* KYC & License */}
                          <td>
                            <div style={{ marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                              <span
                                className={`status-pill ${
                                  isVerified ? 'active' : isPending ? 'pending' : 'missed'
                                }`}
                                onClick={() => {
                                  setDossierAgent(agent);
                                  setIsKycDossierOpen(true);
                                }}
                                style={{ cursor: 'pointer' }}
                                title="Click to inspect KYC details"
                              >
                                {isVerified ? 'Verified & Active' : isPending ? 'Pending KYC' : 'Rejected'}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setDossierAgent(agent);
                                  setIsKycDossierOpen(true);
                                }}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: 'var(--color-emerald-700)',
                                  fontWeight: 700,
                                  fontSize: '0.72rem',
                                  cursor: 'pointer',
                                  textDecoration: 'underline',
                                  padding: 0
                                }}
                                title="Inspect full KYC verification dossier"
                              >
                                View KYC
                              </button>
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'monospace' }}>
                              {agent.licenseNumber || 'Lic: PENDING'}
                            </div>
                          </td>

                          {/* Actions */}
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap', gap: '0.35rem' }}>
                              <button
                                onClick={() => {
                                  setDossierAgent(agent);
                                  setIsKycDossierOpen(true);
                                }}
                                className="btn-gold"
                                style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                                title="Inspect full KYC verification dossier and uploaded documents"
                              >
                                <Eye size={12} /> KYC
                              </button>
                              <button
                                onClick={() => {
                                  setActiveAgentId(agent.id);
                                  setRole('agent');
                                  onNavigate('/agent/dashboard');
                                }}
                                className="btn-secondary"
                                style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem', fontWeight: 600 }}
                                title="Login as this agent"
                              >
                                Impersonate
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedAgent(agent);
                                  setIsAddGroupOpen(true);
                                }}
                                className="btn-gold"
                                style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem', fontWeight: 600 }}
                                title="Create another Susu group for this agent"
                              >
                                + Add Group
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedAgent(agent);
                                  setIsEditAgentOpen(true);
                                }}
                                className="btn-outline"
                                style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}
                                title="Edit Agent basic details"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedAgent(agent);
                                  setIsEditAgentProfileOpen(true);
                                }}
                                className="btn-outline"
                                style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}
                                title="Edit full identity and KYC details"
                              >
                                Profile
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedAgent(agent);
                                  setIsDeleteAgentOpen(true);
                                }}
                                className="btn-danger"
                                style={{ padding: '0.3rem 0.55rem', fontSize: '0.75rem' }}
                                title="Delete agent"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GROUPS MANAGER */}
      {activeTab === 'groups' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem' }}>Global Susu Groups</h3>
              <p style={{ fontSize: '0.85rem', color: '#666' }}>Inspect, edit, or override rules for any group across the network.</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setIsAddGroupOpen(true)}
                className="btn-gold"
                style={{ fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Plus size={16} /> Add Group for Agent
              </button>
              <button
                onClick={() => {
                  const name = prompt('Enter new Susu group name:', group?.name || 'Volta Merchants Vault');
                  if (name) {
                    updateGroupSettings({ name });
                    alert(`Updated group name to: ${name}`);
                  }
                }}
                className="btn-primary"
                style={{ fontSize: '0.85rem' }}
              >
                <Edit size={16} /> Edit Group Parameters
              </button>
            </div>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Group ID</th>
                  <th>Name</th>
                  <th>Assigned Agent</th>
                  <th>Daily Amount</th>
                  <th>Currency</th>
                  <th>Cycle Start</th>
                  <th>Members</th>
                  <th>Paystack PK</th>
                  <th>Status</th>
                  <th>Admin Actions</th>
                </tr>
              </thead>
              <tbody>
                {groups.length === 0 ? (
                  <tr>
                    <td colSpan={10} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--color-slate-500)' }}>
                      <p style={{ margin: '0 0 1rem 0' }}>No group created yet — click below to initialize a group for an agent.</p>
                      <button
                        onClick={() => setIsAddGroupOpen(true)}
                        className="btn-gold"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem' }}
                      >
                        <Plus size={16} /> Add Group for Agent
                      </button>
                    </td>
                  </tr>
                ) : (
                  groups.map((grp) => {
                    const assignedAgent = agents.find(a => a.id === grp.agentId);
                    const agentName = assignedAgent
                      ? (assignedAgent.kycData?.fullName || `${assignedAgent.firstName} ${assignedAgent.surname}`.trim() || assignedAgent.email)
                      : 'Unassigned';
                    const groupMembers = members.filter(m => m.groupId === grp.id);

                    return (
                      <tr key={grp.id}>
                        <td style={{ fontFamily: 'monospace', fontWeight: 700 }}>{grp.id}</td>
                        <td style={{ fontWeight: 700, color: 'var(--color-emerald-950)' }}>{grp.name}</td>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{agentName}</div>
                          {assignedAgent?.email && (
                            <div style={{ fontSize: '0.72rem', color: '#666' }}>{assignedAgent.email}</div>
                          )}
                        </td>
                        <td>{grp.fixedDailyAmount}</td>
                        <td><span className="status-pill active">{grp.currency}</span></td>
                        <td>{grp.cycleStartDate}</td>
                        <td>{groupMembers.length} Members</td>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{grp.paystackPublicKey || '—'}</td>
                        <td>
                          <span className={`status-pill ${grp.status}`}>{grp.status}</span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                            <button
                              onClick={() => {
                                const newAmt = prompt('Enter new fixed daily amount:', String(grp.fixedDailyAmount));
                                if (newAmt && !isNaN(Number(newAmt))) {
                                  updateGroupSettings({ fixedDailyAmount: Number(newAmt) }, grp.id);
                                }
                              }}
                              className="btn-secondary"
                              style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem' }}
                            >
                              Override Daily Fee
                            </button>
                            <button
                              onClick={() => {
                                const name = prompt('Rename group:', grp.name);
                                if (name && name.trim()) {
                                  updateGroupSettings({ name: name.trim() }, grp.id);
                                }
                              }}
                              className="btn-secondary"
                              style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem' }}
                            >
                              Rename Group
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Delete group "${grp.name}" (${grp.id}) and all its member records? This cannot be undone.`)) {
                                  deleteGroup(grp.id);
                                }
                              }}
                              style={{
                                padding: '0.25rem 0.55rem',
                                fontSize: '0.75rem',
                                background: '#fee2e2',
                                color: '#dc2626',
                                borderRadius: '6px',
                                border: '1px solid #fca5a5',
                                cursor: 'pointer'
                              }}
                            >
                              Delete Group
                            </button>
                            <button
                              onClick={() => {
                                updateGroupSettings({ status: grp.status === 'active' ? 'completed' : 'active' }, grp.id);
                              }}
                              style={{
                                padding: '0.25rem 0.55rem',
                                fontSize: '0.75rem',
                                background: grp.status === 'active' ? '#fee2e2' : '#dcfce7',
                                color: grp.status === 'active' ? '#dc2626' : '#166534',
                                borderRadius: '6px',
                                border: 'none',
                                cursor: 'pointer'
                              }}
                            >
                              {grp.status === 'active' ? 'Freeze Group' : 'Activate Group'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: USER DIRECTORY & PERMISSIONS */}
      {activeTab === 'users' && (
        <div className="card">
          {/* Agent KYC Review Panels for any pending agent */}
          {agents.filter(a => a.adminApprovalStatus === 'pending_admin_approval').map(pendingAgent => {
            const pendingKyc = pendingAgent.kycData;
            return (
              <div
                key={`pending-${pendingAgent.id}`}
                style={{
                  background: 'linear-gradient(135deg, #fffbeb, #fff)',
                  border: '2px solid var(--color-gold-400)',
                  borderRadius: '14px',
                  padding: '1.5rem',
                  marginBottom: '2rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ background: 'var(--color-gold-100)', borderRadius: '50%', padding: '0.5rem', border: '2px solid var(--color-gold-400)' }}>
                    <ShieldCheck size={22} color="var(--color-gold-700)" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--color-gold-800)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ACTION REQUIRED</div>
                    <h4 style={{ fontSize: '1.1rem', color: 'var(--color-emerald-950)', margin: 0 }}>Agent KYC Pending Admin Verification — {pendingAgent.firstName} {pendingAgent.surname}</h4>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.25rem', background: 'var(--color-slate-50)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--color-slate-200)' }}>
                  <div><span style={{ fontSize: '0.72rem', color: 'var(--color-slate-500)', display: 'block' }}>Agent Name</span><strong style={{ fontSize: '0.9rem' }}>{pendingKyc?.fullName || `${pendingAgent.firstName} ${pendingAgent.surname}`}</strong></div>
                  <div><span style={{ fontSize: '0.72rem', color: 'var(--color-slate-500)', display: 'block' }}>ID Number</span><strong style={{ fontSize: '0.9rem', fontFamily: 'monospace' }}>{pendingKyc?.idCardNumber || 'N/A'}</strong></div>
                  <div><span style={{ fontSize: '0.72rem', color: 'var(--color-slate-500)', display: 'block' }}>Payment Status</span><span className="status-pill active" style={{ fontSize: '0.72rem' }}>Activation Paid ✓</span></div>
                  <div><span style={{ fontSize: '0.72rem', color: 'var(--color-slate-500)', display: 'block' }}>Email</span><strong style={{ fontSize: '0.9rem' }}>{pendingAgent.email}</strong></div>
                  <div><span style={{ fontSize: '0.72rem', color: 'var(--color-slate-500)', display: 'block' }}>License Number</span><strong style={{ fontSize: '0.9rem', fontFamily: 'monospace' }}>{pendingAgent.licenseNumber || 'Pending'}</strong></div>
                  <div><span style={{ fontSize: '0.72rem', color: 'var(--color-slate-500)', display: 'block' }}>Location</span><strong style={{ fontSize: '0.9rem' }}>{pendingKyc?.cityCountry || 'N/A'}</strong></div>
                </div>

                <div style={{ marginTop: '1.25rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
                  <h5 style={{ fontSize: '0.9rem', margin: '0 0 0.9rem', color: '#0f172a' }}>Submitted KYC Form & Upload Review</h5>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    <div><span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>Full Name</span><strong style={{ fontSize: '0.9rem' }}>{pendingKyc?.fullName || 'N/A'}</strong></div>
                    <div><span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>Date of Birth</span><strong style={{ fontSize: '0.9rem' }}>{pendingKyc?.dob || 'N/A'}</strong></div>
                    <div><span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>Gender</span><strong style={{ fontSize: '0.9rem' }}>{pendingKyc?.gender || 'N/A'}</strong></div>
                    <div><span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>ID Type</span><strong style={{ fontSize: '0.9rem' }}>{pendingKyc?.idCardType || 'N/A'}</strong></div>
                    <div><span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>ID Number</span><strong style={{ fontSize: '0.9rem', fontFamily: 'monospace' }}>{pendingKyc?.idCardNumber || 'N/A'}</strong></div>
                    <div><span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>City / Country</span><strong style={{ fontSize: '0.9rem' }}>{pendingKyc?.cityCountry || 'N/A'}</strong></div>
                    <div><span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>Digital Address</span><strong style={{ fontSize: '0.9rem' }}>{pendingKyc?.digitalAddress || 'N/A'}</strong></div>
                    <div><span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>Occupation</span><strong style={{ fontSize: '0.9rem' }}>{pendingKyc?.occupation || 'N/A'}</strong></div>
                    <div><span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>Marital Status</span><strong style={{ fontSize: '0.9rem' }}>{pendingKyc?.maritalStatus || 'N/A'}</strong></div>
                    <div><span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>Business Cert. No.</span><strong style={{ fontSize: '0.9rem' }}>{pendingKyc?.businessCertificateNumber || 'N/A'}</strong></div>
                    <div><span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>Residential Address</span><strong style={{ fontSize: '0.9rem' }}>{pendingKyc?.residentialAddress || 'N/A'}</strong></div>
                    <div><span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>Submitted</span><strong style={{ fontSize: '0.9rem' }}>{pendingKyc?.submittedAt ? new Date(pendingKyc.submittedAt).toLocaleString() : 'N/A'}</strong></div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    {renderDocumentPreview('ID Card Front', pendingKyc?.idCardFrontUrl)}
                    {renderDocumentPreview('ID Card Back', pendingKyc?.idCardBackUrl)}
                    {renderDocumentPreview('Selfie', pendingKyc?.selfieUrl)}
                    {renderDocumentPreview('Business Certificate', pendingKyc?.businessCertificateUrl)}
                    {renderDocumentPreview('Utility Bill', pendingKyc?.utilityBillUrl)}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button
                    className="btn-gold"
                    style={{ padding: '0.7rem 1.5rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem' }}
                    onClick={() => {
                      setDossierAgent(pendingAgent);
                      setIsKycDossierOpen(true);
                    }}
                  >
                    <Eye size={18} /> Inspect Full KYC Dossier
                  </button>
                  <button
                    className="btn-primary"
                    style={{ padding: '0.7rem 1.5rem', fontSize: '0.9rem', fontWeight: 700 }}
                    onClick={() => {
                      approveAgentKyc(pendingAgent.id, 'Identity and business documents verified by admin.');
                      alert(`Agent ${pendingAgent.firstName} ${pendingAgent.surname} KYC approved! Full privileges unlocked.`);
                    }}
                  >
                    ✅ Quick Approve
                  </button>
                  <button
                    style={{
                      background: '#fee2e2',
                      color: '#dc2626',
                      border: '1px solid #fca5a5',
                      borderRadius: '10px',
                      padding: '0.7rem 1.5rem',
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                    onClick={() => {
                      setDossierAgent(pendingAgent);
                      setIsKycDossierOpen(true);
                    }}
                  >
                    ❌ Reject...
                  </button>
                </div>
              </div>
            );
          })}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem' }}>Platform Users &amp; Permission Directory</h3>
              <p style={{ fontSize: '0.85rem', color: '#666' }}>Manage agents, rotate circle members, edit profiles, or adjust permissions.</p>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              <button
                onClick={() => {
                  setSelectedAgent(agents[0] || agentAccount);
                  setIsAddGroupOpen(true);
                }}
                className="btn-gold"
                style={{ fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <Plus size={14} /> Add Group for Agent
              </button>
              <button
                onClick={() => {
                  setSelectedAgent(agentAccount);
                  setIsEditAgentOpen(true);
                }}
                className="btn-secondary"
                style={{ fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <ShieldCheck size={14} /> Edit Agent
              </button>
              <button
                onClick={() => {
                  setSelectedAgent(agentAccount);
                  setIsEditAgentProfileOpen(true);
                }}
                className="btn-primary"
                style={{ fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <UserCheck size={14} /> Edit Agent Profile
              </button>
            </div>
          </div>

          <div className="table-responsive" style={{ marginBottom: '2rem' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Current Role</th>
                  <th>Reliability</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {/* Super Admin User */}
                <tr style={{ background: '#fefce8' }}>
                  <td>
                    <div style={{ fontWeight: 800, color: 'var(--color-gold-900)' }}>Super Admin</div>
                    <div style={{ fontSize: '0.75rem', color: '#666' }}>Username: Peterpan</div>
                  </td>
                  <td>peterpan@susu.dev</td>
                  <td>—</td>
                  <td>
                    <span className="status-pill pending" style={{ background: 'var(--color-gold-400)', color: '#000', fontWeight: 800 }}>
                      Super Admin (Developer)
                    </span>
                  </td>
                  <td>100%</td>
                  <td>
                    <span style={{ fontSize: '0.75rem', color: '#666', fontStyle: 'italic' }}>Protected Account</span>
                  </td>
                </tr>

                {/* Agent Users (Multi-Agent Directory) */}
                {agents.map((agent) => {
                  const agentDisplayName =
                    agent.kycData?.fullName ||
                    `${agent.firstName} ${agent.surname}`.trim() ||
                    'Agent Organizer';
                  const agentGroups = groups.filter(g => g.agentId === agent.id);
                  const assignedGroupName =
                    agentGroups.length > 0
                      ? agentGroups.map(g => g.name).join(', ')
                      : 'No group assigned yet';

                  return (
                    <tr key={agent.id}>
                      <td>
                        <div style={{ fontWeight: 700 }}>{agentDisplayName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#666' }}>
                          {assignedGroupName} • <span style={{ fontFamily: 'monospace' }}>{agent.licenseNumber || 'License Pending'}</span>
                        </div>
                      </td>
                      <td>{agent.email || 'agent@susu.gh'}</td>
                      <td>{agent.phone || '—'}</td>
                      <td>
                        <span className="status-pill current" style={{ marginRight: '0.3rem' }}>Agent Admin</span>
                        <span
                          className={`status-pill ${
                            agent.adminApprovalStatus === 'verified'
                              ? 'active'
                              : agent.adminApprovalStatus === 'rejected'
                              ? 'missed'
                              : 'pending'
                          }`}
                        >
                          {agent.adminApprovalStatus === 'verified'
                            ? 'Verified'
                            : agent.adminApprovalStatus === 'rejected'
                            ? 'Rejected'
                            : 'Pending KYC'}
                        </span>
                      </td>
                      <td>100%</td>
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                          <button
                            onClick={() => {
                              setSelectedAgent(agent);
                              setIsEditAgentOpen(true);
                            }}
                            className="btn-secondary"
                            style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                            title="Edit Agent Account"
                          >
                            Edit Agent
                          </button>
                          <button
                            onClick={() => {
                              setSelectedAgent(agent);
                              setIsEditAgentProfileOpen(true);
                            }}
                            className="btn-outline"
                            style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                            title="Edit Agent KYC & Profile"
                          >
                            Edit Profile
                          </button>
                          <button
                            onClick={() => {
                              setSelectedAgent(agent);
                              setIsAddGroupOpen(true);
                            }}
                            className="btn-gold"
                            style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                            title="Add Susu Group for Agent"
                          >
                            + Add Group
                          </button>
                          <button
                            onClick={() => {
                              setSelectedAgent(agent);
                              setIsDeleteAgentOpen(true);
                            }}
                            className="btn-danger"
                            style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                            title="Delete or Reset Agent"
                          >
                            Delete Agent
                          </button>
                          <button
                            onClick={() => {
                              setActiveAgentId(agent.id);
                              setRole('agent');
                              onNavigate('/agent/dashboard');
                            }}
                            className="btn-secondary"
                            style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                          >
                            Impersonate Session
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {/* Members */}
                {members.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '1.5rem', color: '#666' }}>
                      No group members registered yet.
                    </td>
                  </tr>
                ) : (
                  members.map((mem) => (
                    <tr key={mem.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{mem.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#666' }}>Position #{mem.positionInRotation}</div>
                      </td>
                      <td>{mem.email}</td>
                      <td>{mem.phone}</td>
                      <td><span className="status-pill active">Group Member</span></td>
                      <td>
                        <span style={{ fontWeight: 700, color: mem.reliabilityScore >= 80 ? '#16a34a' : '#dc2626' }}>
                          {mem.reliabilityScore}%
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                          <button
                            onClick={() => {
                              setSelectedMember(mem);
                              setIsEditMemberOpen(true);
                            }}
                            className="btn-secondary"
                            style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                            title="Edit Member Details"
                          >
                            Edit Member
                          </button>
                          <button
                            onClick={() => {
                              setSelectedMember(mem);
                              setIsEditMemberProfileOpen(true);
                            }}
                            className="btn-outline"
                            style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                            title="Edit Member Profile & Credentials"
                          >
                            Edit Profile
                          </button>
                          <button
                            onClick={() => {
                              setSelectedMember(mem);
                              setIsDeleteMemberOpen(true);
                            }}
                            className="btn-danger"
                            style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                            title="Delete Member"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => {
                              setRole('member', mem.id);
                              onNavigate('/member/dashboard');
                            }}
                            className="btn-secondary"
                            style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                          >
                            Login as {mem.name.split(' ')[0]}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* TAB 4: TRANSACTIONS & PAYOUTS */}
      {activeTab === 'vault' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem' }}>Platform Transactions & Payouts Vault</h3>
              <p style={{ fontSize: '0.85rem', color: '#666' }}>Real-time transaction stream and payout distribution records across circles.</p>
            </div>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: '#666', display: 'block', fontSize: '0.78rem' }}>Total Recorded Transactions:</span>
                <strong style={{ fontSize: '1.1rem', color: 'var(--color-emerald-950)' }}>{payments.length}</strong>
              </div>
              <div>
                <span style={{ color: '#666', display: 'block', fontSize: '0.78rem' }}>Settlement Distribution:</span>
                <span style={{ color: '#16a34a', fontWeight: 700 }}>Direct Circle Payout & Agent Liquidity</span>
              </div>
              <div>
                <span style={{ color: '#666', display: 'block', fontSize: '0.78rem' }}>Circuit Breaker Status:</span>
                <span style={{ color: platformPaymentConfig.emergencyPayoutFreeze ? '#dc2626' : '#16a34a', fontWeight: 700 }}>
                  {platformPaymentConfig.emergencyPayoutFreeze ? 'Payouts Frozen' : 'Operational / Active'}
                </span>
              </div>
            </div>
          </div>

          <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--color-emerald-950)' }}>
            Recent Payment Transactions ({payments.length})
          </h4>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Member ID</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Transaction Ref</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', color: '#666', padding: '1.5rem' }}>
                      No payment transactions recorded yet.
                    </td>
                  </tr>
                ) : (
                  payments.slice(0, 10).map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{p.id}</td>
                      <td>{p.memberId}</td>
                      <td>{p.paymentDate}</td>
                      <td style={{ fontWeight: 700 }}>{group?.currency || 'GH₵'} {p.amount}</td>
                      <td>
                        <span className="status-pill active" style={{ fontSize: '0.7rem' }}>
                          {p.paymentMethod}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                        {p.paystackReference || 'CASH_CONFIRMED'}
                      </td>
                      <td>
                        <span className={`status-pill ${p.status}`}>{p.status}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: MASTER PAYMENT GATEWAY ENGINE */}
      {activeTab === 'payments' && (
        <MasterPaymentEngineTab />
      )}

      {/* Super Admin Management Modals */}
      <EditAgentModal
        agent={selectedAgent}
        isOpen={isEditAgentOpen}
        onClose={() => {
          setIsEditAgentOpen(false);
          setSelectedAgent(null);
        }}
      />

      <EditAgentProfileModal
        agent={selectedAgent}
        isOpen={isEditAgentProfileOpen}
        onClose={() => {
          setIsEditAgentProfileOpen(false);
          setSelectedAgent(null);
        }}
      />

      <AddGroupForAgentModal
        agent={selectedAgent}
        isOpen={isAddGroupOpen}
        onClose={() => {
          setIsAddGroupOpen(false);
          setSelectedAgent(null);
        }}
      />

      <DeleteAgentModal
        agent={selectedAgent}
        isOpen={isDeleteAgentOpen}
        onClose={() => {
          setIsDeleteAgentOpen(false);
          setSelectedAgent(null);
        }}
      />

      <EditMemberModal
        member={selectedMember}
        isOpen={isEditMemberOpen}
        onClose={() => {
          setIsEditMemberOpen(false);
          setSelectedMember(null);
        }}
      />

      <EditMemberProfileModal
        member={selectedMember}
        isOpen={isEditMemberProfileOpen}
        onClose={() => {
          setIsEditMemberProfileOpen(false);
          setSelectedMember(null);
        }}
      />

      <DeleteMemberModal
        member={selectedMember}
        isOpen={isDeleteMemberOpen}
        onClose={() => {
          setIsDeleteMemberOpen(false);
          setSelectedMember(null);
        }}
      />

      {/* KYC Inspection Dossier Modal */}
      <KycDossierModal
        isOpen={isKycDossierOpen}
        onClose={() => {
          setIsKycDossierOpen(false);
          setDossierAgent(null);
        }}
        agent={dossierAgent}
        onApprove={(agentId, notes) => {
          approveAgentKyc(agentId, notes);
          alert(`KYC approved and Agent License issued!`);
        }}
        onReject={(agentId, reason) => {
          rejectAgentKyc(agentId, reason);
          alert(`KYC application rejected with compliance notice.`);
        }}
      />

      {/* Fullscreen Document Lightbox */}
      {adminLightboxImg && (
        <div
          onClick={() => setAdminLightboxImg(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.92)',
            zIndex: 100000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '85vh',
              background: '#0f172a',
              borderRadius: '14px',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem 1.25rem',
                background: '#1e293b',
                color: '#fff',
                borderBottom: '1px solid #334155'
              }}
            >
              <span style={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={16} color="var(--color-gold-400)" />
                {adminLightboxImg.label} — Document Inspection
              </span>
              <button
                type="button"
                onClick={() => setAdminLightboxImg(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: '1rem', background: '#020617', textAlign: 'center' }}>
              <img
                src={adminLightboxImg.src}
                alt={adminLightboxImg.label}
                style={{
                  maxWidth: '85vw',
                  maxHeight: '75vh',
                  objectFit: 'contain',
                  borderRadius: '8px'
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};