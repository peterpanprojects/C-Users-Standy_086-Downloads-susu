import React, { useState } from 'react';
import { useSusu } from '../../context/SusuContext';
import { getWeekDays, formatShortDate, getDayOfWeekShort } from '../../utils/dates';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { PaystackModal } from '../../components/member/PaystackModal';

export const MemberPayPage: React.FC = () => {
  const { activeMemberId, members, group, schedule, payments } = useSusu();
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);

  const currentMember = members.find((m) => m.id === activeMemberId) || members[0];

  if (!currentMember || !group) {
    return (
      <div style={{ maxWidth: '640px', margin: '3rem auto', textAlign: 'center' }}>
        <div className="card" style={{ padding: '3rem 2rem' }}>
          <h2>No Member or Circle Selected</h2>
          <p style={{ color: 'var(--color-slate-600)', marginTop: '0.5rem' }}>
            No active member account or group found. Please join a Susu group to make contributions.
          </p>
        </div>
      </div>
    );
  }

  const currentWeek = schedule.find((s) => s.status === 'current') || schedule[0];
  const activeMonday = currentWeek ? currentWeek.weekStartDate : (group.cycleStartDate || new Date().toISOString().split('T')[0]);
  const currentWeekDays = getWeekDays(activeMonday);

  const todayStr = new Date().toISOString().split('T')[0];

  const handleSelectDay = (dStr: string) => {
    if (selectedDates.includes(dStr)) {
      setSelectedDates(selectedDates.filter((d) => d !== dStr));
    } else {
      setSelectedDates([...selectedDates, dStr]);
    }
  };

  const handlePaySelected = () => {
    if (selectedDates.length === 0) {
      alert('Please select at least one day to pay.');
      return;
    }
    setPayModalOpen(true);
  };

  const handleSelectFullWeek = () => {
    const unpaid = currentWeekDays.filter((dStr) => {
      const p = payments.find((pay) => pay.memberId === currentMember.id && pay.paymentDate === dStr);
      return !p || p.status !== 'paid';
    });
    setSelectedDates(unpaid);
  };

  const totalAmountToPay = group.fixedDailyAmount * selectedDates.length;

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '2rem' }}>Pay Daily Contribution</h1>
        <p style={{ color: 'var(--color-slate-600)', fontSize: '0.9rem' }}>
          Select individual days or pay the full remaining week via Paystack online checkout.
        </p>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.15rem' }}>Select Days to Pay (Week #{currentWeek?.weekNumber || 1})</h3>
          <button className="btn-outline" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }} onClick={handleSelectFullWeek}>
            Select Full Remaining Week
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
          {currentWeekDays.map((dStr) => {
            const pay = payments.find(
              (p) => p.memberId === currentMember.id && p.paymentDate === dStr
            );
            const isPaid = pay?.status === 'paid';
            const isSelected = selectedDates.includes(dStr);

            return (
              <div
                key={dStr}
                style={{
                  background: isPaid ? 'var(--color-slate-100)' : isSelected ? 'var(--color-gold-100)' : '#fff',
                  border: isSelected ? '2px solid var(--color-gold-500)' : '1px solid var(--color-slate-200)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: isPaid ? 'default' : 'pointer'
                }}
                onClick={() => !isPaid && handleSelectDay(dStr)}
              >
                <div>
                  <strong style={{ fontSize: '0.95rem', color: 'var(--color-emerald-950)' }}>
                    {getDayOfWeekShort(dStr)}, {formatShortDate(dStr)}
                  </strong>
                  {dStr === todayStr && (
                    <span className="status-pill current" style={{ marginLeft: '0.5rem', fontSize: '0.65rem' }}>
                      Today
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontWeight: 700, color: 'var(--color-emerald-800)' }}>
                    {group.currency}{group.fixedDailyAmount}
                  </span>
                  {isPaid ? (
                    <span className="status-pill paid"><CheckCircle2 size={12} /> Paid</span>
                  ) : (
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      style={{ width: '18px', height: '18px', accentColor: 'var(--color-gold-500)' }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ background: 'var(--color-slate-100)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-slate-600)' }}>Selected ({selectedDates.length} days):</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-emerald-950)' }}>
              {group.currency}{totalAmountToPay}
            </div>
          </div>

          <button
            className="btn-gold"
            disabled={selectedDates.length === 0}
            onClick={handlePaySelected}
            style={{ padding: '0.85rem 1.5rem', fontSize: '1rem' }}
          >
            Pay {group.currency}{totalAmountToPay} with Paystack <ArrowRight size={18} />
          </button>
        </div>
      </div>

      <PaystackModal
        isOpen={payModalOpen}
        onClose={() => setPayModalOpen(false)}
        selectedDates={selectedDates}
        memberId={currentMember.id}
      />
    </div>
  );
};
