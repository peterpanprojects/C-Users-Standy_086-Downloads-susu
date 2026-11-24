import React from 'react';
import { ExternalLink, RefreshCw, ShieldCheck } from 'lucide-react';
import { useSusu } from '../../context/SusuContext';

export const PayoutsTrackingPage: React.FC = () => {
  const { payoutDisbursements, refreshPayoutDisbursements, groups, members, agents } = useSusu();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      await refreshPayoutDisbursements();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to refresh payout records.');
    } finally {
      setLoading(false);
    }
  };

  const statusLabel = (status: string) => ({
    transferring_to_agent: 'Paystack transfer processing',
    awaiting_agent: 'Received by agent — awaiting member payment',
    sent_to_member: 'Proof uploaded — awaiting member response',
    member_received: 'Member confirmed receipt',
    member_disputed: 'Member reports not received',
    transfer_failed: 'Transfer to agent failed'
  }[status] || status);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: '3rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <div>
          <span className="badge-member">SUPER ADMIN OVERSIGHT</span>
          <h1 style={{ margin: '0.5rem 0', fontFamily: 'var(--font-heading)' }}>Payouts & Proof of Payment</h1>
          <p style={{ margin: 0, color: 'var(--color-slate-600)' }}>Review Paystack transfers, agent receipts, and member confirmations or disputes.</p>
        </div>
        <button type="button" className="btn-outline" onClick={() => void refresh()} disabled={loading}>
          <RefreshCw size={16} /> {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {error && <div role="alert" style={{ background: '#fee2e2', color: '#991b1b', borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '1rem' }}>{error}</div>}

      <div className="card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Circle / Week</th>
                <th>Member</th>
                <th>Agent</th>
                <th>Pool</th>
                <th>Paystack transfer</th>
                <th>Status</th>
                <th>Proof</th>
              </tr>
            </thead>
            <tbody>
              {payoutDisbursements.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-slate-500)' }}>No payout records yet.</td></tr>
              ) : payoutDisbursements.map(payout => {
                const payoutGroup = groups.find(item => item.id === payout.groupId);
                const member = members.find(item => item.id === payout.memberId);
                const agent = agents.find(item => item.id === payout.agentId);
                return (
                  <tr key={payout.id}>
                    <td><strong>{payoutGroup?.name || 'Susu circle'}</strong><br /><span style={{ color: 'var(--color-slate-500)' }}>Week #{payout.weekNumber} · {payout.weekStartDate}–{payout.weekEndDate}</span></td>
                    <td>{member?.name || 'Member'}</td>
                    <td>{agent ? `${agent.firstName} ${agent.surname}`.trim() : 'Agent'}</td>
                    <td>{payout.currency}{payout.poolAmount.toLocaleString()}</td>
                    <td>
                      {payout.currency}{payout.transferAmount.toLocaleString()}
                      {payout.transferReference && <div style={{ color: 'var(--color-slate-500)', fontSize: '0.72rem', fontFamily: 'monospace' }}>Ref: {payout.transferReference}</div>}
                    </td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <ShieldCheck size={15} /> {statusLabel(payout.status)}
                      </span>
                      {payout.failureReason && <div style={{ color: '#b91c1c', fontSize: '0.75rem' }}>{payout.failureReason}</div>}
                      {payout.memberResponse === 'not_received' && <div style={{ color: '#b91c1c', fontSize: '0.75rem' }}>Member dispute</div>}
                    </td>
                    <td>{payout.proofUrl ? <a href={payout.proofUrl} target="_blank" rel="noreferrer" aria-label="View member payout proof"><ExternalLink size={17} /> View</a> : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
