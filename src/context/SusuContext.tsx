import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  AgentAccount,
  AgentKycData,
  AgentPaymentConfig,
  AppNotification,
  DailyPayment,
  FeedPost,
  GroupMember,
  LiveSupportConfig,
  PaymentMethod,
  PayoutScheduleWeek,
  SuperAdminPaymentConfig,
  SusuGroup,
  User,
  UserRole
} from '../types/susu';

import { formatDateStr, getNearestMonday } from '../utils/dates';
import { generatePayoutSchedule, reorderRotationQueue, shuffleFutureRotation } from '../utils/rotation';
import { generatePaystackReference } from '../utils/paystack';
import { DatabaseService, mapAgentAccount, supabase } from '../services/db';

// --- FIX 1: Define AgentMessage here ---
export interface AgentMessage {
  id: string;
  agentId: string;
  groupId: string;
  memberId: string; // 'all' or member.id
  senderRole: 'agent';
  message: string;
  createdAt: string;
  read: boolean;
}

export interface PlatformSettings {
  agentActivationFee: number;
  currency: string;
  treasuryAccount: string;
}

export interface SusuContextType {
  isAgentAuthReady: boolean;
  currentUserRole: UserRole;
  activeMemberId: string;
  activeUser: User;
  group: SusuGroup | null;
  groups: SusuGroup[];
  myGroups: SusuGroup[];
  myMembers: GroupMember[];
  myPayments: DailyPayment[];
  activeGroupId: string;
  setActiveGroupId: (groupId: string) => void;
  members: GroupMember[];
  schedule: PayoutScheduleWeek[];
  payments: DailyPayment[];
  posts: FeedPost[];
  agentAccount: AgentAccount;
  agents: AgentAccount[];
  activeAgentId: string;
  setActiveAgentId: (agentId: string) => void;
  createAgent: (data: Partial<AgentAccount>, password: string) => Promise<{ requiresEmailConfirmation: boolean }>;
  signOut: () => Promise<void>;
  refreshAgentAccount: (agentId?: string) => Promise<AgentAccount>;
  refreshAgents: () => Promise<void>;
  agentPaymentConfig: AgentPaymentConfig;
  platformPaymentConfig: SuperAdminPaymentConfig;
  platformSettings: PlatformSettings;
  setRole: (role: UserRole, memberId?: string) => void;
  createGroup: (name: string, fixedDailyAmount: number, cycleStartDate?: string, currency?: string, agentId?: string) => SusuGroup;
  updateGroupSettings: (settings: Partial<SusuGroup>, groupId?: string) => void;
  updateAgentPaymentConfig: (config: Partial<AgentPaymentConfig>) => void;
  updateAgentPaymentConfigForAgent: (agentId: string, config: Partial<AgentPaymentConfig>) => void;
  updatePlatformPaymentConfig: (config: Partial<SuperAdminPaymentConfig>) => void;
  updatePlatformSettings: (settings: Partial<PlatformSettings>) => void;
  registerAgentKyc: (kycData: AgentKycData) => Promise<void>;
  activateAgentAccount: (paymentMethod: string, txRef: string) => Promise<void>;
  approveAgentKyc: (agentId: string, notes?: string) => Promise<void>;
  rejectAgentKyc: (agentId: string, reason: string) => Promise<void>;
  updateAgentAccount: (agentIdOrPartial: string | Partial<AgentAccount>, partial?: Partial<AgentAccount>) => void;
  updateAgentKyc: (agentIdOrKyc: string | Partial<AgentKycData>, kycData?: Partial<AgentKycData>) => void;
  deleteAgent: (agentIdOrOptions?: string | { resetGroup?: boolean }, options?: { resetGroup?: boolean }) => void;
  updateMemberProfile: (memberId: string, partial: Partial<GroupMember>) => void;
  loginWithUniqueCode: (code: string) => boolean;
  inviteMember: (name: string, email: string, phone: string) => Promise<{ token: string; inviteUrl: string; uniqueCode: string }>;
  acceptInviteToken: (token: string, name: string, phone: string) => Promise<boolean>;
  removeMember: (memberId: string) => void;
  deleteGroup: (groupId?: string) => void;
  markCashPayment: (memberId: string, dateStr: string) => void;
  remindMember: (memberId: string) => Promise<void>;
  processPayment: (memberId: string, dates: string[], method: PaymentMethod, paystackRef?: string) => void;
  reorderCalendar: (fromIndex: number, toIndex: number) => void;
  shuffleCalendar: () => void;
  addFeedPost: (title: string, body: string, visibility: 'public' | 'group') => void;
  resetDemoData: () => void;
  resetSystemData: () => void;
  getMemberReliability: (memberId: string) => number;
  selectRotationSlot: (memberId: string, targetWeekNumber: number, roleOverride?: UserRole) => { success: boolean; message: string };
  liveSupportConfig: LiveSupportConfig;
  updateLiveSupportConfig: (config: Partial<LiveSupportConfig>) => void;
  notifications: AppNotification[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  addNotification: (notification: Omit<AppNotification, 'id' | 'read' | 'createdAt'>) => void;
  clearAllNotifications: () => void;
  // FIX 2: Add messaging to type
  agentMessages: AgentMessage[];
  sendAgentMessage: (groupId: string, memberId: string, message: string) => Promise<void>;
}

const INITIAL_SUPER_ADMIN_USER: User = {
  id: 'usr-super-admin',
  name: 'Super Administrator',
  email: import.meta.env.VITE_SUPER_ADMIN_EMAIL || 'admin@susu.platform',
  phone: '',
  role: 'super_admin',
  avatarUrl: ''
};

const INITIAL_AGENT_USER: User = {
  id: 'usr-agent-1',
  name: 'Agent Organizer',
  email: '',
  phone: '',
  role: 'agent',
  avatarUrl: ''
};

export const INITIAL_AGENT_PAYMENT_CONFIG: AgentPaymentConfig = {
  provider: 'paystack',
  paymentMode: 'live',
  gatewayStatus: 'active',
  storeCheckoutType: 'Direct online payments',
  publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '',
  secretKey: import.meta.env.VITE_PAYSTACK_SECRET_KEY || '',
  webhookSecret: '',
  enableDirectStoreProcessing: true,
  minResellerTopUp: 10.0,
  payoutMethod: 'momo',
  momoProvider: 'MTN',
  momoNumber: '',
  momoAccountName: '',
  bankName: '',
  bankAccountNumber: '',
  bankAccountName: '',
  bankBranch: '',
  allowPaystackOnline: true,
  allowCashOverride: true,
  allowBankTransfer: true,
  agentCommissionPercent: 1.5,
  dailyCutoffTime: '22:00',
  gracePeriodHours: 24,
  autoSendSmsReceipts: true,
  requireCashReceiptProof: false,
  paystackSubaccountCode: '',
  customReferencePrefix: 'SUSU-'
};

export const INITIAL_PLATFORM_PAYMENT_CONFIG: SuperAdminPaymentConfig = {
  provider: 'paystack',
  paymentMode: 'live',
  gatewayStatus: 'active',
  storeCheckoutType: 'Direct online payments',
  publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '',
  secretKey: import.meta.env.VITE_PAYSTACK_SECRET_KEY || '',
  enableDirectStoreProcessing: true,
  minResellerTopUp: 10.0,
  activeGateway: 'paystack',
  environment: 'live',
  masterPublicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '',
  masterSecretKey: import.meta.env.VITE_PAYSTACK_SECRET_KEY || '',
  webhookSecret: '',
  webhookUrl: '',
  enableMultiGatewayFallback: false,
  fallbackGateway: 'none',
  globalPlatformFeePercent: 2.0,
  minTransactionFee: 0.50,
  agentActivationFee: 150,
  platformTreasuryAccount: '',
  settlementMode: 'automatic_cron',
  payoutDisbursementMethod: 'paystack_transfers',
  emergencyPayoutFreeze: false,
  supportedCurrencies: ['GH₵', '₦', '$', '£'],
  baseCurrency: 'GH₵',
  maxDailyTransactionLimit: 10000,
  maxPoolKycThreshold: 50000,
  enforceHmacSignatures: true,
  webhookIpWhitelist: ''
};

export const INITIAL_PLATFORM_SETTINGS: PlatformSettings = {
  agentActivationFee: 150,
  currency: 'GH₵',
  treasuryAccount: ''
};

export const EMPTY_AGENT_ACCOUNT: AgentAccount = {
  id: '',
  firstName: '',
  surname: '',
  email: '',
  phone: '',
  isOtpVerified: false,
  isKycSubmitted: false,
  isActivated: false,
  activationFeeAmount: 150,
  adminApprovalStatus: 'rejected',
  licenseNumber: '',
  kycData: undefined
};

export const INITIAL_AGENTS: AgentAccount[] = [];
export const INITIAL_AGENT_ACCOUNT: AgentAccount = EMPTY_AGENT_ACCOUNT;

export const INITIAL_LIVE_SUPPORT_CONFIG: LiveSupportConfig = {
  provider: 'rezolv',
  enabled: true,
  apiKey: import.meta.env.VITE_REZOLV_API_KEY || '',
  welcomeMessage: 'Hello! How can we help you with your Susu account today?',
  autoReply: true
};

export const INITIAL_NOTIFICATIONS: AppNotification[] = [];
const INITIAL_POSTS: FeedPost[] = [];

const SusuContext = createContext<SusuContextType | undefined>(undefined);

export const SusuProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAgentAuthReady, setAgentAuthReady] = useState(!supabase);
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>(() => {
    return 'visitor';
  });
  const [activeMemberId, setActiveMemberIdState] = useState<string>('');

  const setActiveMemberId = (id: string) => {
    setActiveMemberIdState(id);
  };

  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>(() => {
    return INITIAL_PLATFORM_SETTINGS;
  });

  const updatePlatformSettings = (settings: Partial<PlatformSettings>) => {
    setPlatformSettings(prev => {
      const next = {...prev,...settings };
      return next;
    });
    setPlatformPaymentConfig(prev => ({...prev, agentActivationFee: settings.agentActivationFee?? prev.agentActivationFee }));
  };









































// --- NOTIFICATIONS - SUPABASE ONLY (SINGLE SOURCE) ---
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    const fetchNotifs = async () => {
      const role = currentUserRole as string;
      if (role === 'visitor' || !role) { setNotifications([]); return; }
      if (currentUserRole === 'member' && !activeMemberId) return;
      try {
        const { supabase } = await import('../services/db');
        if (!supabase) return;
        let query = supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(100);
        if (currentUserRole === 'member' && activeMemberId) query = query.eq('member_id', activeMemberId);
        const { data, error } = await query;
        if (error) { console.error(error); return; }
        if (data) {
          setNotifications(data.map((d: any) => ({
            id: d.id, memberId: d.member_id, member_id: d.member_id, groupId: d.group_id, group_id: d.group_id,
            title: d.title, description: d.description, message: d.message, type: d.type, read: d.read,
            time: new Date(d.created_at).toLocaleString(), createdAt: new Date(d.created_at).getTime(),
          })) as any);
        }
      } catch (e) { console.warn(e); }
    };
    fetchNotifs();
  }, [currentUserRole, activeMemberId]);

  useEffect(() => {
    const role = currentUserRole as string;
    if (role === 'visitor' || !role) { setNotifications([]); return; }
    if (currentUserRole === 'member' && !activeMemberId) return;
    let channel: any;
    (async () => {
      const { supabase } = await import('../services/db');
      if (!supabase) return;
      const chName = `notifs-${currentUserRole}-${activeMemberId || 'all'}-${Date.now()}`;
      channel = supabase.channel(chName).on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: currentUserRole === 'member' && activeMemberId ? `member_id=eq.${activeMemberId}` : undefined } as any,
        (payload: any) => {
          const d = payload.new;
          const nn = { id: d.id, memberId: d.member_id, member_id: d.member_id, groupId: d.group_id, group_id: d.group_id, title: d.title, description: d.description, message: d.message, type: d.type, read: d.read ?? false, time: new Date(d.created_at).toLocaleString(), createdAt: Date.now() } as any;
          setNotifications((prev) => prev.find((p) => p.id === d.id) ? prev : [nn, ...prev]);
        }).subscribe();
    })();
    return () => { if (channel) import('../services/db').then(m => m.supabase?.removeChannel(channel)); };
  }, [currentUserRole, activeMemberId]);

  const markNotificationAsRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try { const { supabase } = await import('../services/db'); if (supabase) await supabase.from('notifications').update({ read: true }).eq('id', id); } catch {}
  };
  const markAllNotificationsAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      const { supabase } = await import('../services/db');
      if (!supabase) return;
      if (currentUserRole === 'member' && activeMemberId) await supabase.from('notifications').update({ read: true }).eq('member_id', activeMemberId);
    } catch {}
  };
  const addNotification = async (notification: Omit<AppNotification, 'id' | 'read' | 'createdAt'>) => {
    try {
      const { supabase } = await import('../services/db');
      if (!supabase) return;
      await supabase.from('notifications').insert({
        member_id: (notification as any).memberId || (notification as any).member_id || null,
        group_id: (notification as any).groupId || (notification as any).group_id || null,
        title: notification.title, description: (notification as any).description,
        message: (notification as any).message || (notification as any).description,
        type: (notification as any).type || 'info', read: false,
      });
    } catch (e) { console.error(e); }
  };
  const clearAllNotifications = async () => {
    try {
      const { supabase } = await import('../services/db');
      if (supabase && currentUserRole === 'member' && activeMemberId) await supabase.from('notifications').delete().eq('member_id', activeMemberId);
      setNotifications([]);
    } catch {}
  };
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  const [liveSupportConfig, setLiveSupportConfig] = useState<LiveSupportConfig>(() => {
    return INITIAL_LIVE_SUPPORT_CONFIG;
  });
  const updateLiveSupportConfig = (config: Partial<LiveSupportConfig>) => setLiveSupportConfig(prev => ({...prev,...config }));

  // --- Messaging State ---
  const [agentMessages, setAgentMessages] = useState<AgentMessage[]>([]);
  const [agentRegistry, setAgentRegistry] = useState<Record<string, AgentAccount>>({});
  const [agents, setAgents] = useState<AgentAccount[]>([]);
 

  const [currentAgentId, setCurrentAgentIdState] = useState<string>('');
  const [activeAgentId, setActiveAgentIdState] = useState<string>('');

  useEffect(() => {
    if (!supabase) {
      setAgentAuthReady(true);
      return;
    }

    let mounted = true;
    const restoreAgent = async (user: { id: string; email?: string }) => {
      try {
        let { data, error } = await supabase
          .from('agent_accounts')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        if (error) throw error;

        if (!data && user.email) {
          const result = await supabase
            .from('agent_accounts')
            .select('*')
            .eq('email', user.email.toLowerCase())
            .maybeSingle();
          if (result.error) throw result.error;
          data = result.data;
          if (data && data.user_id !== user.id) {
            const { error: linkError } = await supabase
              .from('agent_accounts')
              .update({ user_id: user.id })
              .eq('id', data.id);
            if (linkError) throw linkError;
          }
        }

        if (!data) throw new Error('No agent profile is linked to the signed-in Supabase user.');
        const restoredAgent = mapAgentAccount(data);
        if (mounted) {
          setAgents(prev => [restoredAgent, ...prev.filter(agent => agent.id !== restoredAgent.id)]);
          setActiveAgentIdState(restoredAgent.id);
          setCurrentAgentIdState(restoredAgent.id);
          setCurrentUserRole('agent');
        }
        if (
          (!data.is_kyc_submitted && restoredAgent.isKycSubmitted) ||
          (!data.is_activated && restoredAgent.isActivated)
        ) {
          await DatabaseService.saveAgentAccount(restoredAgent, user.id);
        }
      } catch (error) {
        console.error('Unable to restore the signed-in agent:', error);
      } finally {
        if (mounted) setAgentAuthReady(true);
      }
    };

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        window.setTimeout(() => {
          if (mounted) void restoreAgent(session.user);
        }, 0);
      } else if (event === 'SIGNED_OUT' && mounted) {
        setCurrentUserRole('visitor');
        setActiveAgentIdState('');
        setCurrentAgentIdState('');
        setAgentAuthReady(true);
      } else if (event === 'INITIAL_SESSION' && mounted) {
        setAgentAuthReady(true);
      }
    });

    void supabase.auth.getSession().then(({ data, error }) => {
      if (error) throw error;
      if (data.session?.user) return restoreAgent(data.session.user);
      if (mounted) setAgentAuthReady(true);
    }).catch(error => {
      console.error('Unable to restore Supabase auth session:', error);
      if (mounted) setAgentAuthReady(true);
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const setActiveAgentId = (agentId: string) => {
    setActiveAgentIdState(agentId);
    const agent = agents.find(a => a.id === agentId);
    if (agent?.email) {
      setCurrentAgentIdState(agentId);
    }
    const agentGroups = groups.filter(g => g.agentId === agentId);
    if (agentGroups.length > 0) {
      const isCurrentValid = agentGroups.some(g => g.id === activeGroupId);
      if (!isCurrentValid) {
        setActiveGroupIdState(agentGroups[0].id);
      }
    } else {
      setActiveGroupIdState('');
    }
  };

  const refreshAgentAccount = React.useCallback(async (agentId = activeAgentId): Promise<AgentAccount> => {
    if (!agentId) throw new Error('No active agent account is selected.');
    const refreshedAgent = await DatabaseService.getAgentAccount(agentId);
    setAgents(prev => [refreshedAgent, ...prev.filter(agent => agent.id !== refreshedAgent.id)]);
    if (refreshedAgent.isKycSubmitted) await DatabaseService.saveAgentAccount(refreshedAgent);
    return refreshedAgent;
  }, [activeAgentId]);

  const refreshAgents = React.useCallback(async (): Promise<void> => {
    const refreshedAgents = await DatabaseService.loadAgents();
    setAgents(refreshedAgents);
  }, []);

  const agentAccount: AgentAccount = (() => {
    if (activeAgentId) {
      const fromArray = agents.find(a => a.id === activeAgentId);
      if (fromArray) return fromArray;
    }
    if (currentAgentId) {
      const current = agents.find(a => a.id === currentAgentId);
      if (current) return current;
    }
    return agents[0] || EMPTY_AGENT_ACCOUNT;
  })();

  useEffect(() => {
    const updated: Record<string, AgentAccount> = {};
    agents.forEach(agent => {
      if (agent.email) updated[agent.email.toLowerCase()] = agent;
    });
    setAgentRegistry(updated);
  }, [agents]);

  const [groups, setGroups] = useState<SusuGroup[]>([]);
  const [activeGroupId, setActiveGroupIdState] = useState<string>('');

  const setActiveGroupId = (groupId: string) => {
    setActiveGroupIdState(groupId);
  };

  const [members, setMembers] = useState<GroupMember[]>([]);
  const [payments, setPayments] = useState<DailyPayment[]>([]);
  const [posts, setPosts] = useState<FeedPost[]>(INITIAL_POSTS);

   const FALLBACK_GROUP: SusuGroup = {
    id: 'fallback-platform-group',
    agentId: activeAgentId || '',
    name: 'Platform Default Group',
    fixedDailyAmount: 50,
    currency: 'GH₵',
    cycleStartDate: getNearestMonday(),
    status: 'active',
    createdAt: formatDateStr(new Date()),
    paystackPublicKey: ''
  };

  const group: SusuGroup | null = (() => {
    if (groups.length === 0) return FALLBACK_GROUP;
    if (currentUserRole === 'agent') {
      const agentGroups = groups.filter(g => g.agentId === activeAgentId);
      if (agentGroups.length === 0) return FALLBACK_GROUP;
      const selected = agentGroups.find(g => g.id === activeGroupId);
      if (selected) return selected;
      return agentGroups[0];
    }
    if (currentUserRole === 'member') {
      const activeMember = members.find(m => m.id === activeMemberId) || members[0];
      if (activeMember?.groupId) {
        const memberGroup = groups.find(g => g.id === activeMember.groupId);
        if (memberGroup) return memberGroup;
      }
      const selected = groups.find(g => g.id === activeGroupId);
      return selected || groups[0] || FALLBACK_GROUP;
    }
    const selected = groups.find(g => g.id === activeGroupId);
    return selected || groups[0] || FALLBACK_GROUP;
  })();

  const myGroups = groups.filter(g => g.agentId === activeAgentId);
  const myGroupIds = new Set(myGroups.map(g => g.id));
  const myMembers = members.filter(m => m.groupId && myGroupIds.has(m.groupId));
  const myPayments = payments.filter(p => p.groupId && myGroupIds.has(p.groupId));

  const [agentPaymentConfigs, setAgentPaymentConfigs] = useState<Record<string, AgentPaymentConfig>>({});

  const agentPaymentConfig: AgentPaymentConfig = (() => {
    if (activeAgentId && agentPaymentConfigs[activeAgentId]) return agentPaymentConfigs[activeAgentId];
    if (currentUserRole === 'member' && group?.agentId && agentPaymentConfigs[group.agentId]) return agentPaymentConfigs[group.agentId];
    return INITIAL_AGENT_PAYMENT_CONFIG;
  })();

   const updateAgentPaymentConfig = (config: Partial<AgentPaymentConfig>) => {
    const aid = activeAgentId || 'default';
    setAgentPaymentConfigs(prev => {
      const current = prev[aid] || INITIAL_AGENT_PAYMENT_CONFIG;
      const updated = { ...prev, [aid]: { ...current, ...config } };
      return updated;
    });

    // ✅ FIX: Save directly to Supabase so phone sees it instantly
    (async () => {
      try {
        const { supabase } = await import('../services/db');
        if (!supabase || !aid || aid === 'default') return;
        // Don't save if aid is an email
        if (aid.includes('@')) return;
        const merged = { ...(agentPaymentConfigs[aid] || INITIAL_AGENT_PAYMENT_CONFIG), ...config };
        const { error } = await supabase.from('payment_configs').upsert({
          entity_type: `agent_${aid}`,
          config: {
            momoNumber: merged.momoNumber || '',
            momoName: (merged as any).momoName || merged.momoAccountName || '',
            momoAccountName: merged.momoAccountName || (merged as any).momoName || '',
            subaccountCode: (merged as any).subaccountCode || (merged as any).paystackSubaccountCode || '',
            payoutMethod: merged.payoutMethod || 'momo',
            momoProvider: merged.momoProvider || 'MTN',
            bankName: merged.bankName || '',
            bankAccountNumber: merged.bankAccountNumber || '',
            bankAccountName: merged.bankAccountName || '',
            agentCommissionPercent: merged.agentCommissionPercent ?? 1.5,
            dailyCutoffTime: merged.dailyCutoffTime || '',
            provider: 'paystack',
            isConnected: true,
          }
        }, { onConflict: 'entity_type' });
        if (error) console.error('Save agent payout to Supabase failed:', error.message);
        else console.log('✅ Agent payout saved to Supabase:', aid);
      } catch (e) { console.warn(e); }
    })();
  };

  const updateAgentPaymentConfigForAgent = (agentId: string, config: Partial<AgentPaymentConfig>) => {
    setAgentPaymentConfigs(prev => {
      const current = prev[agentId] || INITIAL_AGENT_PAYMENT_CONFIG;
      const updated = { ...prev, [agentId]: { ...current, ...config } };
      return updated;
    });
    // ✅ Same direct cloud save for specific agent
    (async () => {
      try {
        const { supabase } = await import('../services/db');
        if (!supabase || !agentId || agentId.includes('@')) return;
        const merged = { ...(agentPaymentConfigs[agentId] || INITIAL_AGENT_PAYMENT_CONFIG), ...config };
        await supabase.from('payment_configs').upsert({
          entity_type: `agent_${agentId}`,
          config: {
            momoNumber: merged.momoNumber || '',
            momoName: (merged as any).momoName || merged.momoAccountName || '',
            momoAccountName: merged.momoAccountName || (merged as any).momoName || '',
            subaccountCode: (merged as any).subaccountCode || (merged as any).paystackSubaccountCode || '',
            payoutMethod: merged.payoutMethod || 'momo',
            momoProvider: merged.momoProvider || 'MTN',
            bankName: merged.bankName || '',
            bankAccountNumber: merged.bankAccountNumber || '',
            bankAccountName: merged.bankAccountName || '',
            agentCommissionPercent: merged.agentCommissionPercent ?? 1.5,
            dailyCutoffTime: merged.dailyCutoffTime || '',
            provider: 'paystack',
            isConnected: true,
          }
        }, { onConflict: 'entity_type' });
      } catch (e) { console.warn(e); }
    })();
  };


  const [platformPaymentConfig, setPlatformPaymentConfig] = useState<SuperAdminPaymentConfig>(() => {
    return {...INITIAL_PLATFORM_PAYMENT_CONFIG, agentActivationFee: platformSettings.agentActivationFee };
  });

  const [schedule, setSchedule] = useState<PayoutScheduleWeek[]>([]);
  useEffect(() => {
    if (!group) { setSchedule([]); return; }
    const groupMembers = members.filter(m => m.groupId === group.id);
    setSchedule(generatePayoutSchedule(group.id, group.cycleStartDate, groupMembers, group.fixedDailyAmount));
  }, [group, members]);

  const [isDbLoaded, setIsDbLoaded] = useState(false);

  // 1. Load main data from DB - FIXED NOT TO WIPE
  useEffect(() => {
    DatabaseService.loadState().then((dbState) => {
      setGroups(dbState.groups || (dbState.group ? [dbState.group] : []));
      setMembers(dbState.members || []);
      setPayments(dbState.payments || []);
      setPosts(dbState.posts || []);
      
      if (dbState.agents && dbState.agents.length > 0) {
        setAgents(prev => {
          const merged = new Map<string, AgentAccount>();
          prev.forEach(a => { if (a.id) merged.set(a.id, a); });
          dbState.agents.forEach((a: AgentAccount) => { 
            if (a.id && !merged.has(a.id)) merged.set(a.id, a); 
          });
          return Array.from(merged.values());
        });
      }
      
      if (dbState.agentPaymentConfigs && Object.keys(dbState.agentPaymentConfigs).length > 0) {
        setAgentPaymentConfigs(prev => ({...prev,...dbState.agentPaymentConfigs }));
      } else if (dbState.agentPaymentConfig) {
        setAgentPaymentConfigs(prev => ({...prev, default: dbState.agentPaymentConfig! }));
      }
      if (dbState.platformPaymentConfig) {
        setPlatformPaymentConfig(dbState.platformPaymentConfig);
        if (dbState.platformPaymentConfig.agentActivationFee) {
          setPlatformSettings(prev => ({...prev, agentActivationFee: dbState.platformPaymentConfig.agentActivationFee }));
        }
      }
      if (dbState.liveSupportConfig) setLiveSupportConfig(dbState.liveSupportConfig);
      if (dbState.agentMessages) setAgentMessages(dbState.agentMessages);
      setIsDbLoaded(true);
    });
  }, []);

const hasSkippedFirstSave = React.useRef(false);
  useEffect(() => {
    if (!isDbLoaded) return;
      // Skip the first save right after loading - data is already in DB
  if (!hasSkippedFirstSave.current) {
    hasSkippedFirstSave.current = true;
    return;
  }

    const timeout = setTimeout(() => {
const stateToSave = {
  group, groups, activeGroupId, members, payments, posts,
  agentAccount, agents, agentPaymentConfig, agentPaymentConfigs,
  platformPaymentConfig, liveSupportConfig, agentMessages
  // notifications removed - Supabase is source of truth
};
      DatabaseService.persistState(stateToSave as any).catch(err => console.warn('DB sync:', err));
    }, 1000);
    return () => clearTimeout(timeout);
   }, [isDbLoaded, groups, members, payments, agents, platformPaymentConfig, agentPaymentConfigs, agentPaymentConfig]);

  const getActiveUser = (): User => {
    if (currentUserRole === 'super_admin') {
      return {
      ...INITIAL_SUPER_ADMIN_USER,
        name: 'Super Administrator',
        email: import.meta.env.VITE_SUPER_ADMIN_EMAIL || 'admin@susu.platform',
        role: 'super_admin',
        id: 'usr-super-admin'
      };
    }
    if (currentUserRole === 'agent') {
      const agentName = agentAccount.kycData?.fullName || [agentAccount.firstName, agentAccount.surname].filter(Boolean).join(' ').trim();
      return {
        id: agentAccount.id,
        name: agentName || 'Agent Organizer',
        email: agentAccount.email || INITIAL_AGENT_USER.email,
        phone: agentAccount.phone || INITIAL_AGENT_USER.phone,
        role: 'agent',
        avatarUrl: agentAccount.avatarUrl || agentAccount.kycData?.selfieUrl || (agentAccount.email? `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(agentAccount.email)}` : INITIAL_AGENT_USER.avatarUrl)
      };
    }
    if (currentUserRole === 'visitor') {
      return { id: 'usr-visitor', name: 'Guest Visitor', email: 'guest@example.com', phone: '', role: 'visitor' };
    }
    const mem = members.find((m) => m.id === activeMemberId) || members[0];
    if (!mem) return { id: 'usr-member-guest', name: 'Member', email: '', phone: '', role: 'member' };
    return { id: mem.userId, name: mem.name, email: mem.email, phone: mem.phone, role: 'member', avatarUrl: mem.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(mem.name)}` };
  };

  const setRole = (role: UserRole, memberId?: string) => {
    setCurrentUserRole(role);
    if (role === 'member') {
      const resolved = memberId || activeMemberId || members[0]?.id || '';
      setActiveMemberId(resolved);
    }
  };

  const signOut = async () => {
    if (supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) throw new Error(`Unable to sign out: ${error.message}`);
    }
    setCurrentUserRole('visitor');
    setActiveAgentIdState('');
    setCurrentAgentIdState('');
  };

  const createGroup = (name: string, fixedDailyAmount: number, cycleStartDate?: string, currency?: string, agentId?: string): SusuGroup => {
    const currentAgentId = activeAgentId || '';
    const assignedAgentId = agentId || (currentUserRole === 'agent'? currentAgentId : (agentAccount?.id || agents[0]?.id || ''));
    const newGroup: SusuGroup = {
      id: `group-${Date.now()}`,
      agentId: assignedAgentId,
      name,
      fixedDailyAmount,
      currency: currency || 'GH₵',
      cycleStartDate: cycleStartDate || getNearestMonday(),
      status: 'active',
      createdAt: formatDateStr(new Date()),
      paystackPublicKey: ''
    };
    setGroups(prev => [newGroup,...prev]);
    setActiveGroupId(newGroup.id);
    DatabaseService.createGroup(newGroup).catch(err => console.error('DatabaseService createGroup error:', err));
    return newGroup;
  };

  const updateGroupSettings = (settings: Partial<SusuGroup>, groupId?: string) => {
    const targetId = groupId || activeGroupId || group?.id;
    if (!targetId) return;
    setGroups(prev => prev.map(g => g.id === targetId? {...g,...settings } : g));
  };

  const updatePlatformPaymentConfig = async (config: Partial<SuperAdminPaymentConfig>) => {
    setPlatformPaymentConfig(prev => {
      const next = {...prev,...config };
      (async () => {
        try {
          const { supabase } = await import('../services/db');
          if (!supabase) return;
          const dbConfig = {
            provider: next.provider,
            paymentMode: next.paymentMode,
            gatewayStatus: next.gatewayStatus,
            storeCheckoutType: next.storeCheckoutType,
            publicKey: next.masterPublicKey || next.publicKey,
            secretKey: next.masterSecretKey || next.secretKey,
            webhookSecret: next.webhookSecret,
            environment: next.environment,
            masterPublicKey: next.masterPublicKey || next.secretKey? next.masterPublicKey : next.publicKey,
            masterSecretKey: next.masterSecretKey || next.secretKey,
            platformTreasuryAccount: (next as any).platformTreasuryAccount || '',
            globalPlatformFeePercent: next.globalPlatformFeePercent,
            agentActivationFee: next.agentActivationFee,
          };
          const { error } = await supabase
           .from('payment_configs')
           .upsert({ entity_type: 'super_admin', config: dbConfig }, { onConflict: 'entity_type' });
          if (error) console.error('Save error:', error);
        } catch (e) { console.error(e); }
      })();
      return next;
    });
    if (config.agentActivationFee!== undefined) {
      updatePlatformSettings({ agentActivationFee: config.agentActivationFee });
    }
  };


























const createAgent = async (data: Partial<AgentAccount>, password: string): Promise<{ requiresEmailConfirmation: boolean }> => {
  if (!supabase) throw new Error('Supabase is not configured.');
  const email = data.email?.trim().toLowerCase() || '';
  if (!email) throw new Error('Enter a valid email address.');

  const { data: existingAgent, error: existingAgentError } = await supabase
    .from('agent_accounts')
    .select('id')
    .eq('email', email)
    .maybeSingle();
  if (existingAgentError) throw existingAgentError;
  if (existingAgent) {
    throw new Error('An agent profile already exists for this email. Ask the administrator to securely link your existing account.');
  }

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: window.location.origin,
      data: { first_name: data.firstName, surname: data.surname }
    }
  });
  if (authError) throw new Error(authError.message);
  if (!authData.user) throw new Error('Supabase did not return a user for this sign-up.');

  const newId = `agt-${Date.now()}`;
  const newAgent: AgentAccount = {
    ...INITIAL_AGENT_ACCOUNT,
    id: newId,
    licenseNumber: `SUSU-AGT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    activationFeeAmount: platformSettings.agentActivationFee,
    ...data,
    email,
  } as AgentAccount;
  await DatabaseService.saveAgentAccount(newAgent, authData.user.id);

  if (authData.session) {
    setAgents(prev => [newAgent, ...prev.filter(a => a.email.toLowerCase() !== email)]);
    setActiveAgentIdState(newAgent.id);
    setCurrentAgentIdState(newAgent.id);
    setCurrentUserRole('agent');
  }
  return { requiresEmailConfirmation: !authData.session };
};










  const registerAgentKyc = async (kycData: AgentKycData) => {
    const agent = agents.find(a => a.id === activeAgentId);
    if (!agent) throw new Error('No active agent account is selected.');
    const updatedAgent = {
      ...agent,
      kycData,
      isKycSubmitted: true,
      adminApprovalStatus: 'pending_admin_approval' as const,
      adminApprovedAt: undefined,
      adminReviewNotes: undefined,
      licenseNumber: agent.licenseNumber && !agent.licenseNumber.includes('Pending')
        ? agent.licenseNumber
        : `SUSU-AGT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`
    };
    const savedAgent = await DatabaseService.submitAgentKyc(updatedAgent);
    setAgents(prev => prev.map(a => a.id === activeAgentId ? savedAgent : a));
  };

  const activateAgentAccount = async (_paymentMethod: string, txRef: string) => {
    const agent = agents.find(a => a.id === activeAgentId);
    if (!agent) throw new Error('No active agent account is selected.');
    const updatedAgent = {
      ...agent,
      isActivated: true,
      activationPaidAt: new Date().toISOString(),
      activationTxRef: txRef,
      adminApprovalStatus: agent.adminApprovalStatus === 'verified' || agent.adminApprovalStatus === 'rejected'
        ? agent.adminApprovalStatus
        : 'pending_admin_approval' as const,
      licenseNumber: agent.licenseNumber && !agent.licenseNumber.includes('Pending')
        ? agent.licenseNumber
        : `SUSU-AGT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`
    };
    setAgents(prev => prev.map(a => a.id === activeAgentId ? updatedAgent : a));
    await DatabaseService.saveAgentAccount(updatedAgent);
  };

  const approveAgentKyc = async (agentId: string, notes?: string) => {
    const updatedAgent = await DatabaseService.setAgentKycReview(
      agentId,
      'verified',
      notes || 'KYC verified and approved by Admin.'
    );
    setAgents(prev => [updatedAgent, ...prev.filter(a => a.id !== agentId)]);
  };

  const rejectAgentKyc = async (agentId: string, reason: string) => {
    const updatedAgent = await DatabaseService.setAgentKycReview(agentId, 'rejected', reason);
    setAgents(prev => [updatedAgent, ...prev.filter(a => a.id !== agentId)]);
  };

  const updateAgentAccount = (agentIdOrPartial: string | Partial<AgentAccount>, partial?: Partial<AgentAccount>) => {
    if (typeof agentIdOrPartial === 'string') {
      const targetId = agentIdOrPartial;
      const data = partial || {};
      setAgents(prev => prev.map(a => a.id === targetId? {...a,...data } : a));
    } else {
      const data = agentIdOrPartial;
      const targetId = data.id || activeAgentId;
      setAgents(prev => {
        const existing = prev.find(a => a.id === targetId);
        const updated = existing ? { ...existing, ...data } : { ...INITIAL_AGENT_ACCOUNT, ...data, id: targetId };
        return [updated, ...prev.filter(a => a.id !== targetId)];
      });
    }
  };

  const updateAgentKyc = (agentIdOrKyc: string | Partial<AgentKycData>, kycData?: Partial<AgentKycData>) => {
    const targetId = typeof agentIdOrKyc === 'string'? agentIdOrKyc : activeAgentId;
    const data = typeof agentIdOrKyc === 'string'? (kycData || {}) : agentIdOrKyc;
    setAgents(prev => prev.map(a => {
      if (a.id === targetId) {
        const existingKyc = a.kycData || {
          fullName: `${a.firstName} ${a.surname}`.trim() || 'Agent Organizer',
          dob: '1990-01-01',
          cityCountry: 'Accra, Ghana',
          gender: 'female' as const,
          idCardType: 'ecowas_card' as const,
          idCardNumber: 'GHA-000000000-0',
          digitalAddress: 'GA-000-0000',
          residentialAddress: 'Accra, Ghana',
          occupation: 'Merchant / Agent',
          maritalStatus: 'single' as const,
          status: 'verified' as const
        };
        return {...a, kycData: {...existingKyc,...data } };
      }
      return a;
    }));
  };

  const deleteAgent = (agentIdOrOptions?: string | { resetGroup?: boolean }, options?: { resetGroup?: boolean }) => {
    let targetId = activeAgentId;
    let shouldResetGroup = false;
    if (typeof agentIdOrOptions === 'string') {
      targetId = agentIdOrOptions;
      shouldResetGroup = options?.resetGroup?? false;
    } else if (agentIdOrOptions && typeof agentIdOrOptions === 'object') {
      shouldResetGroup = agentIdOrOptions.resetGroup?? false;
    }
    const targetAgent = agents.find(a => a.id === targetId);
    if (targetAgent?.email) {
      setAgentRegistry(prev => {
        const next = {...prev };
        delete next[targetAgent.email.toLowerCase()];
        return next;
      });
    }
    DatabaseService.deleteAgent(targetId).catch(err => console.warn('Delete agent err:', err));
    setAgents(prev => prev.filter(a => a.id!== targetId));
    if (targetId === activeAgentId) {
      const remaining = agents.filter(a => a.id!== targetId);
      const nextId = remaining[0]?.id || '';
      setActiveAgentId(nextId);
    }
    if (shouldResetGroup) {
      const agentGroups = groups.filter(g => g.agentId === targetId);
      agentGroups.forEach(ag => deleteGroup(ag.id));
    }
  };

  const updateMemberProfile = (memberId: string, partial: Partial<GroupMember>) => setMembers(prev => prev.map(m => m.id === memberId? {...m,...partial } : m));
  const loginWithUniqueCode = (code: string): boolean => {
    const trimmed = code.trim().toUpperCase();
    const found = members.find(m => (m.uniqueCode && m.uniqueCode.toUpperCase() === trimmed) || (m.inviteToken && m.inviteToken.toLowerCase() === code.trim().toLowerCase()));
    if (found) { setRole('member', found.id); return true; }
    return false;
  };









const inviteMember = async (name: string, email: string, phone: string) => {
  if (!group) throw new Error('Please select or create a Susu group first before inviting members.');
  const { supabase } = await import('../services/db');
  if (!supabase) throw new Error('DB not ready');

  const uniqueCode = `SUSU-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const token = `invite-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
  const newMemberId = `mem-${Date.now()}`;
  const groupMembers = members.filter(m => m.groupId === group.id);
  const position = groupMembers.length + 1;
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const newMember: GroupMember = {
    id: newMemberId,
    groupId: group.id,
    userId: `usr-${newMemberId}`,
    name, email, phone,
    inviteStatus: 'pending',
    inviteToken: token,
    uniqueCode: uniqueCode,
    joinedAt: formatDateStr(new Date()),
    positionInRotation: position,
    reliabilityScore: 100,
    slotLocked: false
  };
  setMembers(prev => [...prev, newMember]);

  // 1. Save member - CHECK ERROR THIS TIME
  const { error: memberError } = await supabase.from('group_members').upsert({
    id: newMemberId,
    group_id: group.id,
    user_id: `usr-${newMemberId}`,
    name, email, phone,
    invite_status: 'pending',
    invite_token: token,
    unique_code: uniqueCode,
    joined_at: new Date().toISOString(),
    position_in_rotation: position,
    reliability_score: 100
  }, { onConflict: 'id' });

  if (memberError) {
    console.error('MEMBER SAVE FAILED:', memberError);
    alert(`Member NOT saved to Supabase: ${memberError.message}`);
    throw memberError;
  }

  // 2. Save invite - CHECK ERROR
  const { error: inviteError } = await supabase.from('group_invites').insert({
    id: token,
    token: token,
    group_id: group.id,
    member_id: newMemberId,
    member_name: name,
    member_phone: phone,
    invited_email: email?.toLowerCase() || phone,
    member_email: email,
    position: position,
    status: 'pending',
    created_at: new Date().toISOString(),
    expires_at: expiresAt
  });

  if (inviteError) {
    console.error('INVITE SAVE FAILED:', inviteError);
    // Don't throw here - member already saved, just warn
    alert(`Member saved, but invite link failed: ${inviteError.message}`);
  }

  return { token, inviteUrl: `${window.location.origin}/invite/${token}`, uniqueCode };
};

const acceptInviteToken = async (token: string, name: string, phone: string): Promise<boolean> => {
  try {
    const { supabase } = await import('../services/db');
    if (!supabase) {
      console.error("No supabase");
      return false;
    }

    console.log("Checking token:", token);

    const { data: invite, error: fetchError } = await supabase
      .from('group_invites')
      .select('*')
      .eq('token', token)
      .single();

    console.log("Invite fetched:", invite, fetchError);

    if (fetchError || !invite) {
      console.error("Invite not found", fetchError);
      return false;
    }

    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      console.error("Expired");
      return false;
    }

    // Update to accepted - LOG ERROR
    const { error: updateInviteError } = await supabase
      .from('group_invites')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString()
      })
      .eq('token', token);

    if (updateInviteError) {
      console.error("Failed to update group_invites:", updateInviteError);
      alert(`DB Error updating invite: ${updateInviteError.message}. Fix RLS!`);
      return false;
    }

    // Activate member
    setMembers(prev => prev.map(m => 
      m.inviteToken === token || m.id === invite.member_id
        ? { ...m, inviteStatus: 'active' as any, name: name || m.name, phone: phone || m.phone, slotLocked: true }
        : m
    ));

    const { error: memberError } = await supabase
      .from('group_members')
      .update({
        invite_status: 'active',
        name: name,
        phone: phone
      })
      .eq('id', invite.member_id);

    if (memberError) {
      console.error("Member update error (but invite accepted anyway):", memberError);
      // Don't fail - invite is already burned, let them in
    }

    return true;
  } catch (e: any) {
    console.error("acceptInviteToken exception:", e);
    alert(`Exception: ${e.message}`);
    return false;
  }
};











  const removeMember = (memberId: string) => setMembers(prev => {
    const target = prev.find(m => m.id === memberId);
    if (!target) return prev;
    const targetGroupId = target.groupId;
    const remaining = prev.filter(m => m.id!== memberId);
    let groupPos = 1;
    return remaining.map(m => {
      if (m.groupId === targetGroupId) {
        const updated = {...m, positionInRotation: groupPos };
        groupPos++;
        return updated;
      }
      return m;
    });
  });

  const deleteGroup = (groupId?: string) => {
    const targetId = groupId || activeGroupId || group?.id;
    if (!targetId) return;
    setGroups(prev => prev.filter(g => g.id!== targetId));
    setMembers(prev => prev.filter(m => m.groupId!== targetId));
    setPayments(prev => prev.filter(p => p.groupId!== targetId));
    DatabaseService.deleteGroup(targetId).catch(err => console.warn('DB delete group err:', err));
    if (activeGroupId === targetId) {
      const remainingAgentGroups = groups.filter(g => g.id!== targetId && g.agentId === activeAgentId);
      setActiveGroupId(remainingAgentGroups[0]?.id || '');
    }
  };

  const markCashPayment = (memberId: string, dateStr: string) => {
    setPayments(prev => {
      const existingIdx = prev.findIndex(p => p.memberId === memberId && p.paymentDate === dateStr);
      const updated = [...prev];
      if (existingIdx >= 0) updated[existingIdx] = {...updated[existingIdx], status: 'paid', paymentMethod: 'cash_override', paidAt: new Date().toISOString() };
      else updated.push({ id: `pay-${memberId}-${dateStr}`, groupId: group?.id || '', memberId, paymentDate: dateStr, amount: group?.fixedDailyAmount || 0, status: 'paid', paymentMethod: 'cash_override', paidAt: new Date().toISOString() });
      return updated;
    });
  };

   const remindMember = async (memberId: string) => {
    const mem = members.find(m => m.id === memberId);
    if (!mem || !group) return;
    const text = `Hi ${mem.name}, Agent reminded you: Please pay your ${group.currency}${group.fixedDailyAmount} today.`;
    try {
      const { supabase } = await import('../services/db');
      if (supabase) {
        await supabase.from('notifications').insert({
          member_id: memberId,
          group_id: mem.groupId,
          title: 'Payment Reminder',
          description: text,
          message: text,
          type: 'payment_reminder',
          read: false
        });
      }
    } catch(e){ console.error(e) }
  };











  const sendAgentMessage = async (groupId: string, memberId: string, message: string) => {
    const newMsg: AgentMessage = {
      id: `msg-${Date.now()}`,
      agentId: activeAgentId || 'agent-1',
      groupId,
      memberId,
      senderRole: 'agent',
      message,
      createdAt: new Date().toISOString(),
      read: false,
    };
    setAgentMessages(prev => [newMsg, ...prev]);
    const targetMembers = memberId === 'all' ? members.filter(m => m.groupId === groupId) : members.filter(m => m.id === memberId);
    
    try {
      const { supabase } = await import('../services/db');
      if (supabase && targetMembers.length > 0) {
        const payload = targetMembers.map(mem => ({
          member_id: mem.id,
          group_id: groupId,
          agent_id: activeAgentId,
          title: `Message from Agent`,
          description: message.slice(0, 60),
          message: message,
          type: 'info',
          read: false
        }));
        await supabase.from('notifications').insert(payload);
      }
    } catch(e){ console.warn(e) }
  };



  const processPayment = (memberId: string, dates: string[], method: PaymentMethod, paystackRef?: string) => {
    const ref = paystackRef || generatePaystackReference();
    const paidTimestamp = new Date().toISOString();
    setPayments(prev => {
      const updated = [...prev];
      dates.forEach(dStr => {
        const idx = updated.findIndex(p => p.memberId === memberId && p.paymentDate === dStr);
        if (idx >= 0) updated[idx] = {...updated[idx], status: 'paid', paymentMethod: method, paystackReference: ref, paidAt: paidTimestamp };
        else updated.push({ id: `pay-${memberId}-${dStr}`, groupId: group?.id || '', memberId, paymentDate: dStr, amount: group?.fixedDailyAmount || 0, status: 'paid', paymentMethod: method, paystackReference: ref, paidAt: paidTimestamp });
      });
      return updated;
    });
  };

  const reorderCalendar = (fromIndex: number, toIndex: number) => {
    if (!group) return;
    const currentWeekIdx = schedule.findIndex(s => s.status === 'current');
    const safeCurrentIdx = currentWeekIdx >= 0? currentWeekIdx : 0;
    const groupMembers = members.filter(m => m.groupId === group.id);
    const reorderedGroupMembers = reorderRotationQueue(groupMembers, fromIndex, toIndex, safeCurrentIdx);
    setMembers(prev => {
      const others = prev.filter(m => m.groupId!== group.id);
      return [...others,...reorderedGroupMembers];
    });
  };

  const shuffleCalendar = () => {
    if (!group) return;
    const currentWeekIdx = schedule.findIndex(s => s.status === 'current');
    const safeCurrentIdx = currentWeekIdx >= 0? currentWeekIdx : 0;
    const groupMembers = members.filter(m => m.groupId === group.id);
    const shuffledGroupMembers = shuffleFutureRotation(groupMembers, safeCurrentIdx);
    setMembers(prev => {
      const others = prev.filter(m => m.groupId!== group.id);
      return [...others,...shuffledGroupMembers];
    });
  };

  const selectRotationSlot = (memberId: string, targetWeekNumber: number, roleOverride?: UserRole) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return { success: false, message: 'Member not found' };
    const effectiveRole = roleOverride || currentUserRole;
    const isMemberRole = effectiveRole === 'member';
    const isSlotLocked = member.slotLocked?? (member.inviteStatus === 'active' &&!!member.positionInRotation);
    if (isMemberRole && isSlotLocked) {
      return { success: false, message: 'Your rotation slot is permanently locked. Contact your Agent.' };
    }
    const currentWeekIdx = schedule.findIndex(s => s.status === 'current');
    const safeCurrentWeekNumber = currentWeekIdx >= 0? currentWeekIdx + 1 : 1;
    if (targetWeekNumber <= safeCurrentWeekNumber && currentWeekIdx >= 0) {
      return { success: false, message: `Week #${targetWeekNumber} is active or completed.` };
    }
    setMembers(prevMembers => {
      const occupant = prevMembers.find(m => m.groupId === member.groupId && m.positionInRotation === targetWeekNumber && m.id!== memberId);
      return prevMembers.map(m => {
        if (m.id === memberId) return {...m, positionInRotation: targetWeekNumber, slotLocked: true };
        if (occupant && m.id === occupant.id) return {...m, positionInRotation: member.positionInRotation };
        return m;
      });
    });
    return { success: true, message: `Successfully locked in Week #${targetWeekNumber}.` };
  };

  const addFeedPost = (title: string, body: string, visibility: 'public' | 'group') => {
    const authorName = currentUserRole === 'super_admin'? 'Super Admin' : (group?.name? `${group.name} Organizer` : 'Agent Organizer');
    const authorRole = currentUserRole === 'super_admin'? 'platform' : 'agent';
    setPosts(prev => [{ id: `post-${Date.now()}`, authorName, authorRole, title, body, publishedAt: new Date().toISOString(), visibility, likesCount: 0 },...prev]);
  };

  const resetSystemData = () => {
    setGroups([]);
    setActiveGroupId('');
    setMembers([]);
    setPayments([]);
    setPosts([]);
    setNotifications([]);
    setAgents([]);
    setActiveAgentId('');
    setAgentPaymentConfigs({});
    setPlatformPaymentConfig({...INITIAL_PLATFORM_PAYMENT_CONFIG, agentActivationFee: platformSettings.agentActivationFee });
    setCurrentUserRole('visitor');
    setActiveMemberId('');
    setAgentRegistry({});
    setCurrentAgentIdState('');
    DatabaseService.purgeDatabase().catch(e => console.warn(e));
  };
  const resetDemoData = resetSystemData;
  const getMemberReliability = (memberId: string): number => {
    const memberPayments = payments.filter(p => p.memberId === memberId);
    if (!memberPayments.length) return 100;
    return Math.round((memberPayments.filter(p => p.status === 'paid').length / memberPayments.length) * 100);
  };

  return (
    <SusuContext.Provider value={{
      isAgentAuthReady,
      currentUserRole, activeMemberId, activeUser: getActiveUser(), group, groups, myGroups, myMembers, myPayments, activeGroupId, setActiveGroupId, members, schedule, payments, posts,
      agentAccount, agents, activeAgentId, setActiveAgentId, createAgent, signOut, refreshAgentAccount, refreshAgents, agentPaymentConfig, platformPaymentConfig, platformSettings,
      setRole, createGroup, updateGroupSettings, updateAgentPaymentConfig, updateAgentPaymentConfigForAgent, updatePlatformPaymentConfig, updatePlatformSettings,
      registerAgentKyc, activateAgentAccount, approveAgentKyc, rejectAgentKyc, updateAgentAccount, updateAgentKyc, deleteAgent,
      updateMemberProfile, loginWithUniqueCode, inviteMember, acceptInviteToken, removeMember, deleteGroup,
      markCashPayment, processPayment, reorderCalendar, remindMember, shuffleCalendar, addFeedPost, resetDemoData, resetSystemData,
      getMemberReliability, selectRotationSlot, liveSupportConfig, updateLiveSupportConfig, agentMessages, sendAgentMessage,
      notifications, markNotificationAsRead, markAllNotificationsAsRead, addNotification, clearAllNotifications
    }}>
      {children}
    </SusuContext.Provider>
  );
};

export const useSusu = (): SusuContextType => {
  const context = useContext(SusuContext);
  if (!context) throw new Error('useSusu must be used within a SusuProvider');
  return context;
};