import React, { useState } from 'react';
import { useSusu } from '../../context/SusuContext';
import { getWeekDays, isToday, formatShortDate, getDaysUntil, getDayOfWeekShort } from '../../utils/dates';
import { CreditCard, CheckCircle2, Flame, Calendar, Clock, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { PaystackModal } from '../../components/member/PaystackModal';

interface MemberDashboardPageProps {
  onNavigate: (path: string) => void;
}

export const MemberDashboardPage: React.FC<MemberDashboardPageProps> = ({ onNavigate }) => {
  const { activeUser, activeMemberId, members, group, schedule, payments } = useSusu();
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedDatesToPay, setSelectedDatesToPay] = useState<string[]>([]);

  const currentMember = members.find((m) => m.id === activeMemberId) || members[0];

  if (!currentMember || !group) {
    return (
      <div style={{ maxWidth: '640px', margin: '3rem auto', textAlign: 'center' }}>
        <div className="card" style={{ padding: '3rem 2rem' }}>
          <div style={{ background: 'var(--color-emerald-100)', color: 'var(--color-emerald-800)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <ShieldCheck size={32} />
          </div>
          <h2 style={{ fontSize: '1.6rem', marginBottom: '0.75rem' }}>No Active Member Enrolled</h2>
          <p style={{ color: 'var(--color-slate-600)', marginBottom: '2rem' }}>
            There are currently no active member accounts or groups found. If you received an invitation link, please use it to register, or contact your Agent Organizer.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <button className="btn-primary" onClick={() => onNavigate('/login')}>
              Go to Login
            </button>
            <button className="btn-gold" onClick={() => onNavigate('/')}>
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentWeek = schedule.find((s) => s.status === 'current') || schedule[0];
  const activeMonday = currentWeek ? currentWeek.weekStartDate : (group.cycleStartDate || new Date().toISOString().split('T')[0]);
  const currentWeekDays = getWeekDays(activeMonday);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayPayment = payments.find(
    (p) => p.memberId === currentMember.id && p.paymentDate === todayStr
  );
  const isPaidToday = todayPayment?.status === 'paid';

  // Scheduled Payout Week for this member
  const myPayoutWeek = schedule.find((s) => s.memberId === currentMember.id);
  const daysUntilPayout = myPayoutWeek ? getDaysUntil(myPayoutWeek.weekStartDate) : 0;

  // Streak calculation (count consecutive paid days)
  const memberPayments = payments.filter((p) => p.memberId === currentMember.id && p.status === 'paid');
  const streakDays = memberPayments.length;

  const handlePayToday = () => {
    setSelectedDatesToPay([todayStr]);
    setPayModalOpen(true);
  };

  const handlePayFullWeek = () => {
    // Unpaid days in active week
    const unpaidDays = currentWeekDays.filter((dStr) => {
      const p = payments.find((pay) => pay.memberId === currentMember.id && pay.paymentDate === dStr);
      return !p || p.status !== 'paid';
    });
    setSelectedDatesToPay(unpaidDays.length > 0 ? unpaidDays : [todayStr]);
    setPayModalOpen(true);
  };

  return (
    <div className="member-dashboard">
      {/* Welcome Banner */}
      <div className="card card-emerald welcome-banner">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="badge-member">MEMBER PORTAL</span>
            <h1 style={{ color: '#fff', fontSize: '1.8rem' }}>Welcome back, {currentMember.name}!</h1>
            <p style={{ color: 'var(--color-slate-200)', fontSize: '0.9rem' }}>
              Group: <strong>{group.name}</strong> | Daily Contribution: <strong>{group.currency}{group.fixedDailyAmount}</strong>
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(229, 169, 60, 0.2)', border: '1px solid var(--color-gold-500)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Flame size={24} color="#F3C059" />
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-gold-300)', display: 'block' }}>Contribution Streak</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>{streakDays} Days 🔥</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Widgets Grid */}
      <div className="widgets-grid" style={{ marginTop: '1.5rem' }}>
        {/* Today's Payment Widget */}
        <div className="card widget-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-slate-600)', fontWeight: 600 }}>Today's Contribution Status</span>
              <h2 style={{ fontSize: '1.6rem', marginTop: '0.25rem' }}>
                {isPaidToday ? 'Paid for Today ✓' : `${group.currency}${group.fixedDailyAmount} Due Today`}
              </h2>
            </div>
            <div style={{ background: isPaidToday ? 'var(--color-emerald-100)' : 'var(--color-gold-100)', padding: '0.6rem', borderRadius: '12px' }}>
              {isPaidToday ? <CheckCircle2 color="var(--color-emerald-700)" size={28} /> : <CreditCard color="var(--color-gold-700)" size={28} />}
            </div>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--color-slate-600)', margin: '0.75rem 0 1.25rem' }}>
            {isPaidToday
              ? 'Thank you! Your payment is confirmed and logged in the group ledger.'
              : 'Pay via Paystack online checkout (Card or Mobile Money) before 23:59 GMT.'}
          </p>

          {!isPaidToday ? (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn-gold" style={{ flex: 1, justifyContent: 'center' }} onClick={handlePayToday}>
                Pay Today ({group.currency}{group.fixedDailyAmount})
              </button>
              <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={handlePayFullWeek}>
                Pay Full Week
              </button>
            </div>
          ) : (
            <button className="btn-outline" style={{ width: '100%', justifyContent: 'center' }} onClick={() => onNavigate('/member/history')}>
              View Payment History
            </button>
          )}
        </div>

        {/* Payout Countdown Widget */}
        <div className="card widget-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-slate-600)', fontWeight: 600 }}>Your Scheduled Payout</span>
              <h2 style={{ fontSize: '1.4rem', marginTop: '0.25rem', color: 'var(--color-emerald-950)' }}>
                {myPayoutWeek ? `Week #${myPayoutWeek.weekNumber} Recipient` : 'Rotation Active'}
              </h2>
            </div>
            <div style={{ background: 'var(--color-slate-100)', padding: '0.6rem', borderRadius: '12px' }}>
              <Calendar color="var(--color-emerald-800)" size={28} />
            </div>
          </div>

          {myPayoutWeek ? (
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-emerald-800)', margin: '0.5rem 0', fontFamily: 'var(--font-heading)' }}>
                {group.currency}{myPayoutWeek.expectedPoolAmount.toLocaleString()} Pooled Payout
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-slate-600)', marginBottom: '1rem' }}>
                Payout Week Dates: <strong>{myPayoutWeek.weekStartDate} to {myPayoutWeek.weekEndDate}</strong>
              </p>
              <button className="btn-outline" style={{ width: '100%', justifyContent: 'center' }} onClick={() => onNavigate('/member/payout')}>
                View Rotation Calendar & Schedule <ArrowRight size={14} />
              </button>
            </div>
          ) : (
            <div style={{ marginTop: '0.75rem' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-slate-600)', marginBottom: '1rem' }}>
                You have not selected a weekly payout turn yet. Browse available cycle slots to claim your preferred week.
              </p>
              <button className="btn-gold" style={{ width: '100%', justifyContent: 'center' }} onClick={() => onNavigate('/member/payout')}>
                Select Rotation Slot <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Daily Contribution Matrix for Active Week */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
          This Week's Daily Contribution Log (Mon–Sun)
        </h3>
        <div className="week-grid">
          {currentWeekDays.map((dStr) => {
            const pay = payments.find(
              (p) => p.memberId === currentMember.id && p.paymentDate === dStr
            );
            const status = pay ? pay.status : 'pending';

            return (
              <div key={dStr} className={`day-card ${status} ${isToday(dStr) ? 'today-highlight' : ''}`}>
                <span className="day-name">{getDayOfWeekShort(dStr)}</span>
                <span className="day-date">{formatShortDate(dStr)}</span>
                <div className="day-status">
                  {status === 'paid' ? (
                    <span className="status-pill paid"><CheckCircle2 size={12} /> Paid</span>
                  ) : status === 'missed' ? (
                    <span className="status-pill missed"><AlertCircle size={12} /> Missed</span>
                  ) : (
                    <span className="status-pill pending"><Clock size={12} /> Due</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <PaystackModal
        isOpen={payModalOpen}
        onClose={() => setPayModalOpen(false)}
        selectedDates={selectedDatesToPay}
        memberId={currentMember.id}
      />

      <style>{`
        .badge-member {
          background: var(--color-gold-100);
          color: var(--color-gold-700);
          padding: 0.2rem 0.6rem;
          border-radius: var(--radius-sm);
          font-size: 0.7rem;
          font-weight: 800;
          display: inline-block;
          margin-bottom: 0.4rem;
        }
        .widgets-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }
        .week-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 0.75rem;
        }
        .day-card {
          background: var(--color-slate-50);
          border: 1px solid var(--color-slate-200);
          border-radius: var(--radius-md);
          padding: 0.75rem 0.5rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.3rem;
        }
        .day-card.today-highlight {
          border: 2px solid var(--color-gold-500);
          background: var(--color-gold-100);
        }
        .day-name {
          font-weight: 700;
          font-size: 0.85rem;
          color: var(--color-emerald-950);
        }
        .day-date {
          font-size: 0.75rem;
          color: var(--color-slate-500);
        }
        @media (max-width: 900px) {
          .widgets-grid {
            grid-template-columns: 1fr;
          }
          .week-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }
        @media (max-width: 600px) {
          .week-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
};
