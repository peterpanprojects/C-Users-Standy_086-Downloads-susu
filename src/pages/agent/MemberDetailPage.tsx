import React, { useState } from 'react';
import { useSusu } from '../../context/SusuContext';
import { ArrowLeft, Banknote, Calendar, CheckCircle2, AlertCircle, Clock, Mail, Phone, Award } from 'lucide-react';
import { ManualPayModal } from '../../components/agent/ManualPayModal';

interface MemberDetailPageProps {
  memberId: string;
  onNavigate: (path: string) => void;
}

export const MemberDetailPage: React.FC<MemberDetailPageProps> = ({ memberId, onNavigate }) => {
  const { members, payments, schedule, group, getMemberReliability } = useSusu();
  const [manualPayOpen, setManualPayOpen] = useState(false);

  const member = members.find((m) => m.id === memberId && (group ? m.groupId === group.id : true));

  if (!member) {
    return (
      <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
        <button className="btn-outline" style={{ marginBottom: '1.5rem', padding: '0.4rem 0.85rem' }} onClick={() => onNavigate('/agent/members')}>
          <ArrowLeft size={16} /> Back to Members List
        </button>
        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
          <h3>Member Not Found</h3>
          <p style={{ color: 'var(--color-slate-600)', marginTop: '0.5rem' }}>The requested member does not exist in this group rotation.</p>
        </div>
      </div>
    );
  }

  const memberPayments = payments.filter((p) => p.memberId === member.id);
  const score = getMemberReliability(member.id);

  // Scheduled payout week
  const payoutWeek = schedule.find((s) => s.memberId === member.id);

  return (
    <div className="member-detail-page">
      <button className="btn-outline" style={{ marginBottom: '1.5rem', padding: '0.4rem 0.85rem' }} onClick={() => onNavigate('/agent/members')}>
        <ArrowLeft size={16} /> Back to Members List
      </button>

      <div className="member-header-card card card-emerald">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                overflow: 'hidden',
                background: 'var(--color-emerald-950)',
                border: '2.5px solid var(--color-gold-400)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.75rem',
                fontWeight: 800,
                color: 'var(--color-gold-400)',
                boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                flexShrink: 0
              }}
            >
              {member.avatarUrl ? (
                <img src={member.avatarUrl} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                member.name.charAt(0)
              )}
            </div>
            <div>
              <span className="status-pill active" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>
                Rotation Position #{member.positionInRotation}
              </span>
              <h1 style={{ color: '#fff', fontSize: '2rem', margin: 0 }}>{member.name}</h1>
              <p style={{ color: 'var(--color-slate-200)', fontSize: '0.9rem', display: 'flex', gap: '1rem', marginTop: '0.4rem' }}>
                <span><Mail size={14} /> {member.email}</span>
                <span><Phone size={14} /> {member.phone}</span>
              </p>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '1rem 1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(229, 169, 60, 0.4)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-gold-300)', display: 'block' }}>Reliability Score</span>
              <span style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-heading)' }}>
                {score}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="detail-grid" style={{ marginTop: '1.5rem' }}>
        {/* Payout Week Card */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar color="var(--color-gold-600)" /> Scheduled Payout Week
          </h3>
          {payoutWeek ? (
            <div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-emerald-950)' }}>
                Week #{payoutWeek.weekNumber} Payout
              </div>
              <p style={{ color: 'var(--color-slate-600)', fontSize: '0.85rem', margin: '0.25rem 0 1rem' }}>
                Dates: {payoutWeek.weekStartDate} to {payoutWeek.weekEndDate}
              </p>
              <div style={{ background: 'var(--color-slate-100)', padding: '0.85rem', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between' }}>
                <span>Expected Pooled Pool:</span>
                <strong style={{ color: 'var(--color-emerald-800)', fontSize: '1.1rem' }}>
                  {group.currency}{payoutWeek.expectedPoolAmount.toLocaleString()}
                </strong>
              </div>
            </div>
          ) : (
            <p>No payout week scheduled yet.</p>
          )}
        </div>

        {/* Quick Cash Override Action */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Banknote color="var(--color-emerald-700)" /> Manual Cash Action
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-slate-600)', marginBottom: '1.25rem' }}>
            Log cash payments made by {member.name} in person outside of Paystack online portal.
          </p>
          <button className="btn-gold" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setManualPayOpen(true)}>
            <Banknote size={16} /> Mark Cash Payment
          </button>
        </div>
      </div>

      {/* Member Payment Ledger */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Daily Contribution History</h3>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Payment Date</th>
                <th>Amount</th>
                <th>Payment Method</th>
                <th>Paystack Reference</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {memberPayments.map((p) => (
                <tr key={p.id}>
                  <td>{p.paymentDate}</td>
                  <td><strong>{group.currency}{p.amount}</strong></td>
                  <td>
                    {p.paymentMethod === 'cash_override' ? 'Physical Cash (Agent Override)' : 'Paystack Online Checkout'}
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ManualPayModal
        isOpen={manualPayOpen}
        onClose={() => setManualPayOpen(false)}
        defaultMemberId={member.id}
      />

      <style>{`
        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }
        @media (max-width: 768px) {
          .detail-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};
