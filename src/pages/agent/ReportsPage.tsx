import React from 'react';
import { useSusu } from '../../context/SusuContext';
import { Download, BarChart3, Award, Users, CheckCircle2 } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { group, members, payments, schedule, getMemberReliability, myGroups, activeGroupId, setActiveGroupId } = useSusu();

  if (!group) {
    return (
      <div className="reports-page" style={{ maxWidth: '600px', margin: '3rem auto', textAlign: 'center' }}>
        <div className="card" style={{ padding: '3rem 2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--color-emerald-950)', marginBottom: '0.5rem' }}>No Active Susu Circle</h2>
          <p style={{ color: 'var(--color-slate-600)', marginBottom: '1.5rem' }}>
            Please select or create a Susu circle to view financial reports and cycle analytics.
          </p>
        </div>
      </div>
    );
  }

  const groupMembers = members.filter((m) => m.groupId === group.id);
  const groupPayments = payments.filter((p) => p.groupId === group.id);

  const totalExpectedCycle = group.fixedDailyAmount * 7 * groupMembers.length * schedule.length;
  const totalPaidCycle = groupPayments.filter((p) => p.status === 'paid').reduce((acc, p) => acc + p.amount, 0);

  const handleExportCSV = () => {
    let csv = 'Member Name,Rotation Position,Reliability Score,Total Paid,Total Expected,Status\n';
    groupMembers.forEach((mem) => {
      const score = getMemberReliability(mem.id);
      const memPaid = groupPayments
        .filter((p) => p.memberId === mem.id && p.status === 'paid')
        .reduce((acc, p) => acc + p.amount, 0);
      csv += `"${mem.name}",${mem.positionInRotation},${score}%,${memPaid},${group.fixedDailyAmount * 7 * schedule.length},"${mem.inviteStatus}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `susu_group_report_${group.id}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const avgReliability =
    groupMembers.length > 0
      ? Math.round(groupMembers.reduce((acc, m) => acc + getMemberReliability(m.id), 0) / groupMembers.length)
      : 100;

  return (
    <div className="reports-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
            <span className="badge-agent">FINANCIAL REPORTS</span>
            {myGroups.length > 1 && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '2px 8px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#92400e' }}>Circle:</span>
                <select
                  value={activeGroupId || group.id}
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
                  {myGroups.map(g => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.currency}{g.fixedDailyAmount}/d)
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <h1 style={{ fontSize: '2rem' }}>Financial Reports & Analytics</h1>
          <p style={{ color: 'var(--color-slate-600)', fontSize: '0.9rem' }}>
            Showing performance metrics for <strong>{group.name}</strong> ({group.currency}{group.fixedDailyAmount}/day).
          </p>
        </div>

        <button className="btn-gold" onClick={handleExportCSV}>
          <Download size={16} /> Export Full CSV Report
        </button>
      </div>

      <div className="reports-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card">
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Cycle Collection Summary</h3>
          <div style={{ background: 'var(--color-slate-100)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-slate-600)', display: 'block' }}>Total Collected to Date</span>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-emerald-950)', fontFamily: 'var(--font-heading)' }}>
              {group.currency}{totalPaidCycle.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Average Group Reliability</h3>
          <div style={{ background: 'var(--color-slate-100)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-slate-600)', display: 'block' }}>Overall Score</span>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-emerald-700)', fontFamily: 'var(--font-heading)' }}>
              {avgReliability}%
            </span>
          </div>
        </div>
      </div>

      {/* Per Member Reliability Score Table */}
      <div className="card">
        <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Per-Member Reliability Leaderboard</h3>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Member Name</th>
                <th>Rotation Position</th>
                <th>Reliability Score ($R\%$)</th>
                <th>Days Paid</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {groupMembers.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--color-slate-500)' }}>
                    No members in this group yet. Invite members to track reliability scores.
                  </td>
                </tr>
              ) : (
                groupMembers.map((mem) => {
                  const score = getMemberReliability(mem.id);
                  const memPayments = groupPayments.filter((p) => p.memberId === mem.id);
                  const paidCount = memPayments.filter((p) => p.status === 'paid').length;

                  return (
                    <tr key={mem.id}>
                      <td><strong>{mem.name}</strong></td>
                      <td>Pos #{mem.positionInRotation}</td>
                      <td>
                        <strong style={{ color: score >= 90 ? 'var(--color-emerald-700)' : 'var(--color-gold-700)' }}>
                          {score}%
                        </strong>
                      </td>
                      <td>{paidCount} days paid</td>
                      <td><span className="status-pill active">{mem.inviteStatus}</span></td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
