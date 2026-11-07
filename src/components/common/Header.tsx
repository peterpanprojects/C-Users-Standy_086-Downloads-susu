import React, { useState } from 'react';
import { useSusu } from '../../context/SusuContext';
import { NotificationDropdown } from './NotificationDropdown';
import {
  ShieldCheck,
  HelpCircle,
  MessageSquare,
  Home,
  LogOut,
  Menu,
  X,
  Key
} from 'lucide-react';

interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  isDashboardMode?: boolean;
  onToggleMobileSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPath,
  onNavigate,
  isDashboardMode = false,
  onToggleMobileSidebar
}) => {
  const {
    currentUserRole,
    setRole,
    group
  } = useSusu();
  const [mobileVisitorMenuOpen, setMobileVisitorMenuOpen] = useState(false);

  const handleLogout = () => {
    setRole('visitor');
    onNavigate('/');
  };


  const navLinkClass = (path: string) =>
    `nav-link ${currentPath === path ? 'active' : ''}`;

  return (
    <header className="header-wrapper">
      {/* DASHBOARD MODE: Show compact mobile bar only on small screens */}
      {isDashboardMode ? (
        <div className="mobile-dashboard-header">

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              className="mobile-sidebar-toggle-btn"
              onClick={onToggleMobileSidebar}
              aria-label="Open Navigation Menu"
            >
              <Menu size={22} />
            </button>
            <div className="mobile-dashboard-brand" onClick={() => onNavigate(currentUserRole === 'agent' ? '/agent/dashboard' : '/')}>
              <ShieldCheck size={22} color="#E5A93C" />
              <span style={{ fontWeight: 800, color: 'var(--color-emerald-950)', fontSize: '1rem' }}>
                SUSU
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <NotificationDropdown align="right" />
            <span className="user-group-name" style={{ fontSize: '0.78rem' }}>
              {currentUserRole === 'super_admin' ? 'Super Admin' : (group?.name || 'Agent')}
            </span>
            <button
              className="btn-logout"
              title="Sign Out"
              onClick={handleLogout}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      ) : (
        /* VISITOR MODE: Full marketing navigation bar */
        <div className="main-navbar">
          <div className="navbar-container">
            <div className="nav-brand" onClick={() => onNavigate('/')} style={{ cursor: 'pointer' }}>
              <div className="brand-logo">
                <ShieldCheck size={28} color="#E5A93C" />
              </div>
              <div className="brand-text">
                <span className="brand-name">SUSU</span>
                <span className="brand-tagline">Savings Vault</span>
              </div>
            </div>

            {/* Desktop Visitor Navigation Links */}
            <nav className="desktop-nav">
              <button className={navLinkClass('/')} onClick={() => onNavigate('/')}>
                <Home size={16} /> Home
              </button>
              <button
                className={navLinkClass('/how-it-works')}
                onClick={() => onNavigate('/how-it-works')}
              >
                <HelpCircle size={16} /> How It Works
              </button>
              <button className={navLinkClass('/feed')} onClick={() => onNavigate('/feed')}>
                <MessageSquare size={16} /> Feed
              </button>
              <button className={navLinkClass('/contact')} onClick={() => onNavigate('/contact')}>
                Contact
              </button>
            </nav>

            {/* Visitor Action CTAs */}
            <div className="nav-actions">
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <NotificationDropdown align="right" />
                <button
                  className="btn-outline"
                  style={{
                    padding: '0.45rem 0.85rem',
                    fontSize: '0.82rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                  onClick={() => onNavigate('/invite')}
                  title="Enter Member Invite Token"
                >
                  <Key size={14} /> Member Code / Token
                </button>
                <button
                  className="btn-outline"
                  style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}
                  onClick={() => onNavigate('/login')}
                  title="Agent & Admin Sign In"
                >
                  Sign In
                </button>
                <button
                  className="btn-gold"
                  style={{ padding: '0.45rem 0.95rem', fontSize: '0.82rem' }}
                  onClick={() => onNavigate('/signup')}
                >
                  Start Group
                </button>
              </div>

              <button
                className="mobile-toggle"
                onClick={() => setMobileVisitorMenuOpen(!mobileVisitorMenuOpen)}
                aria-label="Toggle Menu"
              >
                {mobileVisitorMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Visitor Mobile Menu Dropdown */}
          {mobileVisitorMenuOpen && (
            <div className="mobile-menu-dropdown">
              <button
                className={navLinkClass('/')}
                onClick={() => {
                  onNavigate('/');
                  setMobileVisitorMenuOpen(false);
                }}
              >
                <Home size={16} /> Home
              </button>
              <button
                className={navLinkClass('/how-it-works')}
                onClick={() => {
                  onNavigate('/how-it-works');
                  setMobileVisitorMenuOpen(false);
                }}
              >
                <HelpCircle size={16} /> How It Works
              </button>
              <button
                className={navLinkClass('/feed')}
                onClick={() => {
                  onNavigate('/feed');
                  setMobileVisitorMenuOpen(false);
                }}
              >
                <MessageSquare size={16} /> Feed
              </button>
              <button
                className={navLinkClass('/contact')}
                onClick={() => {
                  onNavigate('/contact');
                  setMobileVisitorMenuOpen(false);
                }}
              >
                Contact
              </button>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                <button
                  className="btn-outline"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                  onClick={() => {
                    onNavigate('/invite');
                    setMobileVisitorMenuOpen(false);
                  }}
                >
                  <Key size={15} /> Member Code / Invite Token
                </button>
                <button
                  className="btn-outline"
                  onClick={() => {
                    onNavigate('/login');
                    setMobileVisitorMenuOpen(false);
                  }}
                >
                  Sign In
                </button>
                <button
                  className="btn-gold"
                  onClick={() => {
                    onNavigate('/signup');
                    setMobileVisitorMenuOpen(false);
                  }}
                >
                  Start Group as Agent
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
