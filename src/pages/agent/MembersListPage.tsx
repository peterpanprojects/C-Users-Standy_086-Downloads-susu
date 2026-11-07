import React, { useState } from 'react';
import { useSusu } from '../../context/SusuContext';
import { Plus, Copy, Check, Trash2, Banknote, UserCheck, Mail, Phone, ExternalLink, Key, Send, Bell, CheckCircle2, AlertCircle } from 'lucide-react';
import { InviteMemberModal } from '../../components/agent/InviteMemberModal';
import { ManualPayModal } from '../../components/agent/ManualPayModal';
import { EditMemberModal } from '../../components/admin/EditMemberModal';
import { EditMemberProfileModal } from '../../components/admin/EditMemberProfileModal';
import { DeleteMemberModal } from '../../components/admin/DeleteMemberModal';
import { GroupMember } from '../../types/susu';
import { formatDateStr } from '../../utils/dates';

interface MembersListPageProps {
  onNavigate: (path: string) => void;
}

export const MembersListPage: React.FC<MembersListPageProps> = ({ onNavigate }) => {
  const {
    members,
    payments,
    removeMember,
    getMemberReliability,
    group,
    groups,
    myGroups,
    activeGroupId,
    setActiveGroupId,
    currentUserRole
  } = useSusu();
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [manualPayModalOpen, setManualPayModalOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [copiedTokenId, setCopiedTokenId] = useState<string | null>(null);
  const [reminderSentId, setReminderSentId] = useState<string | null>(null);

  const [selectedMember, setSelectedMember] = useState<GroupMember | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const todayStr = formatDateStr(new Date());

  const agentGroupsList = myGroups;

  if (!group) {
    return (
      <div className="members-page" style={{ maxWidth: '640px', margin: '3rem auto', textAlign: 'center' }}>
        <div className="card" style={{ padding: '3rem 2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--color-emerald-950)', marginBottom: '0.5rem' }}>No Susu Group Selected</h2>
          <p style={{ color: 'var(--color-slate-600)', marginBottom: '1.75rem', fontSize: '0.92rem' }}>
            Please create or select a Susu group before inviting and managing contributing members.
          </p>
          <button className="btn-gold" onClick={() => onNavigate('/agent/groups')} style={{ padding: '0.75rem 1.75rem' }}>
            Go to My Groups
          </button>
        </div>
      </div>
    );
  }

  const displayMembers = members.filter((m) => m.groupId === group.id);

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2500);
  };

  const handleCopyLink = (token: string, id: string) => {
    const url = `${window.location.origin}/invite/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedTokenId(id);
    setTimeout(() => setCopiedTokenId(null), 2500);
  };

  const handleSendReminder = (name: string, id: string) => {
    setReminderSentId(id);
    setTimeout(() => setReminderSentId(null), 3000);
  };

  return (
    <div className="members-page">
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
            <span className="badge-agent">MEMBER DIRECTORY &amp; PAYMENT RECORDS</span>
            {agentGroupsList.length > 1 && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '2px 8px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#92400e' }}>Circle:</span>
                <select
                  value={activeGroupId || group?.id}
                  onChange={(e) => setActiveGroupId(e.target.value)}
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--color-emerald-950)',
                    cursor: 'pointer',
                    outline: 'none',
                    padding: '2px 4px'
                  }}
                >
                  {agentGroupsList.map(g => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.currency}{g.fixedDailyAmount}/d)
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <h1 style={{ fontSize: '2rem', margin: '0 0 0.35rem 0' }}>Invited Member Records &amp; Unique Codes</h1>
          <p style={{ color: 'var(--color-slate-600)', fontSize: '0.9rem', margin: 0 }}>
            Showing {displayMembers.length} members for <strong>{group?.name || 'Active Circle'}</strong> ({group?.currency || 'GH₵'}{group?.fixedDailyAmount || 20}/day).
          </p>
        </div>

        <button className="btn-gold" onClick={() => setInviteModalOpen(true)}>
          <Plus size={16} /> Invite New Member
        </button>
      </div>

      {/* Notice Banner */}
      <div
        style={{
          background: 'var(--color-gold-50)',
          border: '1px solid var(--color-gold-300)',
          borderRadius: 'var(--radius-md)',
          padding: '0.85rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontSize: '0.85rem',
          color: 'var(--color-gold-900)'
        }}
      >
        <Key size={18} color="var(--color-gold-700)" style={{ flexShrink: 0 }} />
        <div>
          <strong>Strict Security Notice:</strong> Each invited member has a <strong>Unique Secret Code</strong>. Members cannot self-register; they log in exclusively using their assigned unique code.
        </div>
      </div>

      {/* Members Record Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Rotation #</th>
                <th>Member Details</th>
                <th>Unique Login Code</th>
                <th>Today's Payment</th>
                <th>Reliability Score</th>
                <th>Invite Status</th>
                <th style={{ textAlign: 'right' }}>Agent Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayMembers.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--color-slate-500)' }}>
                    No members in this Susu group yet. Click <strong>+ Invite New Member</strong> to generate a unique code and invite your first member.
                  </td>
                </tr>
              ) : (
                displayMembers.map((mem) => {
                  const score = getMemberReliability(mem.id);
                  // Check today's payment
                  const todayPayment = payments.find((p) => p.memberId === mem.id && p.paymentDate === todayStr);
                  const isPaidToday = todayPayment && todayPayment.status === 'paid';

                  return (
                    <tr key={mem.id}>
                      {/* Rotation Position */}
                      <td>
                        <span className="position-badge">#{mem.positionInRotation}</span>
                      </td>

                      {/* Member Details */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <div
                            style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '50%',
                              overflow: 'hidden',
                              flexShrink: 0,
                              background: 'var(--color-emerald-950)',
                              border: '1.5px solid var(--color-gold-400)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'var(--color-gold-400)',
                              fontSize: '0.85rem',
                              fontWeight: 800
                            }}
                          >
                            {mem.avatarUrl ? (
                              <img src={mem.avatarUrl} alt={mem.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              mem.name.charAt(0)
                            )}
                          </div>
                          <div>
                            <div
                              style={{ fontWeight: 700, color: 'var(--color-emerald-900)', cursor: 'pointer' }}
                              onClick={() => onNavigate(`/agent/members/${mem.id}`)}
                            >
                              {mem.name}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)', display: 'flex', gap: '0.75rem', marginTop: '0.15rem' }}>
                              <span><Mail size={12} /> {mem.email || 'No email'}</span>
                              <span><Phone size={12} /> {mem.phone}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Unique Login Code */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span
                            style={{
                              fontFamily: 'monospace',
                              fontWeight: 800,
                              background: 'var(--color-slate-100)',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '6px',
                              fontSize: '0.85rem',
                              color: 'var(--color-emerald-950)',
                              border: '1px solid var(--color-slate-300)'
                            }}
                          >
                            {mem.uniqueCode}
                          </span>
                          <button
                            className="btn-outline"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }}
                            onClick={() => handleCopyCode(mem.uniqueCode, mem.id)}
                            title="Copy Unique Code"
                          >
                            {copiedCodeId === mem.id ? <Check size={12} color="var(--color-emerald-600)" /> : <Copy size={12} />}
                            {copiedCodeId === mem.id ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                      </td>

                      {/* Today's Payment Status */}
                      <td>
                        {isPaidToday ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              background: 'var(--color-emerald-100)',
                              color: 'var(--color-emerald-900)',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '999px',
                              fontSize: '0.75rem',
                              fontWeight: 700
                            }}
                          >
                            <CheckCircle2 size={12} /> Paid Today
                          </span>
                        ) : (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              background: '#fee2e2',
                              color: '#dc2626',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '999px',
                              fontSize: '0.75rem',
                              fontWeight: 700
                            }}
                          >
                            <AlertCircle size={12} /> Pending Today
                          </span>
                        )}
                      </td>

                      {/* Reliability Score */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div className="score-meter-bg" style={{ width: '60px' }}>
                            <div
                              className="score-meter-fill"
                              style={{
                                width: `${score}%`,
                                background: score >= 90 ? 'var(--color-emerald-500)' : score >= 70 ? 'var(--color-gold-500)' : 'var(--color-danger-500)'
                              }}
                            />
                          </div>
                          <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{score}%</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td>
                        <span className={`status-pill ${mem.inviteStatus}`}>
                          {mem.inviteStatus}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap', gap: '0.35rem' }}>
                          <button
                            className="btn-secondary"
                            style={{ padding: '0.3rem 0.55rem', fontSize: '0.75rem' }}
                            onClick={() => {
                              setSelectedMember(mem);
                              setIsEditOpen(true);
                            }}
                            title="Edit Member"
                          >
                            Edit
                          </button>

                          <button
                            className="btn-outline"
                            style={{ padding: '0.3rem 0.55rem', fontSize: '0.75rem' }}
                            onClick={() => {
                              setSelectedMember(mem);
                              setIsEditProfileOpen(true);
                            }}
                            title="Edit Member Profile"
                          >
                            Profile
                          </button>

                          <button
                            className="btn-secondary"
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                            onClick={() => {
                              setSelectedMemberId(mem.id);
                              setManualPayModalOpen(true);
                            }}
                            title="Record Cash Payment Override"
                          >
                            <Banknote size={13} /> Cash
                          </button>

                          <button
                            className="btn-outline"
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                            onClick={() => handleSendReminder(mem.name, mem.id)}
                            title="Send SMS/WhatsApp Payment Reminder"
                          >
                            <Bell size={13} /> {reminderSentId === mem.id ? 'Sent!' : 'Remind'}
                          </button>

                          <button
                            className="btn-outline"
                            style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem' }}
                            onClick={() => onNavigate(`/agent/members/${mem.id}`)}
                            title="View Member Record"
                          >
                            <ExternalLink size={13} />
                          </button>

                          <button
                            className="btn-danger"
                            style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem' }}
                            onClick={() => {
                              setSelectedMember(mem);
                              setIsDeleteOpen(true);
                            }}
                            title="Delete Member"
                          >
                            <Trash2 size={13} />
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

      <InviteMemberModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
      />

      <ManualPayModal
        isOpen={manualPayModalOpen}
        onClose={() => setManualPayModalOpen(false)}
        defaultMemberId={selectedMemberId}
      />

      <EditMemberModal
        member={selectedMember}
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedMember(null);
        }}
      />

      <EditMemberProfileModal
        member={selectedMember}
        isOpen={isEditProfileOpen}
        onClose={() => {
          setIsEditProfileOpen(false);
          setSelectedMember(null);
        }}
      />

      <DeleteMemberModal
        member={selectedMember}
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedMember(null);
        }}
      />
    </div>
  );
};
