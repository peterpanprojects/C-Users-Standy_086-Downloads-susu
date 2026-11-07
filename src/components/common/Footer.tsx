import React from 'react';
import { ShieldCheck, Lock, CreditCard, Award } from 'lucide-react';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="app-footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="brand-logo" style={{ display: 'inline-flex', marginBottom: '0.75rem' }}>
              <ShieldCheck size={32} color="#E5A93C" />
            </div>
            <h3>SUSU Savings Vault</h3>
            <p>
              Empowering communities with structured, transparent, and secure Rotating Savings & Credit Associations (ROSCA).
            </p>
            <div className="trust-badges">
              <span className="trust-item"><Lock size={14} /> 256-Bit SSL Encrypted</span>
              <span className="trust-item"><CreditCard size={14} /> Paystack Verified</span>
              <span className="trust-item"><Award size={14} /> ISO 27001 Security</span>
            </div>
          </div>

          <div className="footer-links-group">
            <h4>Platform</h4>
            <button onClick={() => onNavigate('/')}>Landing Page</button>
            <button onClick={() => onNavigate('/how-it-works')}>How It Works</button>
            <button onClick={() => onNavigate('/feed')}>Public Feed & Transparency</button>
            <button onClick={() => onNavigate('/contact')}>Contact & FAQs</button>
          </div>

          <div className="footer-links-group">
            <h4>Get Started</h4>
            <button onClick={() => onNavigate('/signup')}>Create Susu Group (Agent)</button>
            <button onClick={() => onNavigate('/invite')}>I Have an Invite Token</button>
            <button onClick={() => onNavigate('/invite')}>Member Portal Login</button>
            <button onClick={() => onNavigate('/login')}>Sign In</button>
          </div>

          <div className="footer-links-group">
            <h4>Supported Currencies</h4>
            <p className="currency-pills">
              <span>GH₵ (GHS)</span>
              <span>₦ (NGN)</span>
              <span>$ (USD)</span>
              <span>£ (GBP)</span>
            </p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Susu Savings Management Platform. All rights reserved.</p>
          <p className="footer-disclaimer">
            Fund contributions are collected daily Monday through Sunday via Paystack or direct agent cash overrides. Payouts are distributed weekly according to the pre-scheduled rotation calendar.
          </p>
        </div>
      </div>

      <style>{`
        .app-footer {
          background: var(--color-emerald-950);
          color: var(--color-slate-200);
          padding: 3rem 1.5rem 1.5rem;
          margin-top: 4rem;
          border-top: 3px solid var(--color-gold-500);
        }
        .footer-container {
          max-width: 1280px;
          margin: 0 auto;
        }
        .footer-top {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 2.5rem;
          padding-bottom: 2.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        @media (max-width: 900px) {
          .footer-top {
            grid-template-columns: 1fr 1fr;
          }
        }
        @media (max-width: 600px) {
          .footer-top {
            grid-template-columns: 1fr;
          }
        }
        .footer-brand h3 {
          color: #fff;
          font-size: 1.2rem;
          margin-bottom: 0.5rem;
        }
        .footer-brand p {
          color: var(--color-slate-400);
          font-size: 0.85rem;
          margin-bottom: 1.25rem;
          line-height: 1.6;
        }
        .trust-badges {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .trust-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: var(--color-gold-300);
          font-weight: 600;
        }
        .footer-links-group h4 {
          color: var(--color-gold-400);
          font-size: 0.95rem;
          margin-bottom: 1rem;
          font-family: var(--font-heading);
        }
        .footer-links-group button {
          background: transparent;
          color: var(--color-slate-300);
          display: block;
          margin-bottom: 0.6rem;
          font-size: 0.85rem;
          text-align: left;
          padding: 0;
        }
        .footer-links-group button:hover {
          color: var(--color-gold-300);
          text-decoration: underline;
        }
        .currency-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
        }
        .currency-pills span {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
          padding: 0.25rem 0.6rem;
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          font-weight: 600;
        }
        .footer-bottom {
          padding-top: 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          text-align: center;
          font-size: 0.8rem;
          color: var(--color-slate-400);
        }
        .footer-disclaimer {
          max-width: 800px;
          font-size: 0.75rem;
          opacity: 0.75;
        }
      `}</style>
    </footer>
  );
};
