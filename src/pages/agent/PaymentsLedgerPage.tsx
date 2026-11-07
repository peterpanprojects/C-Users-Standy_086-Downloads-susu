import React, { useState } from 'react';
import { useSusu } from '../../context/SusuContext';
import { Filter, CreditCard, Banknote, Search, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { ManualPayModal } from '../../components/agent/ManualPayModal';

export const PaymentsLedgerPage: React.FC = () => {
  const { payments, members, group, myGroups, activeGroupId, setActiveGroupId } = useSusu();
  const [selectedMember, setSelectedMember] = useState<string>('all');
  const [selectedMethod, setSelectedMethod] = useState<string>('all');
  const [searchDate, setSearchDate] = useState<string>('');
  const [manualPayOpen, setManualPayOpen] = useState(false);

  if (!group) {
    return (
      <div className="payments-ledger-page" style={{ maxWidth: '600px', margin: '3rem auto', textAlign: 'center' }}>
        <div className="card" style={{ padding: '3rem 2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💳</div>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--color-emerald-950)', marginBottom: '0.5rem' }}>No Active Susu Circle</h2>
          <p style={{ color: 'var(--color-slate-600)', marginBottom: '1.5rem' }}>
            Select or create a Susu circle to view its payment transactions and audit ledger.
          </p>
        </div>
      </div>
    );
  }

  const groupMembers = members.filter((m) => m.groupId === group.id);
  const groupPayments = payments.filter((p) => p.groupId === group.id);

  const filteredPayments = groupPayments.filter((p) => {
    if (selectedMember !== 'all' && p.memberId !== selectedMember) return false;
    if (selectedMethod !== 'all' && p.paymentMethod !== selectedMethod) return false;
    if (searchDate && !p.paymentDate.includes(searchDate)) return false;
    return true;
  });

  return (
    <div className="payments-ledger-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
            <span className="badge-agent">AUDIT LEDGER</span>
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
          <h1 style={{ fontSize: '2rem' }}>All Payments Audit Ledger</h1>
          <p style={{ color: 'var(--color-slate-600)', fontSize: '0.9rem' }}>
            Showing records for <strong>{group.name}</strong> ({group.currency}{group.fixedDailyAmount}/day).
          </p>
        </div>

        <button className="btn-gold" onClick={() => setManualPayOpen(true)}>
          <Banknote size={16} /> Record Cash Payment
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.85rem' }}>
            <Filter size={16} color="var(--color-emerald-700)" /> Filters:
          </div>

          <select
            className="form-select"
            style={{ width: 'auto', padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
            value={selectedMember}
            onChange={(e) => setSelectedMember(e.target.value)}
          >
            <option value="all">All Members ({groupMembers.length})</option>
            {groupMembers.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>

          <select
            className="form-select"
            style={{ width: 'auto', padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
            value={selectedMethod}
            onChange={(e) => setSelectedMethod(e.target.value)}
          >
            <option value="all">All Methods (Paystack & Cash)</option>
            <option value="paystack">Paystack Online Only</option>
            <option value="cash_override">Agent Cash Override Only</option>
          </select>

          <input
            type="text"
            className="form-input"
            style={{ width: 'auto', padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Payment Date</th>
                <th>Member Name</th>
                <th>Amount Paid</th>
                <th>Payment Method</th>
                <th>Paystack Reference</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--color-slate-500)' }}>
                    No payment transactions found in the ledger. Click <strong>Record Cash Payment</strong> or make an online contribution.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((pay) => {
                  const mem = members.find((m) => m.id === pay.memberId);
                  return (
                    <tr key={pay.id}>
                    <td><strong>{pay.paymentDate}</strong></td>
                    <td>{mem ? mem.name : 'Unknown Member'}</td>
                    <td><strong>{group.currency}{pay.amount}</strong></td>
                    <td>
                      {pay.paymentMethod === 'cash_override' ? (
                        <span style={{ color: 'var(--color-gold-700)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Banknote size={14} /> Physical Cash
                        </span>
                      ) : (
                        <span style={{ color: 'var(--color-emerald-700)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          <CreditCard size={14} /> Paystack Online
                        </span>
                      )}
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                      {pay.paystackReference || 'N/A (Cash)'}
                    </td>
                    <td>
                      <span className={`status-pill ${pay.status}`}>
                        {pay.status}
                      </span>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>
      </div>

      <ManualPayModal isOpen={manualPayOpen} onClose={() => setManualPayOpen(false)} />
    </div>
  );
};
