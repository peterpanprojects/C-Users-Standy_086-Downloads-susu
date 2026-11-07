import React, { useState } from 'react';
import { useSusu } from '../../context/SusuContext';
import {
  Layers,
  Plus,
  Users,
  Calendar,
  Banknote,
  CheckCircle2,
  Sliders,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Award,
  Sparkles
} from 'lucide-react';
import { CreateGroupModal } from '../../components/agent/CreateGroupModal';

interface AgentGroupsPageProps {
  onNavigate: (path: string) => void;
}

export const AgentGroupsPage: React.FC<AgentGroupsPageProps> = ({ onNavigate }) => {
  const {
    groups,
    myGroups,
    activeGroupId,
    setActiveGroupId,
    members,
    deleteGroup,
    agentAccount
  } = useSusu();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Groups strictly belonging to current agent
  const displayGroups = myGroups;

  const filteredGroups = displayGroups.filter((g) =>
    g.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectGroup = (groupId: string, navigateToDashboard = true) => {
    setActiveGroupId(groupId);
    if (navigateToDashboard) {
      onNavigate('/agent/dashboard');
    }
  };

  const handleDeleteGroup = (groupId: string, groupName: string) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the circle "${groupName}"? All its scheduled members and payout records will be removed.`
    );
    if (confirmDelete) {
      deleteGroup(groupId);
    }
  };

  const agentDisplayName =
    agentAccount.kycData?.fullName ||
    `${agentAccount.firstName} ${agentAccount.surname}`.trim() ||
    'Agent Organizer';

  return (
    <div className="agent-groups-page" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Top Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem',
          marginBottom: '2rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span className="badge-agent">AGENT CIRCLE HUB</span>
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
              {displayGroups.length} {displayGroups.length === 1 ? 'Group' : 'Groups'} Total
            </span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-emerald-950)', margin: '0 0 0.35rem 0' }}>
            My Susu Groups &amp; Savings Circles
          </h1>
          <p style={{ color: 'var(--color-slate-600)', fontSize: '0.92rem', margin: 0 }}>
            Create and organize multiple rotating savings circles. Each group has its own independent members, calendar, and daily contribution amounts.
          </p>
        </div>

        {/* Primary Action Button to Create Group */}
        <button
          className="btn-gold"
          onClick={() => setCreateModalOpen(true)}
          id="btn-create-group-top"
          style={{
            padding: '0.85rem 1.65rem',
            fontSize: '0.95rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 15px rgba(229, 169, 60, 0.4)'
          }}
        >
          <Plus size={18} /> + Create New Group
        </button>
      </div>

      {/* Info / Quick Switch bar */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(11, 31, 23, 0.04) 0%, rgba(229, 169, 60, 0.08) 100%)',
          border: '1px solid var(--color-gold-300)',
          borderRadius: '12px',
          padding: '1rem 1.25rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ShieldCheck size={22} color="var(--color-emerald-700)" />
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--color-emerald-950)' }}>
              Agent Multi-Group Organizer: {agentDisplayName}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-slate-600)' }}>
              Select any group below to make it your active dashboard circle. All members and cash payments will bind to that selected group.
            </div>
          </div>
        </div>

        {displayGroups.length > 3 && (
          <input
            type="text"
            className="form-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '220px', padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
          />
        )}
      </div>

      {/* Groups Grid */}
      {displayGroups.length === 0 ? (
        <div
          className="card"
          style={{
            padding: '4rem 2rem',
            textAlign: 'center',
            borderRadius: '16px',
            border: '2px dashed var(--color-slate-200)',
            background: 'var(--color-slate-50)'
          }}
        >
          <div
            style={{
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(229, 169, 60, 0.2) 0%, rgba(37, 139, 111, 0.25) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem'
            }}
          >
            <Layers size={32} color="var(--color-gold-600)" />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-emerald-950)', marginBottom: '0.5rem' }}>
            No Susu Groups Created Yet
          </h2>
          <p style={{ color: 'var(--color-slate-600)', maxWidth: '460px', margin: '0 auto 1.75rem', fontSize: '0.95rem', lineHeight: 1.6 }}>
            As an accredited Agent, you can create one or more Susu groups for different communities, market circles, or friend networks.
          </p>
          <button
            className="btn-gold"
            onClick={() => setCreateModalOpen(true)}
            style={{ padding: '0.9rem 2.25rem', fontSize: '1rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Plus size={18} /> Create Your First Susu Group
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '1.5rem'
          }}
        >
          {filteredGroups.map((grp) => {
            const isActive = grp.id === activeGroupId;
            const groupMembers = members.filter((m) => m.groupId === grp.id);
            const weeklyPot = groupMembers.length * grp.fixedDailyAmount * 7;

            return (
              <div
                key={grp.id}
                className="card"
                style={{
                  borderRadius: '16px',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  border: isActive ? '2px solid var(--color-emerald-600)' : '1px solid var(--color-slate-200)',
                  boxShadow: isActive ? '0 8px 24px rgba(37, 139, 111, 0.16)' : '0 2px 8px rgba(0,0,0,0.04)',
                  position: 'relative',
                  background: isActive
                    ? 'linear-gradient(180deg, #ffffff 0%, rgba(240, 253, 244, 0.4) 100%)'
                    : '#ffffff'
                }}
              >
                {/* Active Selection Badge */}
                {isActive && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: '#ffffff',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: '12px',
                      boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)'
                    }}
                  >
                    <CheckCircle2 size={12} /> ACTIVE CIRCLE
                  </div>
                )}

                {/* Group Title & Icon */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', marginBottom: '1.25rem' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      background: isActive
                        ? 'linear-gradient(135deg, #0b1f17 0%, #17382d 100%)'
                        : 'var(--color-slate-100)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Layers size={22} color={isActive ? '#E5A93C' : 'var(--color-slate-600)'} />
                  </div>
                  <div style={{ paddingRight: isActive ? '90px' : '0' }}>
                    <h2 style={{ fontSize: '1.18rem', fontWeight: 800, margin: '0 0 0.25rem 0', color: 'var(--color-emerald-950)' }}>
                      {grp.name}
                    </h2>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)', fontFamily: 'monospace' }}>
                      ID: {grp.id}
                    </span>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.75rem',
                    background: 'var(--color-slate-50)',
                    padding: '0.85rem 1rem',
                    borderRadius: '12px',
                    marginBottom: '1.25rem'
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-slate-500)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Daily Fee
                    </span>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--color-emerald-900)' }}>
                      {grp.currency}{grp.fixedDailyAmount}
                      <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--color-slate-600)' }}>/day</span>
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-slate-500)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Members
                    </span>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--color-emerald-900)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Users size={16} color="var(--color-emerald-700)" />
                      {groupMembers.length}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-slate-500)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Cycle Start
                    </span>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--color-slate-700)' }}>
                      {grp.cycleStartDate}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-slate-500)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Weekly Pot
                    </span>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-gold-700)' }}>
                      {grp.currency}{weeklyPot.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {isActive ? (
                    <button
                      className="btn-primary"
                      onClick={() => onNavigate('/agent/dashboard')}
                      style={{
                        width: '100%',
                        justifyContent: 'center',
                        padding: '0.7rem',
                        fontSize: '0.88rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.45rem'
                      }}
                    >
                      Open Dashboard <ArrowRight size={16} />
                    </button>
                  ) : (
                    <button
                      className="btn-gold"
                      onClick={() => handleSelectGroup(grp.id, true)}
                      style={{
                        width: '100%',
                        justifyContent: 'center',
                        padding: '0.7rem',
                        fontSize: '0.88rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.45rem'
                      }}
                    >
                      Switch to this Group <ArrowRight size={16} />
                    </button>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.4rem', marginTop: '0.25rem' }}>
                    <button
                      className="btn-outline"
                      onClick={() => {
                        handleSelectGroup(grp.id, false);
                        onNavigate('/agent/members');
                      }}
                      style={{ padding: '0.45rem 0.25rem', fontSize: '0.75rem', justifyContent: 'center' }}
                      title="View Group Members"
                    >
                      <Users size={14} /> Members
                    </button>
                    <button
                      className="btn-outline"
                      onClick={() => {
                        handleSelectGroup(grp.id, false);
                        onNavigate('/agent/calendar');
                      }}
                      style={{ padding: '0.45rem 0.25rem', fontSize: '0.75rem', justifyContent: 'center' }}
                      title="Rotation Calendar"
                    >
                      <Calendar size={14} /> Calendar
                    </button>
                    <button
                      className="btn-outline"
                      onClick={() => {
                        handleSelectGroup(grp.id, false);
                        onNavigate('/agent/settings');
                      }}
                      style={{ padding: '0.45rem 0.25rem', fontSize: '0.75rem', justifyContent: 'center' }}
                      title="Group Settings"
                    >
                      <Sliders size={14} /> Settings
                    </button>
                  </div>

                  {displayGroups.length > 1 && (
                    <button
                      onClick={() => handleDeleteGroup(grp.id, grp.name)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-red-600, #dc2626)',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.35rem',
                        padding: '0.35rem',
                        marginTop: '0.25rem',
                        opacity: 0.8
                      }}
                    >
                      <Trash2 size={13} /> Delete Circle
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal to Create New Group */}
      <CreateGroupModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={(newGroupId) => {
          setActiveGroupId(newGroupId);
        }}
      />
    </div>
  );
};
