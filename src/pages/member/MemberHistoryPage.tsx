import React from 'react';
import { useSusu } from '../../context/SusuContext';
import { CheckCircle2, AlertCircle, Clock, CreditCard, Banknote } from 'lucide-react';

export const MemberHistoryPage: React.FC = () => {
  const { activeMemberId, members, payments, group } = useSusu();
  const currentMember = members.find((m) => m.id === activeMemberId) || members[0];

  if (!currentMember || !group) {
    return (
      <div style={{ maxWidth: '640px', margin: '3rem auto', textAlign: 'center' }}>
        <div className="card" style={{ padding: '3rem 2rem' }}>
          <h2>No Member or Circle Selected</h2>
          <p style={{ color: 'var(--color-slate-600)', marginTop: '0.5rem' }}>
            No member account or group is currently selected or enrolled.
          </p>
        </div>
      </div>
    );
  }

  const myPayments = payments.filter((p) => p.memberId === currentMember.id);
  const paidCount = myPayments.filter((p) => p.status === 'paid').length;
  const totalContributed = paidCount * group.fixedDailyAmount;

  return (
    <div className="member-history-page">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '2rem' }}>My Contribution History</h1>
        <p style={{ color: 'var(--color-slate-600)', fontSize: '0.9rem' }}>
          Full daily record of payments made to {group.name}.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="card">
          <span style={{ fontSize: '0.85rem', color: 'var(--color-slate-600)' }}>Total Contributed To Date</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-emerald-800)', fontFamily: 'var(--font-heading)' }}>
            {group.currency}{totalContributed.toLocaleString()}
          </div>
        </div>
        <div className="card">
          <span style={{ fontSize: '0.85rem', color: 'var(--color-slate-600)' }}>Days Paid</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-emerald-950)', fontFamily: 'var(--font-heading)' }}>
            {paidCount} Days
          </div>
        </div>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Payment Method</th>
                <th>Paystack Reference</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {myPayments.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--color-slate-500)' }}>
                    No contributions recorded yet.
                  </td>
                </tr>
              ) : (
                myPayments.map((p) => (
                  <tr key={p.id}>
                    <td><strong>{p.paymentDate}</strong></td>
                    <td>{group.currency}{p.amount}</td>
                    <td>
                      {p.paymentMethod === 'cash_override' ? (
                        <span style={{ color: 'var(--color-gold-700)', fontWeight: 600 }}>Physical Cash</span>
                      ) : (
                        <span style={{ color: 'var(--color-emerald-700)', fontWeight: 600 }}>Paystack Online</span>
                      )}
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                      {p.paystackReference || 'N/A (Cash)'}
                    </td>
                    <td>
                      <span className={`status-pill ${p.status}`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
