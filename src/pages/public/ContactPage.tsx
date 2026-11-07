import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const faqs = [
    {
      q: 'What happens if a member misses a daily payment?',
      a: 'Daily payments run Monday to Sunday. If a payment is unpaid by 23:59 GMT each day, automated SMS/email reminders are sent. The Agent can also contact the member or perform a cash override if paid offline.'
    },
    {
      q: 'Can the payout rotation calendar be edited once a cycle begins?',
      a: 'Past and current active payout weeks are locked to protect recipient guarantees. Only future upcoming weeks can be reordered by the Agent.'
    },
    {
      q: 'Are funds held securely?',
      a: 'Yes, all digital transactions process directly via Paystack 256-bit SSL encrypted channels. Payouts are transferred automatically to the designated recipient on their scheduled week.'
    },
    {
      q: 'Can members pay a full week at once?',
      a: 'Yes! Members can choose to pay the single daily contribution or pay all 7 days of the active week in a single Paystack transaction.'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="contact-page">
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.4rem', marginBottom: '0.5rem' }}>Contact & Frequently Asked Questions</h1>
        <p style={{ color: 'var(--color-slate-600)' }}>
          Have questions about setting up a Susu group or Paystack payments? We're here to help.
        </p>
      </div>

      <div className="contact-grid">
        {/* Contact Form */}
        <div className="card">
          <h2 style={{ fontSize: '1.4rem', marginBottom: '1.25rem' }}>Send Us a Message</h2>
          {!submitted ? (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Your Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Message</label>
                <textarea
                  className="form-textarea"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                <Send size={16} /> Send Inquiry
              </button>
            </form>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <h3 style={{ color: 'var(--color-emerald-700)', marginBottom: '0.5rem' }}>Thank You!</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-slate-600)' }}>
                Your message has been received. Our team will get back to you shortly.
              </p>
            </div>
          )}
        </div>

        {/* FAQs Accordion */}
        <div>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <HelpCircle color="var(--color-gold-600)" /> Common Questions
          </h2>
          <div className="faqs-list">
            {faqs.map((faq, idx) => (
              <div key={idx} className="card faq-card">
                <div
                  className="faq-question"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
                {openFaq === idx && <p className="faq-answer">{faq.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }
        .faqs-list {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }
        .faq-card {
          padding: 1rem 1.25rem;
          cursor: pointer;
        }
        .faq-question {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: 700;
          font-family: var(--font-heading);
          color: var(--color-emerald-950);
          font-size: 0.95rem;
        }
        .faq-answer {
          margin-top: 0.75rem;
          font-size: 0.85rem;
          color: var(--color-slate-600);
          line-height: 1.6;
          border-top: 1px solid var(--color-slate-200);
          padding-top: 0.75rem;
        }
        @media (max-width: 768px) {
          .contact-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};
