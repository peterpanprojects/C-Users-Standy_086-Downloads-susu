import React, { useState } from 'react';
import {
  ShieldCheck,
  ArrowRight,
  Calculator,
  CheckCircle2,
  Lock,
  Users,
  Calendar,
  CreditCard,
  Sparkles,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Zap,
  Smartphone,
  Check,
  X,
  TrendingUp,
  HelpCircle,
  Shield,
  Award,
  Clock,
  Key,
  LogIn
} from 'lucide-react';
import { useSusu } from '../../context/SusuContext';

interface LandingPageProps {
  onNavigate: (path: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { setRole, posts } = useSusu();

  // Interactive Susu Pool Calculator state
  const [dailyAmount, setDailyAmount] = useState<number>(20);
  const [memberCount, setMemberCount] = useState<number>(5);

  // FAQ accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const weeklyPool = dailyAmount * 7 * memberCount;
  const cycleDurationWeeks = memberCount;
  const memberWeeklyContribution = dailyAmount * 7;

  // Preset scenarios
  const presets = [
    { label: 'Popular', daily: 20, members: 5 },
    { label: 'Starter', daily: 10, members: 7 },
    { label: 'Growth', daily: 50, members: 10 },
    { label: 'Executive', daily: 100, members: 12 },
  ];

  // FAQ items data
  const faqs = [
    {
      q: 'What is a Susu / ROSCA scheme?',
      a: 'A Susu (Rotating Savings and Credit Association) is a community savings tradition. A fixed group of members contributes a set amount daily (Monday through Sunday). Each Sunday night, one scheduled member receives the entire lump-sum pooled pot until everyone in the group has had their turn.',
    },
    {
      q: 'How are daily contributions collected?',
      a: 'Members can contribute in seconds directly from their portal using Mobile Money (MTN MoMo, Telecel Cash, AT Money) or debit/credit cards via Paystack. If cash is paid in person, the Agent records a verified cash override in the platform ledger.',
    },
    {
      q: 'What happens if a member misses a daily payment?',
      a: 'Missed payments immediately trigger automated reconciliation flags on the Agent ledger. The delinquent member receives SMS/WhatsApp alerts, and their on-time Reliability Score is adjusted until the arrears are cleared.',
    },
    {
      q: 'Can the Agent change the payout schedule mid-cycle?',
      a: 'No. To guarantee fairness and trust, rotation calendar slots are cryptographically locked once the cycle starts. Neither the Agent nor members can modify past or active payout orders.',
    },
    {
      q: 'When and how is the weekly payout distributed?',
      a: 'Each cycle week runs Monday 00:00 GMT to Sunday 23:59 GMT. On Sunday evening, once daily collections are verified, the full accumulated pool is disbursed directly to the scheduled recipient via their registered Mobile Money wallet or bank account.',
    },
  ];
  // Sample rotation for roadmap display
  const sampleRotation = [
    { week: 1, recipient: 'Ama K.', amount: 700, status: 'Completed ✓', date: 'Mon 12 - Sun 18 May' },
    { week: 2, recipient: 'Kwame A.', amount: 700, status: 'Completed ✓', date: 'Mon 19 - Sun 25 May' },
    { week: 3, recipient: 'You (Next)', amount: 700, status: 'Active - Payout This Sun', date: 'Mon 26 May - Sun 1 Jun' },
    { week: 4, recipient: 'Efua M.', amount: 700, status: 'Queued', date: 'Mon 2 - Sun 8 Jun' },
    { week: 5, recipient: 'Kojo B.', amount: 700, status: 'Queued', date: 'Mon 9 - Sun 15 Jun' },
  ];

  return (
    <div className="landing-page">
      {/* 1. HERO SECTION */}
      <section className="hero-section">
        <div className="hero-badge">
          <Sparkles size={14} color="#E5A93C" />
          <span>Next-Generation Susu & ROSCA Platform</span>
        </div>

        <h1 className="hero-title">
          Smart, Transparent & Automated <br />
          <span className="text-gold">Susu Savings</span> Management
        </h1>

        <p className="hero-subtitle">
          Modernize your rotating savings circle. Group members contribute a fixed daily amount from Monday to Sunday. Each week, one member receives the complete pooled payout with zero math errors and complete transparency.
        </p>

        <div className="hero-ctas">
          <button
            className="btn-gold hero-btn"
            onClick={() => {
              setRole('agent');
              onNavigate('/signup');
            }}
          >
            Create Susu Group as Agent <ArrowRight size={18} />
          </button>
          <button
            className="btn-outline hero-btn-outline"
            onClick={() => onNavigate('/invite')}
            title="Join with an invitation link or member code"
          >
            <Key size={16} /> I Have an Invite Token
          </button>
          <button
            className="btn-outline hero-btn-outline"
            style={{ color: 'var(--color-emerald-950)', borderColor: 'rgba(5, 46, 22, 0.3)' }}
            onClick={() => onNavigate('/login')}
            title="Sign In to Your Working Portal"
          >
            <LogIn size={16} /> Sign In
          </button>
        </div>

        {/* Floating Metrics */}
        <div className="hero-stats">
          <div className="stat-card">
            <span className="stat-value">100%</span>
            <span className="stat-label">Transparent Rotation</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">7 Days</span>
            <span className="stat-label">Mon–Sun Contribution</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">Paystack</span>
            <span className="stat-label">Secured Payments</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">0 Errors</span>
            <span className="stat-label">Automated Ledger</span>
          </div>
        </div>
      </section>

      {/* 2. SUPPORTED PAYMENT METHODS & TRUST BAR */}
      <section className="payment-trust-bar">
        <div className="trust-bar-container">
          <div className="trust-bar-label">
            <Shield size={16} color="var(--color-gold-500)" />
            <span>Supported Channels & Verification</span>
          </div>
          <div className="trust-pill-list">
            <span className="payment-pill">
              <Smartphone size={14} /> MTN Mobile Money
            </span>
            <span className="payment-pill">
              <Smartphone size={14} /> Telecel Cash
            </span>
            <span className="payment-pill">
              <Smartphone size={14} /> AT Money
            </span>
            <span className="payment-pill">
              <CreditCard size={14} /> Visa & Mastercard
            </span>
            <span className="payment-pill highlight">
              <Lock size={14} /> 256-Bit SSL Encrypted
            </span>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE SUSU POOL CALCULATOR */}
      <section className="calculator-section">
        <div className="card card-emerald calculator-card">
          <div className="calc-header">
            <div className="calc-icon-box">
              <Calculator size={26} />
            </div>
            <div>
              <h2 style={{ color: '#fff', fontSize: '1.45rem', marginBottom: '0.2rem' }}>
                Interactive Susu Pool Calculator
              </h2>
              <p style={{ color: 'var(--color-slate-200)', fontSize: '0.88rem' }}>
                Select a preset or adjust the sliders to calculate weekly lump-sum payouts instantly.
              </p>
            </div>
          </div>

          {/* Quick Preset Chips */}
          <div className="presets-row">
            <span className="presets-label">Quick Presets:</span>
            <div className="presets-buttons">
              {presets.map((preset) => {
                const isSelected = dailyAmount === preset.daily && memberCount === preset.members;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    className={`preset-chip ${isSelected ? 'active' : ''}`}
                    onClick={() => {
                      setDailyAmount(preset.daily);
                      setMemberCount(preset.members);
                    }}
                  >
                    <strong>{preset.label}</strong>: GH₵{preset.daily}/day · {preset.members} mbrs
                  </button>
                );
              })}
            </div>
          </div>

          <div className="calc-grid">
            <div className="calc-controls">
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <label className="form-label" style={{ color: '#fff', margin: 0 }}>
                    Fixed Daily Contribution (Mon–Sun)
                  </label>
                  <strong style={{ color: 'var(--color-gold-400)', fontSize: '1.1rem' }}>
                    GH₵ {dailyAmount}
                  </strong>
                </div>
                <input
                  type="range"
                  min="5"
                  max="200"
                  step="5"
                  value={dailyAmount}
                  onChange={(e) => setDailyAmount(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--color-gold-500)', cursor: 'pointer' }}
                />
                <div className="range-hints">
                  <span>GH₵ 5/day</span>
                  <span>GH₵ 100/day</span>
                  <span>GH₵ 200/day</span>
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <label className="form-label" style={{ color: '#fff', margin: 0 }}>
                    Group Member Count (Cycle Length)
                  </label>
                  <strong style={{ color: 'var(--color-gold-400)', fontSize: '1.1rem' }}>
                    {memberCount} Members ({cycleDurationWeeks} Weeks)
                  </strong>
                </div>
                <input
                  type="range"
                  min="3"
                  max="20"
                  step="1"
                  value={memberCount}
                  onChange={(e) => setMemberCount(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--color-gold-500)', cursor: 'pointer' }}
                />
                <div className="range-hints">
                  <span>3 Members</span>
                  <span>10 Members</span>
                  <span>20 Members</span>
                </div>
              </div>
            </div>

            <div className="calc-result">
              <span className="result-label">Weekly Recipient Pooled Payout:</span>
              <span className="result-value">GH₵ {weeklyPool.toLocaleString()}</span>
              <p className="result-breakdown">
                {memberCount} members × 7 days × GH₵{dailyAmount}/day
              </p>
              <div className="calc-summary-pill">
                <span>Member weekly cost: <strong>GH₵ {memberWeeklyContribution}</strong></span>
                <span>•</span>
                <span>Total cycle: <strong>{cycleDurationWeeks} weeks</strong></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. VISUAL ROTATION ROADMAP ("CYCLE AT A GLANCE") */}
      <section className="cycle-roadmap-section">
        <div className="section-heading">
          <div className="section-tag">
            <Clock size={14} />
            <span>Rotation Mechanics</span>
          </div>
          <h2>Cycle at a Glance: How 5 Members Save GH₵700</h2>
          <p>
            With a GH₵20 daily contribution and 5 members, every member contributes GH₵140 each week. Every Sunday, one member receives the complete GH₵700 lump sum.
          </p>
        </div>

        <div className="roadmap-grid">
          {sampleRotation.map((step) => {
            const isCompleted = step.status.includes('Completed');
            const isActive = step.status.includes('Active');
            return (
              <div key={step.week} className={`roadmap-card ${isActive ? 'active-card' : ''}`}>
                <div className="roadmap-header">
                  <span className="roadmap-week-pill">Week {step.week}</span>
                  <span className={`roadmap-status-badge ${isCompleted ? 'badge-completed' : isActive ? 'badge-active' : 'badge-queued'}`}>
                    {step.status}
                  </span>
                </div>
                <h4 className="roadmap-recipient">{step.recipient}</h4>
                <div className="roadmap-amount">
                  <span className="amount-label">Payout Collected:</span>
                  <span className="amount-val">GH₵ {step.amount}</span>
                </div>
                <div className="roadmap-footer">
                  <Calendar size={13} />
                  <span>{step.date}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. HOW IT WORKS 3-STEP FLOW */}
      <section className="how-it-works-preview">
        <div className="section-heading">
          <div className="section-tag">
            <Zap size={14} />
            <span>Simple Workflow</span>
          </div>
          <h2>How the Susu Scheme Works</h2>
          <p>
            A disciplined, community-backed financial model refined for modern digital convenience.
          </p>
        </div>

        <div className="steps-grid">
          <div className="card step-card">
            <div className="step-num">1</div>
            <Users className="step-icon" color="var(--color-emerald-700)" size={32} />
            <h3>1. Agent Setup & Invites</h3>
            <p>
              The Agent creates the group, sets the daily amount (e.g. GH₵20), and invites trusted members via SMS, email, or private token links.
            </p>
          </div>

          <div className="card step-card">
            <div className="step-num">2</div>
            <CreditCard className="step-icon" color="var(--color-gold-600)" size={32} />
            <h3>2. Mon–Sun Contributions</h3>
            <p>
              Members contribute every day from Monday to Sunday using Mobile Money (MoMo), bank cards via Paystack, or logged cash receipts.
            </p>
          </div>

          <div className="card step-card">
            <div className="step-num">3</div>
            <Calendar className="step-icon" color="var(--color-emerald-700)" size={32} />
            <h3>3. Weekly Sunday Payout</h3>
            <p>
              Every Sunday night, the full weekly pool is disbursed directly to the scheduled recipient according to the locked rotation calendar.
            </p>
          </div>
        </div>
      </section>

      {/* 6. TRADITIONAL SUSU VS DIGITAL SUSU PLATFORM */}
      <section className="comparison-section">
        <div className="section-heading">
          <div className="section-tag">
            <Award size={14} />
            <span>Why Switch</span>
          </div>
          <h2>Traditional Susu vs. Digital Susu Vault</h2>
          <p>
            Say goodbye to paper passbooks, math disputes, and chasing cash down the street.
          </p>
        </div>

        <div className="comparison-table-wrapper card">
          <table className="comparison-table">
            <thead>
              <tr>
                <th style={{ width: '25%' }}>Feature</th>
                <th style={{ width: '37.5%' }} className="traditional-th">
                  Traditional Paper Susu
                </th>
                <th style={{ width: '37.5%' }} className="digital-th">
                  <Sparkles size={16} color="#E5A93C" /> Susu Platform
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="feature-title">
                  <strong>Record Keeping</strong>
                </td>
                <td className="traditional-td">
                  <div className="cell-content">
                    <X size={18} color="var(--color-danger-500)" />
                    <span>Physical cardboard cards, lost records & bookkeeping math errors</span>
                  </div>
                </td>
                <td className="digital-td">
                  <div className="cell-content">
                    <Check size={18} color="var(--color-emerald-500)" />
                    <span><strong>Immutable digital ledger</strong> with real-time balance calculations</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="feature-title">
                  <strong>Payment Collection</strong>
                </td>
                <td className="traditional-td">
                  <div className="cell-content">
                    <X size={18} color="var(--color-danger-500)" />
                    <span>Chasing members door-to-door for cash and handling unverified bills</span>
                  </div>
                </td>
                <td className="digital-td">
                  <div className="cell-content">
                    <Check size={18} color="var(--color-emerald-500)" />
                    <span><strong>1-tap Mobile Money & Card payments</strong> with instant digital receipts</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="feature-title">
                  <strong>Rotation Calendar</strong>
                </td>
                <td className="traditional-td">
                  <div className="cell-content">
                    <X size={18} color="var(--color-danger-500)" />
                    <span>Verbal commitments and arguments over who gets the early weeks</span>
                  </div>
                </td>
                <td className="digital-td">
                  <div className="cell-content">
                    <Check size={18} color="var(--color-emerald-500)" />
                    <span><strong>Locked rotation schedule</strong> preventing favoritism and schedule tampering</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="feature-title">
                  <strong>Default Management</strong>
                </td>
                <td className="traditional-td">
                  <div className="cell-content">
                    <X size={18} color="var(--color-danger-500)" />
                    <span>Delayed detection of missed payments causing the entire pool to collapse</span>
                  </div>
                </td>
                <td className="digital-td">
                  <div className="cell-content">
                    <Check size={18} color="var(--color-emerald-500)" />
                    <span><strong>Member reliability scoring (0–100%)</strong> & instant overdue alert flags</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="feature-title">
                  <strong>Financial Auditing</strong>
                </td>
                <td className="traditional-td">
                  <div className="cell-content">
                    <X size={18} color="var(--color-danger-500)" />
                    <span>No verifiable paper trail at cycle conclusion for dispute resolution</span>
                  </div>
                </td>
                <td className="digital-td">
                  <div className="cell-content">
                    <Check size={18} color="var(--color-emerald-500)" />
                    <span><strong>1-click CSV audit export</strong> available to both agents and members</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 7. DUAL-ROLE EXPERIENCE (AGENTS & MEMBERS) */}
      <section className="roles-experience-section">
        <div className="section-heading">
          <div className="section-tag">
            <Users size={14} />
            <span>Built for Everyone</span>
          </div>
          <h2>Engineered for Both Agents & Members</h2>
          <p>
            Whether you are running a savings circle for your community or participating as a daily contributor, we have tailored tools for your workflow.
          </p>
        </div>

        <div className="roles-grid">
          {/* Agent Card */}
          <div className="card role-card agent-role-card">
            <div className="role-badge agent-badge">
              <ShieldCheck size={18} /> For Group Agents & Organizers
            </div>
            <h3>Manage Groups with Total Control</h3>
            <p className="role-sub">
              Eliminate administrative chaos. Track daily payments, verify cash transactions, and keep members happy.
            </p>
            <ul className="role-features-list">
              <li>
                <CheckCircle2 size={18} color="var(--color-gold-500)" />
                <span><strong>Setup in under 2 minutes:</strong> Configure daily targets, payout cycles, and invite limits.</span>
              </li>
              <li>
                <CheckCircle2 size={18} color="var(--color-gold-500)" />
                <span><strong>Automated daily reconciliation:</strong> Instantly see who has paid and who is pending for Monday–Sunday.</span>
              </li>
              <li>
                <CheckCircle2 size={18} color="var(--color-gold-500)" />
                <span><strong>Manual cash override:</strong> Accept cash payments on the street and log verified receipts in seconds.</span>
              </li>
              <li>
                <CheckCircle2 size={18} color="var(--color-gold-500)" />
                <span><strong>Export audit reports:</strong> Generate CSV spreadsheets for comprehensive accounting at any moment.</span>
              </li>
            </ul>
            <button
              className="btn-gold"
              style={{ width: '100%', marginTop: '1.5rem' }}
              onClick={() => {
                setRole('agent');
                onNavigate('/signup');
              }}
            >
              Start as an Agent Admin <ArrowRight size={16} />
            </button>
          </div>

          {/* Member Card */}
          <div className="card role-card member-role-card">
            <div className="role-badge member-badge">
              <TrendingUp size={18} /> For Contributing Members
            </div>
            <h3>Save Daily & Receive Guaranteed Payouts</h3>
            <p className="role-sub">
              Build a solid savings habit with friends, family, or colleagues. Enjoy peace of mind with full ledger visibility.
            </p>
            <ul className="role-features-list">
              <li>
                <CheckCircle2 size={18} color="var(--color-emerald-600)" />
                <span><strong>1-tap daily payments:</strong> Pay effortlessly with MTN MoMo, Telecel Cash, or bank cards.</span>
              </li>
              <li>
                <CheckCircle2 size={18} color="var(--color-emerald-600)" />
                <span><strong>Locked rotation dates:</strong> Know the exact calendar date your lump-sum payout arrives.</span>
              </li>
              <li>
                <CheckCircle2 size={18} color="var(--color-emerald-600)" />
                <span><strong>Build your reliability score:</strong> Earn a stellar financial rating through on-time payments.</span>
              </li>
              <li>
                <CheckCircle2 size={18} color="var(--color-emerald-600)" />
                <span><strong>Automated receipts & alerts:</strong> Get instant confirmation each time a contribution is recorded.</span>
              </li>
            </ul>
            <button
              className="btn-outline"
              style={{ width: '100%', marginTop: '1.5rem', color: 'var(--color-emerald-950)', borderColor: 'var(--color-emerald-950)' }}
              onClick={() => onNavigate('/invite')}
            >
              Member Portal & Token Access <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* 8. TRUST SIGNALS & BANK-GRADE SECURITY */}
      <section className="trust-section">
        <div className="card card-emerald">
          <div className="trust-grid">
            <div>
              <div className="trust-sec-tag">
                <Lock size={14} color="#E5A93C" />
                <span>Financial Safety</span>
              </div>
              <h2 style={{ color: '#fff', fontSize: '1.8rem', marginBottom: '1rem' }}>
                Bank-Grade Trust & Security
              </h2>
              <ul className="trust-list">
                <li>
                  <CheckCircle2 color="#E5A93C" size={20} />
                  <span><strong>Paystack Integration:</strong> Direct Mobile Money and card billing with PCI-DSS Level 1 compliance.</span>
                </li>
                <li>
                  <CheckCircle2 color="#E5A93C" size={20} />
                  <span><strong>Locked Rotation Calendar:</strong> Past and active weeks cannot be retroactively tampered with.</span>
                </li>
                <li>
                  <CheckCircle2 color="#E5A93C" size={20} />
                  <span><strong>Reliability Tracking:</strong> Objective 0–100% on-time score for every group member.</span>
                </li>
                <li>
                  <CheckCircle2 color="#E5A93C" size={20} />
                  <span><strong>Audit Trail & Export:</strong> Download comprehensive CSV financial ledgers at any time.</span>
                </li>
              </ul>
            </div>
            <div className="trust-badge-box">
              <Lock size={56} color="#E5A93C" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>Encrypted & Verified</h3>
              <p style={{ color: 'var(--color-slate-300)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                Every transaction is backed by cryptographically verified tokens and webhook signatures, safeguarding your community pool 24/7.
              </p>
              <div className="security-sub-badges">
                <span><Shield size={12} /> 256-Bit SSL</span>
                <span><Award size={12} /> ISO 27001 Ready</span>
                <span><CheckCircle2 size={12} /> Zero Math Errors</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FREQUENTLY ASKED QUESTIONS (ACCORDION) */}
      <section className="faq-section">
        <div className="section-heading">
          <div className="section-tag">
            <HelpCircle size={14} />
            <span>Got Questions?</span>
          </div>
          <h2>Frequently Asked Questions</h2>
          <p>
            Quick, concise answers to help you understand how Susu groups run securely on our platform.
          </p>
        </div>

        <div className="faq-accordion">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div key={index} className={`faq-item card ${isOpen ? 'faq-open' : ''}`}>
                <button
                  type="button"
                  className="faq-question-btn"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  aria-expanded={isOpen}
                >
                  <span className="faq-q-text">{faq.q}</span>
                  <span className="faq-chevron">
                    {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </span>
                </button>
                {isOpen && (
                  <div className="faq-answer">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 10. COMMUNITY FEED TEASER */}
      <section className="feed-teaser">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem' }}>Public Community Feed</h2>
            <p style={{ color: 'var(--color-slate-600)', fontSize: '0.85rem' }}>
              Real-time updates and transparency announcements across all active Susu pools
            </p>
          </div>
          <button className="btn-outline" onClick={() => onNavigate('/feed')}>
            <MessageSquare size={16} /> View All Feed Posts
          </button>
        </div>

        <div className="posts-grid">
          {posts.slice(0, 2).map((post) => (
            <div key={post.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span className="status-pill active" style={{ fontSize: '0.7rem' }}>
                  {post.authorRole.toUpperCase()}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)' }}>
                  {new Date(post.publishedAt).toLocaleDateString()}
                </span>
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.4rem' }}>{post.title}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-slate-700)', lineHeight: 1.5 }}>
                {post.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 11. CLOSING CALL TO ACTION BANNER */}
      <section className="closing-cta-section">
        <div className="card card-emerald cta-box">
          <div className="cta-content">
            <div className="hero-badge" style={{ marginBottom: '1rem', background: 'rgba(229, 169, 60, 0.15)', borderColor: 'rgba(229, 169, 60, 0.4)' }}>
              <Sparkles size={14} color="#E5A93C" />
              <span style={{ color: '#FAD789' }}>Ready to Modernize Your Susu Group?</span>
            </div>
            <h2 style={{ color: '#fff', fontSize: '2.2rem', marginBottom: '0.75rem' }}>
              Start Saving with Confidence Today
            </h2>
            <p style={{ color: 'var(--color-slate-200)', maxWidth: '650px', margin: '0 auto 2rem', fontSize: '1rem', lineHeight: 1.6 }}>
              Join forward-thinking community groups in West Africa and beyond. Automate daily collections, protect your payout schedule, and build lasting financial trust.
            </p>
            <div className="hero-ctas" style={{ marginBottom: 0 }}>
              <button
                className="btn-gold hero-btn"
                onClick={() => {
                  setRole('agent');
                  onNavigate('/signup');
                }}
              >
                Create Group as Agent <ArrowRight size={18} />
              </button>
              <button
                className="btn-outline"
                style={{ color: '#fff', borderColor: 'rgba(255, 255, 255, 0.4)', background: 'rgba(255, 255, 255, 0.08)' }}
                onClick={() => onNavigate('/invite')}
              >
                <Key size={16} /> I Have an Invite Token
              </button>
              <button
                className="btn-outline"
                style={{ color: 'var(--color-gold-300)', borderColor: 'rgba(229, 169, 60, 0.4)', background: 'rgba(0, 0, 0, 0.2)' }}
                onClick={() => onNavigate('/login')}
              >
                <LogIn size={16} /> Sign In
              </button>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .landing-page {
          display: flex;
          flex-direction: column;
          gap: 4rem;
        }

        /* 1. Hero */
        .hero-section {
          text-align: center;
          padding: 2.5rem 1rem 1rem;
          max-width: 950px;
          margin: 0 auto;
        }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--color-emerald-100);
          color: var(--color-emerald-900);
          border: 1px solid var(--color-emerald-300);
          padding: 0.35rem 1rem;
          border-radius: var(--radius-full);
          font-size: 0.8rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
        }
        .hero-title {
          font-size: 2.8rem;
          line-height: 1.15;
          margin-bottom: 1.25rem;
        }
        .text-gold {
          color: var(--color-gold-600);
        }
        .hero-subtitle {
          font-size: 1.1rem;
          color: var(--color-slate-600);
          line-height: 1.6;
          margin-bottom: 2rem;
          max-width: 800px;
          margin-left: auto;
          margin-right: auto;
        }
        .hero-ctas {
          display: flex;
          justify-content: center;
          gap: 1rem;
          flex-wrap: wrap;
          margin-bottom: 3rem;
        }
        .hero-btn {
          padding: 0.9rem 2rem;
          font-size: 1rem;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }
        .hero-btn-outline {
          padding: 0.9rem 2rem;
          font-size: 1rem;
          color: var(--color-emerald-900);
          border-color: var(--color-emerald-900);
        }
        .hero-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          background: #fff;
          padding: 1.5rem;
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-md);
          border: 1px solid var(--color-slate-200);
        }
        .stat-card {
          text-align: center;
        }
        .stat-value {
          display: block;
          font-size: 1.8rem;
          font-weight: 800;
          color: var(--color-emerald-800);
          font-family: var(--font-heading);
        }
        .stat-label {
          font-size: 0.8rem;
          color: var(--color-slate-600);
          font-weight: 600;
        }

        /* 2. Supported Payments & Trust Bar */
        .payment-trust-bar {
          background: #fff;
          border: 1px solid var(--color-slate-200);
          border-radius: var(--radius-lg);
          padding: 1rem 1.5rem;
          box-shadow: var(--shadow-sm);
        }
        .trust-bar-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .trust-bar-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--color-emerald-950);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .trust-pill-list {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          flex-wrap: wrap;
        }
        .payment-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: var(--color-slate-100);
          color: var(--color-slate-800);
          padding: 0.35rem 0.75rem;
          border-radius: var(--radius-full);
          font-size: 0.78rem;
          font-weight: 600;
          border: 1px solid var(--color-slate-200);
        }
        .payment-pill.highlight {
          background: var(--color-emerald-50);
          color: var(--color-emerald-900);
          border-color: var(--color-emerald-300);
        }

        /* 3. Calculator */
        .calc-header {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          margin-bottom: 1.25rem;
        }
        .calc-icon-box {
          background: var(--color-gold-500);
          color: #000;
          padding: 0.6rem;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .presets-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
          padding-bottom: 1.25rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          flex-wrap: wrap;
        }
        .presets-label {
          font-size: 0.82rem;
          color: var(--color-gold-300);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .presets-buttons {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .preset-chip {
          background: rgba(255, 255, 255, 0.08);
          color: #fff;
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 0.35rem 0.75rem;
          border-radius: var(--radius-full);
          font-size: 0.78rem;
          transition: all var(--transition-fast);
          cursor: pointer;
        }
        .preset-chip:hover {
          background: rgba(229, 169, 60, 0.2);
          border-color: var(--color-gold-400);
        }
        .preset-chip.active {
          background: var(--color-gold-500);
          color: var(--color-emerald-950);
          font-weight: 700;
          border-color: var(--color-gold-400);
        }
        .calc-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 2rem;
          align-items: center;
        }
        .range-hints {
          display: flex;
          justify-content: space-between;
          font-size: 0.72rem;
          color: var(--color-slate-300);
          margin-top: 0.3rem;
        }
        .calc-result {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(229, 169, 60, 0.35);
          border-radius: var(--radius-lg);
          padding: 1.75rem;
          text-align: center;
          backdrop-filter: blur(4px);
        }
        .result-label {
          display: block;
          font-size: 0.85rem;
          color: var(--color-gold-300);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .result-value {
          display: block;
          font-size: 2.6rem;
          font-weight: 800;
          color: #fff;
          font-family: var(--font-heading);
          margin: 0.4rem 0;
        }
        .result-breakdown {
          font-size: 0.8rem;
          color: var(--color-slate-200);
          margin-bottom: 1rem;
        }
        .calc-summary-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(0, 0, 0, 0.25);
          padding: 0.4rem 0.85rem;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          color: var(--color-gold-200);
          border: 1px solid rgba(229, 169, 60, 0.2);
        }

        /* Section Headings Common */
        .section-heading {
          text-align: center;
          max-width: 680px;
          margin: 0 auto 2.5rem;
        }
        .section-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: var(--color-gold-100);
          color: var(--color-gold-900);
          border: 1px solid var(--color-gold-300);
          padding: 0.25rem 0.75rem;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.75rem;
        }
        .section-heading h2 {
          font-size: 2rem;
          margin-bottom: 0.6rem;
        }
        .section-heading p {
          color: var(--color-slate-600);
          font-size: 0.95rem;
          line-height: 1.5;
        }

        /* 4. Rotation Roadmap */
        .roadmap-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 1rem;
        }
        .roadmap-card {
          background: #fff;
          border: 1px solid var(--color-slate-200);
          border-radius: var(--radius-md);
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          transition: transform var(--transition-fast), box-shadow var(--transition-fast);
          position: relative;
        }
        .roadmap-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
        .roadmap-card.active-card {
          border: 2px solid var(--color-gold-500);
          background: var(--color-gold-50);
          box-shadow: var(--shadow-glow-gold);
        }
        .roadmap-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .roadmap-week-pill {
          font-size: 0.72rem;
          font-weight: 800;
          color: var(--color-emerald-900);
          background: var(--color-emerald-100);
          padding: 0.15rem 0.5rem;
          border-radius: var(--radius-full);
        }
        .roadmap-status-badge {
          font-size: 0.68rem;
          font-weight: 700;
          padding: 0.15rem 0.45rem;
          border-radius: var(--radius-sm);
        }
        .badge-completed {
          background: var(--color-emerald-100);
          color: var(--color-emerald-800);
        }
        .badge-active {
          background: var(--color-gold-500);
          color: var(--color-emerald-950);
        }
        .badge-queued {
          background: var(--color-slate-100);
          color: var(--color-slate-600);
        }
        .roadmap-recipient {
          font-size: 1.05rem;
          color: var(--color-emerald-950);
          margin-top: 0.25rem;
        }
        .roadmap-amount {
          display: flex;
          flex-direction: column;
          background: rgba(0, 0, 0, 0.03);
          padding: 0.5rem;
          border-radius: var(--radius-sm);
        }
        .amount-label {
          font-size: 0.7rem;
          color: var(--color-slate-500);
          text-transform: uppercase;
        }
        .amount-val {
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--color-emerald-800);
        }
        .roadmap-footer {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.75rem;
          color: var(--color-slate-500);
          margin-top: auto;
          padding-top: 0.5rem;
          border-top: 1px dashed var(--color-slate-200);
        }

        /* 5. How It Works Steps */
        .steps-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }
        .step-card {
          position: relative;
          padding-top: 2rem;
          border-top: 3px solid var(--color-emerald-600);
        }
        .step-num {
          position: absolute;
          top: -16px;
          left: 20px;
          background: var(--color-gold-500);
          color: var(--color-emerald-950);
          width: 32px;
          height: 32px;
          border-radius: 50%;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-heading);
          box-shadow: var(--shadow-sm);
        }
        .step-card h3 {
          font-size: 1.15rem;
          margin: 0.75rem 0 0.5rem;
        }
        .step-card p {
          font-size: 0.85rem;
          color: var(--color-slate-600);
          line-height: 1.55;
        }

        /* 6. Comparison Table */
        .comparison-table-wrapper {
          overflow-x: auto;
          padding: 0;
          border: 1px solid var(--color-slate-200);
        }
        .comparison-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        .comparison-table th {
          padding: 1.1rem 1.25rem;
          font-size: 0.85rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 2px solid var(--color-slate-200);
        }
        .traditional-th {
          background: var(--color-slate-100);
          color: var(--color-slate-700);
        }
        .digital-th {
          background: var(--color-emerald-900);
          color: #fff;
          display: table-cell;
        }
        .comparison-table td {
          padding: 1rem 1.25rem;
          border-bottom: 1px solid var(--color-slate-200);
          font-size: 0.88rem;
          vertical-align: middle;
        }
        .feature-title {
          background: var(--color-slate-50);
          color: var(--color-emerald-950);
          font-weight: 700;
        }
        .traditional-td {
          background: #fff;
          color: var(--color-slate-600);
        }
        .digital-td {
          background: var(--color-emerald-50);
          color: var(--color-emerald-950);
        }
        .cell-content {
          display: flex;
          align-items: flex-start;
          gap: 0.6rem;
          line-height: 1.45;
        }

        /* 7. Dual Roles */
        .roles-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }
        .role-card {
          display: flex;
          flex-direction: column;
          padding: 2rem;
          border-radius: var(--radius-xl);
        }
        .agent-role-card {
          border-top: 4px solid var(--color-gold-500);
        }
        .member-role-card {
          border-top: 4px solid var(--color-emerald-600);
        }
        .role-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.78rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 0.3rem 0.8rem;
          border-radius: var(--radius-full);
          width: fit-content;
          margin-bottom: 1rem;
        }
        .agent-badge {
          background: var(--color-gold-100);
          color: var(--color-gold-900);
          border: 1px solid var(--color-gold-300);
        }
        .member-badge {
          background: var(--color-emerald-100);
          color: var(--color-emerald-900);
          border: 1px solid var(--color-emerald-300);
        }
        .role-card h3 {
          font-size: 1.4rem;
          margin-bottom: 0.4rem;
        }
        .role-sub {
          font-size: 0.88rem;
          color: var(--color-slate-600);
          margin-bottom: 1.25rem;
          line-height: 1.5;
        }
        .role-features-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          flex: 1;
        }
        .role-features-list li {
          display: flex;
          align-items: flex-start;
          gap: 0.6rem;
          font-size: 0.86rem;
          color: var(--color-slate-700);
          line-height: 1.45;
        }

        /* 8. Trust Section */
        .trust-grid {
          display: grid;
          grid-template-columns: 1.3fr 1fr;
          gap: 2rem;
          align-items: center;
        }
        .trust-sec-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          color: var(--color-gold-400);
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.5rem;
        }
        .trust-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.9rem;
        }
        .trust-list li {
          display: flex;
          align-items: flex-start;
          gap: 0.65rem;
          color: #fff;
          font-size: 0.9rem;
          line-height: 1.45;
        }
        .trust-badge-box {
          text-align: center;
          background: rgba(255, 255, 255, 0.05);
          padding: 2.25rem 1.75rem;
          border-radius: var(--radius-xl);
          border: 1px solid rgba(229, 169, 60, 0.2);
        }
        .security-sub-badges {
          display: flex;
          justify-content: center;
          gap: 0.75rem;
          margin-top: 1.25rem;
          flex-wrap: wrap;
        }
        .security-sub-badges span {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--color-gold-300);
          background: rgba(0, 0, 0, 0.2);
          padding: 0.25rem 0.6rem;
          border-radius: var(--radius-full);
        }

        /* 9. FAQ Accordion */
        .faq-accordion {
          max-width: 800px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .faq-item {
          padding: 0;
          border: 1px solid var(--color-slate-200);
          transition: border-color var(--transition-fast);
          overflow: hidden;
        }
        .faq-item.faq-open {
          border-color: var(--color-gold-500);
        }
        .faq-question-btn {
          width: 100%;
          text-align: left;
          background: none;
          padding: 1.15rem 1.25rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          color: var(--color-emerald-950);
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
        }
        .faq-question-btn:hover {
          background: var(--color-slate-50);
        }
        .faq-chevron {
          color: var(--color-emerald-700);
          display: flex;
          align-items: center;
        }
        .faq-answer {
          padding: 0 1.25rem 1.25rem;
          border-top: 1px dashed var(--color-slate-200);
          padding-top: 0.85rem;
        }
        .faq-answer p {
          font-size: 0.88rem;
          color: var(--color-slate-700);
          line-height: 1.6;
        }

        /* 10. Feed Posts */
        .posts-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        /* 11. Closing CTA Banner */
        .cta-box {
          text-align: center;
          padding: 3.5rem 1.5rem;
        }

        /* Responsive Breakpoints */
        @media (max-width: 900px) {
          .roadmap-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .hero-stats {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .calc-grid,
          .steps-grid,
          .posts-grid,
          .roles-grid,
          .trust-grid {
            grid-template-columns: 1fr;
          }
          .hero-stats {
            grid-template-columns: 1fr 1fr;
          }
          .roadmap-grid {
            grid-template-columns: 1fr;
          }
          .hero-title {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  );
};
