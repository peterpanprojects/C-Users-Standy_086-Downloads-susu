import React, { useState } from 'react';
import { useSusu } from '../../context/SusuContext';
import {
  Calendar,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Users,
  Check,
  Shuffle
} from 'lucide-react';
import { getDaysUntil, getWeekDateRangeFormatted } from '../../utils/dates';
import confetti from 'canvas-confetti';

export const MemberPayoutPage: React.FC = () => {
  const { activeMemberId, members, schedule, group, selectRotationSlot } = useSusu();
  const currentMember = members.find((m) => m.id === activeMemberId) || members[0];

  const [activeFilter, setActiveFilter] = useState<'all' | 'available' | 'mine'>('all');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!currentMember || !group) {
    return (
      <div style={{ maxWidth: '680px', margin: '3rem auto', textAlign: 'center' }}>
        <div className="card" style={{ padding: '3rem 2rem' }}>
          <h2>No Member Enrolled</h2>
          <p style={{ color: 'var(--color-slate-600)', marginTop: '0.5rem' }}>
            No member account is currently selected or enrolled in this group.
          </p>
        </div>
      </div>
    );
  }

  const myPayoutWeek = schedule.find((s) => s.memberId === currentMember.id);
  const daysUntil = myPayoutWeek ? getDaysUntil(myPayoutWeek.weekStartDate) : 0;
  const isSlotLocked = Boolean(currentMember.slotLocked || (currentMember.inviteStatus === 'active' && myPayoutWeek));

  const currentWeekIdx = schedule.findIndex((s) => s.status === 'current');
  const safeCurrentWeekNumber = currentWeekIdx >= 0 ? currentWeekIdx + 1 : 1;

  const handleSelectSlot = (weekNumber: number) => {
    setSuccessMessage(null);
    setErrorMessage(null);

    if (isSlotLocked) {
      setErrorMessage('Your rotation slot is permanently locked. Once a member selects a slot, it cannot be changed again. Only an Agent or Administrator can adjust your slot.');
      setTimeout(() => setErrorMessage(null), 5000);
      return;
    }

    const result = selectRotationSlot(currentMember.id, weekNumber);

    if (result.success) {
      setSuccessMessage(result.message);
      try {
        confetti({
          particleCount: 65,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Confetti fallback
      }
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } else {
      setErrorMessage(result.message);
      setTimeout(() => {
        setErrorMessage(null);
      }, 5000);
    }
  };

  const availableSlots = schedule.filter((s) => s.isAvailable);

  const filteredSchedule = schedule.filter((slot) => {
    if (activeFilter === 'available') return slot.isAvailable;
    if (activeFilter === 'mine') return slot.memberId === currentMember.id;
    return true;
  });

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <span className="badge-member">MEMBER ROTATION SLOTS</span>
        <h1 style={{ fontSize: '2.1rem', marginTop: '0.25rem', fontFamily: 'var(--font-heading)' }}>
          Rotation Slots & Payout Calendar
        </h1>
        <p style={{ color: 'var(--color-slate-600)', fontSize: '0.95rem' }}>
          Browse all weekly distribution slots in the Susu cycle and select your preferred payout turn.
        </p>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div
          style={{
            padding: '1rem 1.25rem',
            background: 'var(--color-emerald-50)',
            border: '1.5px solid var(--color-emerald-400)',
            color: 'var(--color-emerald-950)',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            boxShadow: '0 4px 12px rgba(37, 139, 111, 0.12)'
          }}
        >
          <CheckCircle2 size={22} color="var(--color-emerald-700)" />
          <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>{successMessage}</div>
        </div>
      )}

      {errorMessage && (
        <div
          style={{
            padding: '1rem 1.25rem',
            background: '#fee2e2',
            border: '1.5px solid #fca5a5',
            color: '#dc2626',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}
        >
          <AlertCircle size={22} />
          <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>{errorMessage}</div>
        </div>
      )}

      {/* Hero: Current Assigned Payout Slot */}
      {myPayoutWeek ? (
        <div
          className="card card-emerald"
          style={{
            padding: '2.25rem 2rem',
            marginBottom: '2rem',
            position: 'relative',
            overflow: 'hidden',
            border: '1.5px solid rgba(229, 169, 60, 0.45)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(229, 169, 60, 0.25)', color: 'var(--color-gold-300)', padding: '0.3rem 0.85rem', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 700 }}>
                  <CheckCircle2 size={14} /> YOUR CURRENT ASSIGNED SLOT
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255, 255, 255, 0.15)', color: '#fff', padding: '0.3rem 0.85rem', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 600 }}>
                  <Lock size={12} /> LOCKED (CANNOT BE CHANGED)
                </div>
              </div>
              <h2 style={{ color: '#fff', fontSize: '1.9rem', marginBottom: '0.4rem', fontFamily: 'var(--font-heading)' }}>
                Week #{myPayoutWeek.weekNumber} Recipient Payout
              </h2>
              <p style={{ color: 'var(--color-slate-200)', fontSize: '0.95rem' }}>
                Mon–Sun Scheduled Dates:{' '}
                <strong style={{ color: '#fff' }}>
                  {getWeekDateRangeFormatted(myPayoutWeek.weekStartDate)}
                </strong>{' '}
                ({myPayoutWeek.weekStartDate} to {myPayoutWeek.weekEndDate})
              </p>
              <div style={{ marginTop: '0.5rem', fontSize: '0.82rem', color: 'var(--color-gold-200)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Lock size={13} />
                <span>Rotation turn is locked for members to guarantee fairness. Only your Agent Organizer can modify slots.</span>
              </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-gold-300)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                Guaranteed Pooled Payout
              </span>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-gold-400)', fontFamily: 'var(--font-heading)', lineHeight: 1.1 }}>
                {group.currency}{myPayoutWeek.expectedPoolAmount.toLocaleString()}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                Funded by {members.length} verified circle contributors
              </span>
            </div>
          </div>

          <div
            style={{
              marginTop: '1.5rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff', fontSize: '0.9rem' }}>
              <Clock size={18} color="#E5A93C" />
              <span>
                {daysUntil > 0
                  ? `Countdown: ${daysUntil} days remaining until your payout week begins.`
                  : daysUntil === 0
                  ? 'Payout Turn Active This Week!'
                  : 'Payout turn completed.'}
              </span>
            </div>

            <span style={{ fontSize: '0.8rem', color: 'var(--color-gold-300)' }}>
              Queue Position #{currentMember.positionInRotation} of {schedule.length} Weeks
            </span>
          </div>
        </div>
      ) : (
        <div
          className="card"
          style={{
            padding: '1.75rem',
            marginBottom: '2rem',
            background: 'var(--color-gold-100)',
            border: '1px solid var(--color-gold-300)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}
        >
          <Calendar size={28} color="var(--color-gold-800)" />
          <div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--color-gold-900)' }}>No Rotation Slot Selected Yet</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--color-gold-900)' }}>
              You do not have a reserved weekly payout turn. Please select any available slot below to lock in your turn.
            </p>
          </div>
        </div>
      )}

      {/* Available Slots Explorer & Selection Section */}
      <div className="card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.35rem', color: 'var(--color-emerald-950)', marginBottom: '0.25rem' }}>
              {isSlotLocked ? 'Rotation Cycle Calendar' : 'Select an Available Rotation Slot'}
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--color-slate-600)' }}>
              {isSlotLocked
                ? `Your payout turn is confirmed for Week #${myPayoutWeek?.weekNumber || currentMember.positionInRotation}. Other slots are displayed for circle transparency.`
                : 'Click "Select This Slot" on an open week to claim your preferred payout turn. Note: Once selected, your slot is locked.'}
            </p>
          </div>

          {/* Filter Tabs */}
          <div style={{ display: 'flex', gap: '0.35rem', background: 'var(--color-slate-100)', padding: '0.3rem', borderRadius: '10px' }}>
            <button
              type="button"
              className={`role-btn ${activeFilter === 'all' ? 'active' : ''}`}
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
              onClick={() => setActiveFilter('all')}
            >
              All Slots ({schedule.length})
            </button>
            <button
              type="button"
              className={`role-btn ${activeFilter === 'available' ? 'active' : ''}`}
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
              onClick={() => setActiveFilter('available')}
            >
              Available Only ({availableSlots.length} Open)
            </button>
            <button
              type="button"
              className={`role-btn ${activeFilter === 'mine' ? 'active' : ''}`}
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
              onClick={() => setActiveFilter('mine')}
            >
              My Slot
            </button>
          </div>
        </div>

        {/* Rotation Slots Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.25rem'
          }}
        >
          {filteredSchedule.map((slot) => {
            const isMine = slot.memberId === currentMember.id;
            const isAvailable = slot.isAvailable;
            const isPastOrActive = slot.weekNumber <= safeCurrentWeekNumber;
            const isLocked = isPastOrActive && !isAvailable;

            return (
              <div
                key={slot.id}
                style={{
                  background: isMine
                    ? 'linear-gradient(135deg, rgba(229, 169, 60, 0.12) 0%, rgba(37, 139, 111, 0.15) 100%)'
                    : isAvailable
                    ? 'rgba(37, 139, 111, 0.04)'
                    : '#ffffff',
                  border: isMine
                    ? '2px solid var(--color-gold-500)'
                    : isAvailable
                    ? '1.5px dashed var(--color-emerald-500)'
                    : '1px solid var(--color-slate-200)',
                  borderRadius: '14px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: isMine ? '0 4px 16px rgba(229, 169, 60, 0.15)' : 'var(--shadow-sm)',
                  position: 'relative',
                  transition: 'all 0.2s ease'
                }}
              >
                <div>
                  {/* Top Week & Status Tag */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--color-emerald-950)' }}>
                      Week #{slot.weekNumber}
                    </span>

                    {isMine && (
                      <span
                        style={{
                          background: 'var(--color-gold-500)',
                          color: 'var(--color-emerald-950)',
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          padding: '0.2rem 0.6rem',
                          borderRadius: '999px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                      >
                        <Check size={12} strokeWidth={3} /> YOUR SLOT
                      </span>
                    )}

                    {!isMine && isAvailable && (
                      <span
                        style={{
                          background: 'var(--color-emerald-100)',
                          color: 'var(--color-emerald-800)',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.6rem',
                          borderRadius: '999px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                      >
                        <Sparkles size={12} /> AVAILABLE
                      </span>
                    )}

                    {!isMine && !isAvailable && (
                      <span
                        style={{
                          background: 'var(--color-slate-100)',
                          color: 'var(--color-slate-700)',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          padding: '0.2rem 0.6rem',
                          borderRadius: '999px'
                        }}
                      >
                        {isLocked ? '🔒 LOCKED' : 'OCCUPIED'}
                      </span>
                    )}
                  </div>

                  {/* Dates */}
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-slate-800)', marginBottom: '0.35rem' }}>
                    {getWeekDateRangeFormatted(slot.weekStartDate)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)', marginBottom: '1rem' }}>
                    Mon {slot.weekStartDate} → Sun {slot.weekEndDate}
                  </div>

                  {/* Expected Payout */}
                  <div style={{ padding: '0.65rem 0.85rem', background: isMine ? 'rgba(255, 255, 255, 0.7)' : 'var(--color-slate-50)', borderRadius: '8px', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-slate-500)', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>
                      Expected Pool Payout
                    </span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-emerald-900)' }}>
                      {group.currency}{slot.expectedPoolAmount.toLocaleString()}
                    </span>
                  </div>

                  {/* Recipient / Occupant Name */}
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-slate-600)', marginBottom: '1.25rem' }}>
                    {isMine ? (
                      <span style={{ color: 'var(--color-emerald-800)', fontWeight: 700 }}>
                        Assigned to: You ({currentMember.name})
                      </span>
                    ) : isAvailable ? (
                      <span style={{ color: 'var(--color-emerald-700)', fontWeight: 600 }}>
                        Open slot — Ready to claim
                      </span>
                    ) : (
                      <span>
                        Assigned to: <strong>{slot.memberName}</strong>
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div>
                  {isMine ? (
                    <div
                      style={{
                        padding: '0.6rem',
                        background: 'rgba(37, 139, 111, 0.15)',
                        borderRadius: '8px',
                        textAlign: 'center',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        color: 'var(--color-emerald-900)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.35rem'
                      }}
                    >
                      <Check size={14} strokeWidth={3} /> Your Confirmed Slot (Locked)
                    </div>
                  ) : isAvailable ? (
                    isSlotLocked ? (
                      <div
                        style={{
                          padding: '0.6rem',
                          background: 'var(--color-slate-100)',
                          borderRadius: '8px',
                          textAlign: 'center',
                          fontSize: '0.8rem',
                          color: 'var(--color-slate-500)',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.35rem'
                        }}
                        title="You already have a confirmed slot. Once selected, members cannot change slots."
                      >
                        <Lock size={12} /> Open Slot (Selection Locked)
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="btn-gold"
                        style={{
                          width: '100%',
                          justifyContent: 'center',
                          padding: '0.65rem',
                          fontSize: '0.85rem'
                        }}
                        onClick={() => handleSelectSlot(slot.weekNumber)}
                      >
                        <CheckCircle2 size={16} /> Select This Slot
                      </button>
                    )
                  ) : (
                    <div
                      style={{
                        padding: '0.6rem',
                        background: 'var(--color-slate-100)',
                        borderRadius: '8px',
                        textAlign: 'center',
                        fontSize: '0.78rem',
                        color: 'var(--color-slate-500)',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.35rem'
                      }}
                    >
                      <Lock size={12} />
                      {isPastOrActive ? 'Slot Closed (Active / Paid)' : `Reserved for ${slot.memberName}`}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rules and Fair Rotation Guarantee Notice */}
      <div className="card" style={{ marginTop: '2rem', background: '#ffffff', border: '1px solid var(--color-slate-200)' }}>
        <h3 style={{ fontSize: '1.15rem', color: 'var(--color-emerald-950)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={20} color="var(--color-emerald-700)" />
          How Rotation Slot Selection Works
        </h3>
        <ul style={{ paddingLeft: '1.25rem', fontSize: '0.88rem', color: 'var(--color-slate-600)', lineHeight: 1.7 }}>
          <li>
            <strong>1 Member = 1 Weekly Turn:</strong> Each member receives the complete pooled contributions of the circle during their chosen week.
          </li>
          <li>
            <strong>One-Time Selection & Permanent Lock:</strong> Once a member selects or is assigned a rotation slot, it is permanently locked and cannot be changed or swapped by members. This guarantees fairness and predictable scheduling for all participants.
          </li>
          <li>
            <strong>Agent Administrative Adjustments:</strong> If you face an emergency or require a schedule adjustment, only your assigned Susu Agent Organizer can reorder or adjust future turns from the Agent Management portal.
          </li>
          <li>
            <strong>Cycle Integrity Protection:</strong> Active and completed weekly payout rounds are permanently locked against any changes.
          </li>
        </ul>
      </div>
    </div>
  );
};
