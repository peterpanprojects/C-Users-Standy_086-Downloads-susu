import React, { useState } from 'react';
import { useSusu } from '../../context/SusuContext';
import {
  ShieldCheck,
  Home,
  Users,
  Calendar,
  CreditCard,
  Sliders,
  BarChart3,
  Settings,
  LogOut,
  User as UserIcon,
  Headphones,
  UserCheck,
  Layers,
  Plus,
  X
} from 'lucide-react';
import { CreateGroupModal } from '../agent/CreateGroupModal';


interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPath,
  onNavigate,
  mobileOpen = false,
  onCloseMobile
}) => {
  const {
    currentUserRole,
    setRole,
    group,
    groups,
    myGroups,
    agents,
    agentAccount,
    activeUser
  } = useSusu();

  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);

  const handleNavClick = (path: string) => {
    onNavigate(path);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const handleLogout = () => {
    setRole('visitor');
    onNavigate('/');
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const navItemClass = (path: string) =>
    `sidebar-nav-item ${currentPath === path ? 'active' : ''}`;

  const userDisplayName =
    currentUserRole === 'super_admin'
      ? (activeUser?.name || 'Super Administrator')
      : currentUserRole === 'member'
      ? (activeUser?.name || 'Member')
      : (agentAccount.kycData?.fullName ||
         `${agentAccount.firstName} ${agentAccount.surname}`.trim() ||
         activeUser.name ||
         'Agent Organizer');

  const displayGroupTitle =
    currentUserRole === 'super_admin'
      ? 'Super Admin Panel'
      : currentUserRole === 'member'
      ? (group?.name || 'Susu Circle')
      : (group?.name || (myGroups.length === 0 ? 'No Group Created' : 'My Susu Group'));

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onCloseMobile}
          aria-label="Close sidebar"
        />
      )}

      <aside className={`app-sidebar ${mobileOpen ? 'open' : ''}`}>
        {/* Brand Header */}
        <div className="sidebar-header">
          <div
            className="sidebar-brand"
            onClick={() => handleNavClick(currentUserRole === 'agent' ? '/agent/dashboard' : '/')}
            style={{ cursor: 'pointer' }}
          >
            <div className="sidebar-brand-logo">
              <ShieldCheck size={28} color="#E5A93C" />
            </div>
            <div className="sidebar-brand-text">
              <span className="sidebar-brand-title">SUSU</span>
              <span className="sidebar-brand-subtitle">SAVINGS VAULT</span>
            </div>
          </div>

          {/* Close button for mobile */}
          <button
            className="sidebar-mobile-close"
            onClick={onCloseMobile}
            aria-label="Close Menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Group Title */}
        <div className="sidebar-nav-label">
          {currentUserRole === 'agent' && 'AGENT MANAGEMENT'}
          {currentUserRole === 'super_admin' && 'SUPER ADMIN PANEL'}
          {currentUserRole === 'member' && 'MEMBER PORTAL'}
        </div>

        {/* Navigation Menu List */}
        <nav className="sidebar-nav-list">
          {currentUserRole === 'agent' && (
            <>
              <button
                className={navItemClass('/agent/dashboard')}
                onClick={() => handleNavClick('/agent/dashboard')}
              >
                <Home size={18} className="sidebar-icon" />
                <span>Dashboard</span>
              </button>
              <button
                className={navItemClass('/agent/groups')}
                onClick={() => handleNavClick('/agent/groups')}
              >
                <Layers size={18} className="sidebar-icon" />
                <span>My Groups ({myGroups.length})</span>
              </button>
              <button
                className={navItemClass('/agent/members')}
                onClick={() => handleNavClick('/agent/members')}
              >
                <Users size={18} className="sidebar-icon" />
                <span>Members</span>
              </button>
              <button
                className={navItemClass('/agent/calendar')}
                onClick={() => handleNavClick('/agent/calendar')}
              >
                <Calendar size={18} className="sidebar-icon" />
                <span>Rotation Calendar</span>
              </button>
              <button
                className={navItemClass('/agent/payments')}
                onClick={() => handleNavClick('/agent/payments')}
              >
                <CreditCard size={18} className="sidebar-icon" />
                <span>Payments</span>
              </button>
              <button
                className={navItemClass('/agent/payment-config')}
                onClick={() => handleNavClick('/agent/payment-config')}
              >
                <Sliders size={18} className="sidebar-icon" />
                <span>Payment Config</span>
              </button>
              <button
                className={navItemClass('/agent/reports')}
                onClick={() => handleNavClick('/agent/reports')}
              >
                <BarChart3 size={18} className="sidebar-icon" />
                <span>Reports</span>
              </button>
              <button
                className={navItemClass('/agent/live-support')}
                onClick={() => handleNavClick('/agent/live-support')}
              >
                <Headphones size={18} className="sidebar-icon" />
                <span>Live Support</span>
              </button>
              <button
                className={navItemClass('/agent/settings')}
                onClick={() => handleNavClick('/agent/settings')}
              >
                <Settings size={18} className="sidebar-icon" />
                <span>Settings</span>
              </button>
              <button
                className={navItemClass('/agent/profile')}
                onClick={() => handleNavClick('/agent/profile')}
              >
                <UserCheck size={18} className="sidebar-icon" />
                <span>Agent Profile</span>
              </button>

              {/* Quick Action: Create New Group */}
              <div style={{ padding: '0.4rem 0.15rem 0.5rem' }}>
                <button
                  type="button"
                  className="sidebar-create-group-btn"
                  onClick={() => setIsCreateGroupOpen(true)}
                  id="sidebar-create-group-btn"
                  title="Create a new Susu savings circle"
                >
                  <Plus size={16} /> + Create Group
                </button>
              </div>
            </>
          )}

          {currentUserRole === 'super_admin' && (
            <>
              <button
                className={navItemClass('/admin/developer')}
                onClick={() => handleNavClick('/admin/developer')}
              >
                <ShieldCheck size={18} className="sidebar-icon" />
                <span>Platform Admin</span>
              </button>
              <button
                className={navItemClass('/admin/agents')}
                onClick={() => handleNavClick('/admin/agents')}
              >
                <UserCheck size={18} className="sidebar-icon" />
                <span>All Agents ({agents.length})</span>
              </button>
              <button
                className={navItemClass('/admin/groups')}
                onClick={() => handleNavClick('/admin/groups')}
              >
                <Layers size={18} className="sidebar-icon" />
                <span>Susu Groups</span>
              </button>
              <button
                className={navItemClass('/agent/members')}
                onClick={() => handleNavClick('/agent/members')}
              >
                <Users size={18} className="sidebar-icon" />
                <span>All Members</span>
              </button>
              <button
                className={navItemClass('/admin/payment-config')}
                onClick={() => handleNavClick('/admin/payment-config')}
              >
                <Sliders size={18} className="sidebar-icon" />
                <span>Payment Engine</span>
              </button>
              <button
                className={navItemClass('/agent/live-support')}
                onClick={() => handleNavClick('/agent/live-support')}
              >
                <Headphones size={18} className="sidebar-icon" />
                <span>Live Support</span>
              </button>
              <button
                className={navItemClass('/agent/dashboard')}
                onClick={() => handleNavClick('/agent/dashboard')}
              >
                <Home size={18} className="sidebar-icon" />
                <span>Agent Dashboard</span>
              </button>
              <button
                className={navItemClass('/agent/payments')}
                onClick={() => handleNavClick('/agent/payments')}
              >
                <CreditCard size={18} className="sidebar-icon" />
                <span>Payments Ledger</span>
              </button>
            </>
          )}

          {currentUserRole === 'member' && (
            <>
              <button
                className={navItemClass('/member/dashboard')}
                onClick={() => handleNavClick('/member/dashboard')}
              >
                <Home size={18} className="sidebar-icon" />
                <span>Dashboard</span>
              </button>
              <button
                className={navItemClass('/member/pay')}
                onClick={() => handleNavClick('/member/pay')}
              >
                <CreditCard size={18} className="sidebar-icon" />
                <span>Pay Today</span>
              </button>
              <button
                className={navItemClass('/member/history')}
                onClick={() => handleNavClick('/member/history')}
              >
                <Calendar size={18} className="sidebar-icon" />
                <span>History</span>
              </button>
              <button
                className={navItemClass('/member/payout')}
                onClick={() => handleNavClick('/member/payout')}
              >
                <Calendar size={18} className="sidebar-icon" />
                <span>Rotation Slots</span>
              </button>
              <button
                className={navItemClass('/member/profile')}
                onClick={() => handleNavClick('/member/profile')}
              >
                <UserIcon size={18} className="sidebar-icon" />
                <span>Profile</span>
              </button>
            </>
          )}
        </nav>

        {/* Sidebar Footer: User / Group & Logout */}
        <div className="sidebar-footer">
          <div className="sidebar-user-card">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                flex: 1,
                minWidth: 0,
                cursor: currentUserRole === 'agent' || currentUserRole === 'member' ? 'pointer' : 'default'
              }}
              onClick={() => {
                if (currentUserRole === 'agent') handleNavClick('/agent/profile');
                else if (currentUserRole === 'member') handleNavClick('/member/profile');
              }}
              title={currentUserRole === 'agent' || currentUserRole === 'member' ? 'Click to view profile & photo' : undefined}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  flexShrink: 0,
                  background: 'var(--color-emerald-950)',
                  border: '1.5px solid rgba(229, 169, 60, 0.45)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)'
                }}
              >
                {activeUser?.avatarUrl ? (
                  <img src={activeUser.avatarUrl} alt={userDisplayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-gold-400)' }}>
                    {userDisplayName.charAt(0)}
                  </span>
                )}
              </div>
              <div className="sidebar-user-info" style={{ minWidth: 0, flex: 1 }}>
                <span className="sidebar-group-title">{displayGroupTitle}</span>
                <span className="sidebar-agent-name">{userDisplayName}</span>
                {currentUserRole === 'super_admin' && (
                  <span
                    className="sidebar-status-pill"
                    style={{
                      background: 'rgba(229, 169, 60, 0.15)',
                      color: '#d97706',
                      borderColor: 'rgba(229, 169, 60, 0.4)'
                    }}
                  >
                    <span className="status-dot" style={{ background: '#d97706' }}></span>
                    Root Super Admin
                  </span>
                )}
                {currentUserRole === 'agent' && (
                  <span className="sidebar-status-pill">
                    <span className="status-dot"></span>
                    {agentAccount.adminApprovalStatus === 'verified' ? 'Active License' : 'Agent Portal'}
                  </span>
                )}
                {currentUserRole === 'member' && (
                  <span
                    className="sidebar-status-pill"
                    style={{
                      background: 'rgba(14, 165, 233, 0.15)',
                      color: '#0284c7',
                      borderColor: 'rgba(14, 165, 233, 0.4)'
                    }}
                  >
                    <span className="status-dot" style={{ background: '#0284c7' }}></span>
                    Circle Member
                  </span>
                )}
              </div>
            </div>
            <button
              className="sidebar-logout-btn"
              onClick={handleLogout}
              title="Exit to Visitor Mode"
              aria-label="Logout"
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>
      <CreateGroupModal
        isOpen={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
        onSuccess={() => {
          handleNavClick('/agent/dashboard');
        }}
      />
    </>
  );
};
