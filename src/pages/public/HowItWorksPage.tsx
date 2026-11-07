import React from 'react';
import { Calendar, CreditCard, Shield, CheckCircle, ArrowRight } from 'lucide-react';

interface HowItWorksPageProps {
  onNavigate: (path: string) => void;
}

export const HowItWorksPage: React.FC<HowItWorksPageProps> = ({ onNavigate }) => {
  return (
    <div className="how-it-works-page">
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.4rem', marginBottom: '0.75rem' }}>How Susu Rotating Savings Works</h1>
        <p style={{ color: 'var(--color-slate-600)', maxWidth: '700px', margin: '0 auto', fontSize: '1.05rem' }}>
          Understanding the mathematical mechanics, daily payment obligations, and rotation queue calendar behind West Africa's favorite community banking model.
        </p>
      </div>

      <div className="rules-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className="card">
          <div style={{ background: 'var(--color-slate-100)', width: '54px', height: '54px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <Calendar size={28} color="var(--color-emerald-700)" />
          </div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>1. Monday to Sunday Daily Contributions</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-slate-600)', lineHeight: '1.6' }}>
            Each Susu cycle runs strictly on a weekly cadence. The daily payment window opens on Monday 00:00 GMT and closes on Sunday 23:59 GMT. Every member contributes a fixed amount (e.g. GH₵20) each day.
          </p>
        </div>

        <div className="card">
          <div style={{ background: 'var(--color-slate-100)', width: '54px', height: '54px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <CreditCard size={28} color="var(--color-gold-600)" />
          </div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>2. Direct Paystack Billing or Cash</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-slate-600)', lineHeight: '1.6' }}>
            Members pay online via credit/debit card or Mobile Money (Momo) directly inside their portal. Agents can also log offline cash payments manually into the audit ledger.
          </p>
        </div>

        <div className="card">
          <div style={{ background: 'var(--color-slate-100)', width: '54px', height: '54px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <Shield size={28} color="var(--color-emerald-700)" />
          </div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>3. Weekly Pooled Recipient Distribution</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-slate-600)', lineHeight: '1.6' }}>
            At the end of each 7-day week, the total collected pool (daily amount × 7 × N) is transferred to the member scheduled for that week.
          </p>
        </div>

        <div className="card">
          <div style={{ background: 'var(--color-slate-100)', width: '54px', height: '54px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <CheckCircle size={28} color="var(--color-gold-600)" />
          </div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>4. Locked Rotation & Reliability Ratings</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-slate-600)', lineHeight: '1.6' }}>
            Once a week starts, its position is locked to guarantee fairness. Member reliability scores track on-time contributions across cycles.
          </p>
        </div>
      </div>

      <div className="card card-emerald" style={{ marginTop: '3rem', padding: '2.5rem', textAlign: 'center' }}>
        <h2 style={{ color: '#fff', fontSize: '1.75rem', marginBottom: '1rem' }}>
          Ready to start your community savings group?
        </h2>
        <p style={{ color: 'var(--color-slate-200)', maxWidth: '600px', margin: '0 auto 1.5rem' }}>
          Organize up to 20 members, set daily limits, and manage payout dates with automated reminders.
        </p>
        <button className="btn-gold" style={{ fontSize: '1rem', padding: '0.85rem 2rem' }} onClick={() => onNavigate('/signup')}>
          Create Susu Group Now <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
