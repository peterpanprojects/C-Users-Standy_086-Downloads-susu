import React, { useState, useEffect } from 'react';
import { SusuProvider, useSusu } from './context/SusuContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { Footer } from './components/common/Footer';
import { NotificationDropdown } from './components/common/NotificationDropdown';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { HowItWorksPage } from './pages/public/HowItWorksPage';
import { PublicFeedPage } from './pages/public/PublicFeedPage';
import { ContactPage } from './pages/public/ContactPage';
import { LoginPage } from './pages/public/LoginPage';
import { SignupPage } from './pages/public/SignupPage';
import { InviteAcceptPage } from './pages/public/InviteAcceptPage';
import { MemberPortalPage } from './pages/public/MemberPortalPage';

// Agent Pages
import { AgentDashboardPage } from './pages/agent/AgentDashboardPage';
import { AgentGroupsPage } from './pages/agent/AgentGroupsPage';
import { MembersListPage } from './pages/agent/MembersListPage';
import { MemberDetailPage } from './pages/agent/MemberDetailPage';
import { RotationCalendarPage } from './pages/agent/RotationCalendarPage';
import { PaymentsLedgerPage } from './pages/agent/PaymentsLedgerPage';
import { ReportsPage } from './pages/agent/ReportsPage';
import { GroupSettingsPage } from './pages/agent/GroupSettingsPage';
import { AgentProfilePage } from './pages/agent/AgentProfilePage';
import { AgentPaymentConfigPage } from './pages/agent/AgentPaymentConfigPage';
import { AgentKycRegistrationPage } from './pages/agent/AgentKycRegistrationPage';
import { AgentActivationPage } from './pages/agent/AgentActivationPage';
import { AgentLockedPage } from './pages/agent/AgentLockedPage';
import { AgentPendingApprovalPage } from './pages/agent/AgentPendingApprovalPage';
import { LiveSupportPage } from './pages/agent/LiveSupportPage';
import { LiveChatWidget } from './components/common/LiveChatWidget';



// Member Pages
import { MemberDashboardPage } from './pages/member/MemberDashboardPage';
import { MemberPayPage } from './pages/member/MemberPayPage';
import { MemberHistoryPage } from './pages/member/MemberHistoryPage';
import { MemberPayoutPage } from './pages/member/MemberPayoutPage';
import { MemberProfilePage } from './pages/member/MemberProfilePage';

// Super Admin / Developer Page
import { DeveloperAdminPage } from './pages/admin/DeveloperAdminPage';

import './styles/global.css';

const AppContent: React.FC = () => {
  const { currentUserRole, setRole, agentAccount, group } = useSusu();

  const [currentPath, setCurrentPath] = useState<string>(() => {
    const path = window.location.pathname;
    return path && path !== '/' ? path : '/';
  });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  useEffect(() => {
    if (currentPath.startsWith('/admin') && currentUserRole !== 'super_admin') {
      setRole('super_admin');
    } else if (currentPath.startsWith('/member/') && currentUserRole !== 'member') {
      setRole('member');
    }
  }, [currentPath, currentUserRole, setRole]);

  useEffect(() => {
    const onPopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setMobileSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * Agent gate:
   * - Not verified (adminApprovalStatus !== 'verified') → block privileged routes
   * - After payment (isActivated) but not yet approved → show pending approval
   * - Before payment → show locked page (with KYC/activation flow)
   */
  const agentIsFullyVerified =
    agentAccount.isKycSubmitted &&
    agentAccount.isActivated &&
    agentAccount.adminApprovalStatus === 'verified';

  const agentPendingApproval =
    agentAccount.isKycSubmitted &&
    agentAccount.isActivated &&
    (agentAccount.adminApprovalStatus === 'pending_admin_approval' ||
      agentAccount.adminApprovalStatus === 'rejected');

  const AGENT_PRIVILEGED_ROUTES = [
    '/agent/dashboard',
    '/agent/profile',
    '/agent/groups',
    '/agent/members',
    '/agent/calendar',
    '/agent/payments',
    '/agent/reports',
    '/agent/settings',
    '/agent/payment-config',
    '/agent/live-support'
  ];


  // Render main page content based on currentPath
  const renderView = () => {
    // Dynamic member detail route: /agent/members/:id
    if (currentPath.startsWith('/agent/members/')) {
      if (!agentIsFullyVerified) {
        return agentPendingApproval
          ? <AgentPendingApprovalPage onNavigate={handleNavigate} />
          : <AgentLockedPage onNavigate={handleNavigate} />;
      }
      const memberId = currentPath.replace('/agent/members/', '');
      return <MemberDetailPage memberId={memberId} onNavigate={handleNavigate} />;
    }

    // Dynamic invite token route: /invite/:token
    if (currentPath.startsWith('/invite/')) {
      const token = currentPath.replace('/invite/', '');
      return <InviteAcceptPage token={token} onNavigate={handleNavigate} />;
    }

    // Intercept privileged agent routes
    if (currentUserRole === 'agent' && AGENT_PRIVILEGED_ROUTES.includes(currentPath)) {
      if (!agentIsFullyVerified) {
        if (agentPendingApproval) {
          return <AgentPendingApprovalPage onNavigate={handleNavigate} />;
        }
        return <AgentLockedPage onNavigate={handleNavigate} />;
      }
    }

    switch (currentPath) {
      // Public Views
      case '/':
        return <LandingPage onNavigate={handleNavigate} />;
      case '/how-it-works':
        return <HowItWorksPage onNavigate={handleNavigate} />;
      case '/feed':
        return <PublicFeedPage />;
      case '/contact':
        return <ContactPage />;
      case '/login':
      case '/agent/login':
        return <LoginPage onNavigate={handleNavigate} />;
      case '/invite':
        return <MemberPortalPage initialTab="token" onNavigate={handleNavigate} />;
      case '/member/login':
        return <MemberPortalPage initialTab="code" onNavigate={handleNavigate} />;
      case '/signup':
        return <SignupPage onNavigate={handleNavigate} />;

      // Super Admin Protected Views
      case '/admin':
      case '/admin/platform':
      case '/admin/developer':
        return <DeveloperAdminPage onNavigate={handleNavigate} />;
      case '/admin/agents':
        return <DeveloperAdminPage initialTab="agents" onNavigate={handleNavigate} />;
      case '/admin/groups':
        return <DeveloperAdminPage initialTab="groups" onNavigate={handleNavigate} />;
      case '/admin/payment-config':
        return <DeveloperAdminPage initialTab="payments" onNavigate={handleNavigate} />;

      // Agent Protected Views
      case '/agent/dashboard':
        return <AgentDashboardPage onNavigate={handleNavigate} />;
      case '/agent/groups':
        return <AgentGroupsPage onNavigate={handleNavigate} />;
      case '/agent/members':
        return <MembersListPage onNavigate={handleNavigate} />;
      case '/agent/calendar':
        return <RotationCalendarPage />;
      case '/agent/payments':
        return <PaymentsLedgerPage />;
      case '/agent/reports':
        return <ReportsPage />;
      case '/agent/settings':
        return <GroupSettingsPage onNavigate={handleNavigate} />;
      case '/agent/profile':
        return <AgentProfilePage onNavigate={handleNavigate} />;
      case '/agent/payment-config':
        return <AgentPaymentConfigPage onNavigate={handleNavigate} />;
      case '/agent/live-support':
      case '/admin/live-support':
        return <LiveSupportPage onNavigate={handleNavigate} />;
      case '/agent/register-kyc':
        // Once registered, agent should not see KYC again
        if (agentAccount.isKycSubmitted) {
          return <AgentDashboardPage onNavigate={handleNavigate} />;
        }
        return <AgentKycRegistrationPage onNavigate={handleNavigate} />;
      case '/agent/activate':
        return <AgentActivationPage onNavigate={handleNavigate} />;
      case '/agent/pending-approval':
        return <AgentPendingApprovalPage onNavigate={handleNavigate} />;

      // Member Protected Views
      case '/member/dashboard':
        return <MemberDashboardPage onNavigate={handleNavigate} />;
      case '/member/pay':
        return <MemberPayPage />;
      case '/member/history':
        return <MemberHistoryPage />;
      case '/member/payout':
        return <MemberPayoutPage />;
      case '/member/profile':
        return <MemberProfilePage />;

      default:
        return <LandingPage onNavigate={handleNavigate} />;
    }
  };

  // Standalone Layout (No Navigation Bar) for Agent Sign Up
  if (currentPath === '/signup') {
    return (
      <div
        className="app-container auth-page-container"
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--color-slate-50)'
        }}
      >
        <main
          className="main-content"
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem 1rem'
          }}
        >
          {renderView()}
        </main>
        <footer
          style={{
            textAlign: 'center',
            padding: '1.5rem',
            color: '#94a3b8',
            fontSize: '0.82rem'
          }}
        >
          © {new Date().getFullYear()} Susu Savings Vault. Secured by Bank-Grade 256-Bit SSL Encryption.
        </footer>
        <LiveChatWidget />
      </div>
    );
  }

  const isDashboardRoute =
    currentPath.startsWith('/agent/') ||
    currentPath.startsWith('/member/') ||
    currentPath.startsWith('/admin') ||
    currentPath === '/admin';

  const isDashboardMode =
    (currentUserRole !== 'visitor' || currentPath.startsWith('/admin')) && isDashboardRoute;

  if (isDashboardMode) {
    return (
      <div className="app-container dashboard-app-layout">
        {/* Top Role Switcher & Mobile Topbar */}
        <Header
          currentPath={currentPath}
          onNavigate={handleNavigate}
          isDashboardMode={true}
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        />

        {/* Dashboard Layout: Left Sidebar + Main Content */}
        <div className="dashboard-body-container">
          <Sidebar
            currentPath={currentPath}
            onNavigate={handleNavigate}
            mobileOpen={mobileSidebarOpen}
            onCloseMobile={() => setMobileSidebarOpen(false)}
          />

          <div className="dashboard-main-area">
            {/* Desktop Dashboard Topbar with Notification Dropdown */}
            <div className="dashboard-topbar">
              <div className="dashboard-topbar-left">
                <span className="dashboard-portal-badge">
                  {currentUserRole === 'super_admin'
                    ? 'Super Admin Portal'
                    : currentUserRole === 'agent'
                    ? 'Agent Workspace'
                    : 'Member Portal'}
                </span>
                {group?.name && (
                  <span className="dashboard-circle-name">
                    • {group.name}
                  </span>
                )}
              </div>
              <div className="dashboard-topbar-right">
                <NotificationDropdown align="right" />
              </div>
            </div>

            <main className="dashboard-content">{renderView()}</main>
            <Footer onNavigate={handleNavigate} />
          </div>
        </div>

        {/* Floating Rezolv Live Chat Widget */}
        <LiveChatWidget />
      </div>
    );
  }

  // Visitor / Public Layout
  return (
    <div className="app-container">
      <Header currentPath={currentPath} onNavigate={handleNavigate} isDashboardMode={false} />
      <main className="main-content">{renderView()}</main>
      <Footer onNavigate={handleNavigate} />

      {/* Floating Rezolv Live Chat Widget */}
      <LiveChatWidget />
    </div>
  );
};


export const App: React.FC = () => {
  return (
    <SusuProvider>
      <AppContent />
    </SusuProvider>
  );
};

export default App;
