import React, { useState } from 'react';
import { useSusu } from '../../context/SusuContext';
import { getWeekDays, formatShortDate, getDayOfWeekShort } from '../../utils/dates';
import { Banknote, Users, Calendar, ArrowUpRight, CheckCircle2, Clock, AlertCircle, Plus, CreditCard, Sliders, Layers, MessageCircle } from 'lucide-react';
import { InviteMemberModal } from '../../components/agent/InviteMemberModal';
import { ManualPayModal } from '../../components/agent/ManualPayModal';
import { CreateGroupModal } from '../../components/agent/CreateGroupModal';
import { AgentMessaging } from '../../components/agent/AgentMessaging';



interface AgentDashboardPageProps {
  onNavigate: (path: string) => void;
}

export const AgentDashboardPage: React.FC<AgentDashboardPageProps> = ({ onNavigate }) => {
 const {
    group,
    groups,
    myGroups,
    activeGroupId,
    setActiveGroupId,
    members,
    schedule,
    payments,
    remindMember
  } = useSusu();

  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [manualPayModalOpen, setManualPayModalOpen] = useState(false);
  const [createGroupModalOpen, setCreateGroupModalOpen] = useState(false);
  const [selectedMemberForCash, setSelectedMemberForCash] = useState<string>('');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupAmount, setNewGroupAmount] = useState(20);
  const [newGroupCurrency, setNewGroupCurrency] = useState('GH₵');
  const [activeTab, setActiveTab] = useState<'overview' | 'messages'>('overview');

  if (!group) {
    return (
      <div style={{ maxWidth: '560px', margin: '3rem auto', padding: '0 1rem' }}>
        <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏦</div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Welcome, Agent!</h1>
          <p style={{ color: 'var(--color-slate-600)', fontSize: '0.95rem', marginBottom: '2rem' }}>
            Your account has been verified. Set up your first Susu group.
          </p>
          {!showCreateGroup? (
            <button className="btn-gold" style={{ padding: '0.9rem 2.5rem' }} onClick={() => setShowCreateGroup(true)}>+ Create My Susu Group</button>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); if (newGroupName.trim()) { const { createGroup } = useSusu(); } }} style={{ textAlign: 'left' }}>
              {/* create form */}
            </form>
          )}
        </div>
      </div>
    );
  }

  const currentGroupMembers = members.filter((m) => m.groupId === group.id);
  const currentWeek = schedule.find((s) => s.status === 'current') || schedule[0];
  const activeMonday = currentWeek? currentWeek.weekStartDate : group.cycleStartDate;
  const currentWeekDays = getWeekDays(activeMonday);
  const totalExpectedThisWeek = group.fixedDailyAmount * 7 * currentGroupMembers.length;
  const currentWeekPayments = payments.filter((p) => p.groupId === group.id && currentWeekDays.includes(p.paymentDate));
  const totalCollectedThisWeek = currentWeekPayments.filter((p) => p.status === 'paid').reduce((acc, p) => acc + p.amount, 0);
  const collectionPercentage = Math.round((totalCollectedThisWeek / (totalExpectedThisWeek || 1)) * 100) || 0;
  const nextPayoutMember = currentWeek? currentGroupMembers.find((m) => m.id === currentWeek.memberId) : currentGroupMembers[0];
  const agentGroupsList = myGroups;

  return (
    <div className="agent-dashboard">
      {/* TAB SWITCHER - ADD THIS */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: '#f1f5f9', padding: '4px', borderRadius: '12px', width: 'fit-content' }}>
        <button onClick={() => setActiveTab('overview')} style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer', background: activeTab==='overview'?'white':'transparent', boxShadow: activeTab==='overview'?'0 1px 3px rgba(0,0,0,0.1)':'none' }}>Overview</button>
        <button onClick={() => setActiveTab('messages')} style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer', background: activeTab==='messages'?'white':'transparent', boxShadow: activeTab==='messages'?'0 1px 3px rgba(0,0,0,0.1)':'none', display: 'flex', alignItems: 'center', gap: '6px' }}><MessageCircle size={16}/> Messages</button>
      </div>

      {activeTab === 'messages'? (
        <AgentMessaging />
      ) : (
        <>
      {/* Header Banner */}
      <div className="dashboard-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
            <span className="badge-agent">AGENT ORGANIZER PANEL</span>
            {agentGroupsList.length > 1 && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '2px 8px' }}>
                <Layers size={14} color="#b45309" />
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#92400e' }}>Switch Circle:</span>
                <select value={activeGroupId || group.id} onChange={(e) => setActiveGroupId(e.target.value)} style={{ fontSize: '0.8rem', fontWeight: 700, border: 'none', background: 'transparent', color: 'var(--color-emerald-950)', cursor: 'pointer', outline: 'none', padding: '2px 4px' }}>
                  {agentGroupsList.map((g) => <option key={g.id} value={g.id}>{g.name} ({g.currency}{g.fixedDailyAmount}/d)</option>)}
                </select>
              </div>
            )}
            <button onClick={() => onNavigate('/agent/groups')} style={{ background: 'none', border: 'none', color: 'var(--color-emerald-700)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>View All ({agentGroupsList.length})</button>
          </div>
          <h1>{group.name}</h1>
          <p style={{ color: 'var(--color-slate-600)', fontSize: '0.9rem' }}>Cycle Start: <strong>{group.cycleStartDate}</strong> | Daily: <strong>{group.currency}{group.fixedDailyAmount}/day</strong></p>
        </div>
        <div className="dashboard-actions">
          <button className="btn-gold" onClick={() => setCreateGroupModalOpen(true)}><Plus size={16} /> + New Group</button>
          <button className="btn-outline" onClick={() => onNavigate('/agent/settings')}><Sliders size={16} /> Set Amount</button>
          <button className="btn-outline" onClick={() => onNavigate('/agent/calendar')}><Calendar size={16} /> Calendar</button>
          <button className="btn-outline" onClick={() => onNavigate('/agent/payment-config')}><CreditCard size={16} /> Payment Config</button>
          <button className="btn-gold" onClick={() => setInviteModalOpen(true)}><Plus size={16} /> Invite</button>
          <button className="btn-primary" onClick={() => setManualPayModalOpen(true)}><Banknote size={16} /> Cash Override</button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="metrics-grid">
        <div className="card metric-card">
          <div className="metric-header"><span className="metric-title">Collected This Week</span><Banknote size={20} color="var(--color-emerald-700)" /></div>
          <div className="metric-value">{group.currency}{totalCollectedThisWeek.toLocaleString()}<span className="metric-total">/ {group.currency}{totalExpectedThisWeek.toLocaleString()}</span></div>
          <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: `${collectionPercentage}%` }} /></div>
          <span className="metric-sub">{collectionPercentage}% collected</span>
        </div>
        <div className="card metric-card">
          <div className="metric-header"><span className="metric-title">Current Payout Recipient</span><Calendar size={20} color="var(--color-gold-600)" /></div>
          <div className="metric-value" style={{ fontSize: '1.4rem' }}>{nextPayoutMember? nextPayoutMember.name : 'Unassigned'}</div>
          <div className="metric-sub" style={{ color: 'var(--color-gold-700)', fontWeight: 600 }}>{currentWeek? `Week #${currentWeek.weekNumber} (${group.currency}${currentWeek.expectedPoolAmount.toLocaleString()})` : 'Awaiting members'}</div>
        </div>
        <div className="card metric-card">
          <div className="metric-header"><span className="metric-title">Group Members</span><Users size={20} color="var(--color-emerald-700)" /></div>
          <div className="metric-value">{members.length} Members</div>
          <div className="metric-sub" style={{ color: 'var(--color-emerald-800)', fontWeight: 600 }}>{members.length > 0? 'Active Rotation' : 'No members'}</div>
        </div>
      </div>

      {/* Matrix */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div><h3 style={{ fontSize: '1.2rem' }}>Active Week Payment Matrix</h3><p style={{ fontSize: '0.85rem', color: 'var(--color-slate-600)' }}>Week #{currentWeek?.weekNumber || 1} ({activeMonday} to {currentWeekDays[6]})</p></div>
          <button className="btn-outline" style={{ fontSize: '0.8rem' }} onClick={() => onNavigate('/agent/payments')}>View Ledger <ArrowUpRight size={14} /></button>
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead><tr><th>Member</th>{currentWeekDays.map(dStr => <th key={dStr} style={{ textAlign: 'center' }}>{getDayOfWeekShort(dStr)}<br/><span style={{ fontSize: '0.7rem', fontWeight: 400 }}>{formatShortDate(dStr)}</span></th>)}<th style={{ textAlign: 'right' }}>Total</th></tr></thead>
            <tbody>
              {members.length === 0? <tr><td colSpan={currentWeekDays.length + 2} style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>No members yet. Click + Invite.</td></tr> : members.map((mem) => {
                const memWeekPayments = payments.filter(p => p.memberId === mem.id && currentWeekDays.includes(p.paymentDate));
                const memPaidCount = memWeekPayments.filter(p => p.status === 'paid').length;
                const memPaidTotal = memPaidCount * group.fixedDailyAmount;
                return (
                  <tr key={mem.id}>
                    <td><div style={{ fontWeight: 700, cursor: 'pointer' }} onClick={() => onNavigate(`/agent/members/${mem.id}`)}>{mem.name}</div><span style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)' }}>Pos #{mem.positionInRotation}</span></td>
                    {currentWeekDays.map(dStr => {
                      const pay = memWeekPayments.find(p => p.paymentDate === dStr);
                      const status = pay? pay.status : 'pending';
                      return (
                        <td key={dStr} style={{ textAlign: 'center' }}>
                          {status === 'paid'? <span className="status-pill paid"><CheckCircle2 size={12} /> Paid</span> : status === 'missed'? <span className="status-pill missed"><AlertCircle size={12} /> Missed</span> : (
                            <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                              <button className="status-pill pending" style={{ cursor: 'pointer' }} onClick={() => { setSelectedMemberForCash(mem.id); setManualPayModalOpen(true); }}><Clock size={12} /> Pending</button>
                              <button onClick={() => remindMember(mem.id)} style={{ fontSize: '0.7rem', padding: '3px 8px', borderRadius: '999px', border: '1px solid #f59e0b', background: '#fffbeb', color: '#b45309', cursor: 'pointer', fontWeight: 600 }}>🔔 Remind</button>
                            </div>
                          )}
                        </td>
                      );
                    })}
                    <td style={{ textAlign: 'right', fontWeight: 800 }}>{group.currency}{memPaidTotal}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
        </>
      )}

      <InviteMemberModal isOpen={inviteModalOpen} onClose={() => setInviteModalOpen(false)} />
      <ManualPayModal isOpen={manualPayModalOpen} onClose={() => setManualPayModalOpen(false)} defaultMemberId={selectedMemberForCash} />
      <CreateGroupModal isOpen={createGroupModalOpen} onClose={() => setCreateGroupModalOpen(false)} onSuccess={(newId) => setActiveGroupId(newId)} />

      <style>{`
       .agent-dashboard{display:flex;flex-direction:column;gap:1rem}
       .dashboard-header{display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:1rem;margin-bottom:1rem}
       .badge-agent{background:var(--color-gold-100);color:var(--color-gold-700);padding:0.2rem 0.6rem;border-radius:8px;font-size:0.7rem;font-weight:800;display:inline-block;margin-bottom:0.4rem}
       .dashboard-actions{display:flex;gap:0.75rem;flex-wrap:wrap}
       .metrics-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.5rem}
       .metric-card{display:flex;flex-direction:column;justify-content:space-between}
       .metric-header{display:flex;justify-content:space-between;align-items:center}
       .metric-title{font-size:0.85rem;font-weight:600;color:var(--color-slate-600)}
       .metric-value{font-size:1.8rem;font-weight:800;color:var(--color-emerald-950);margin:0.5rem 0}
       .metric-total{font-size:1rem;color:var(--color-slate-500);font-weight:500}
       .progress-bar-bg{background:var(--color-slate-200);height:6px;border-radius:999px;overflow:hidden;margin-bottom:0.5rem}
       .progress-bar-fill{background:var(--color-emerald-600);height:100%}
       .metric-sub{font-size:0.75rem;color:var(--color-slate-500)}
        @media(max-width:900px){.metrics-grid{grid-template-columns:1fr}}
      `}</style>
    </div>
  );
};