import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AgentAccount, AgentPaymentConfig, AppNotification, DailyPayment, FeedPost, GroupMember, LiveSupportConfig, SuperAdminPaymentConfig, SusuGroup } from '../types/susu';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey &&!supabaseUrl.includes('your-project'));
let supabaseInstance: SupabaseClient | null = null;
export const supabase: SupabaseClient | null = isSupabaseConfigured
? (supabaseInstance??= createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: true, storageKey: 'susu-vault-auth' } }))
  : null;

const LOCAL_STORAGE_DB_KEY = 'susu_platform_live_db_v2';

export interface DatabaseState {
  group: SusuGroup | null; groups?: SusuGroup[]; members: GroupMember[]; payments: DailyPayment[];
  posts: FeedPost[]; agentAccount: AgentAccount | null; agents?: AgentAccount[];
  agentPaymentConfig: AgentPaymentConfig | null; agentPaymentConfigs?: Record<string, AgentPaymentConfig>;
  platformPaymentConfig: SuperAdminPaymentConfig | null; liveSupportConfig: LiveSupportConfig | null; notifications: AppNotification[];
}

export function validateDatabaseIntegrity(state: Partial<DatabaseState>): { valid: boolean; error?: string } {
  if (state.group && state.group.fixedDailyAmount <= 0) return { valid: false, error: 'fixedDailyAmount must be > 0' };
  return { valid: true };
}

export const DatabaseService = {
  async loadState(): Promise<DatabaseState> {
    if (supabase) {
      try {
        let currentAgentId = localStorage.getItem('susu_current_agent_id') || localStorage.getItem('susu_active_agent_id');
        if (currentAgentId && currentAgentId.includes('@')) {
          try {
            const regStr = localStorage.getItem('susu_agent_registry_v2');
            if (regStr) {
              const registry = JSON.parse(regStr);
              if (registry[currentAgentId.toLowerCase()]) {
                currentAgentId = registry[currentAgentId.toLowerCase()].id;
              }
            }
          } catch {}
        }

        const groupsRes = currentAgentId
         ? await supabase.from('susu_groups').select('*').eq('agent_id', currentAgentId).order('created_at', { ascending: false })
          : await supabase.from('susu_groups').select('*').order('created_at', { ascending: false });
        const myGroupIds = (groupsRes.data || []).map((g: any) => g.id);

        const membersRes = myGroupIds.length > 0
         ? await supabase.from('group_members').select('*').in('group_id', myGroupIds).order('position_in_rotation', { ascending: true })
          : { data: [] };

        const [paymentsRes, postsRes, agentRes, paymentConfigsRes, liveConfigRes, notifsRes] = await Promise.all([
          myGroupIds.length > 0? supabase.from('daily_payments').select('*').in('group_id', myGroupIds) : Promise.resolve({ data: [] } as any),
          supabase.from('feed_posts').select('*').order('created_at', { ascending: false }),
          supabase.from('agent_accounts').select('*').order('created_at', { ascending: false }),
          supabase.from('payment_configs').select('*'), // ✅ FETCH ALL CONFIGS
          supabase.from('live_support_configs').select('*').limit(1).maybeSingle(),
          supabase.from('notifications').select('*').order('created_at', { ascending: false })
        ]);

        const groupsList: SusuGroup[] = (groupsRes.data || []).map((g: any) => ({
          id: g.id, name: g.name, agentId: g.agent_id, fixedDailyAmount: Number(g.fixed_daily_amount),
          currency: g.currency, cycleStartDate: g.cycle_start_date, status: g.status, createdAt: g.created_at, paystackPublicKey: g.paystack_public_key || ''
        }));

        // ✅ FIX: Parse platformPaymentConfig from payment_configs table
        let platformPaymentConfig: SuperAdminPaymentConfig | null = null;
        const superAdminRow = (paymentConfigsRes.data || []).find((r: any) => r.entity_type === 'super_admin');
        if (superAdminRow?.config) {
          const cfg = superAdminRow.config as any;
          platformPaymentConfig = {
            provider: cfg.provider || 'paystack',
            paymentMode: cfg.paymentMode || cfg.environment || 'live',
            gatewayStatus: cfg.gatewayStatus || 'active',
            storeCheckoutType: cfg.storeCheckoutType || 'Direct online payments',
            publicKey: cfg.publicKey || cfg.masterPublicKey || '',
            secretKey: cfg.secretKey || cfg.masterSecretKey || '',
            enableDirectStoreProcessing: cfg.enableDirectStoreProcessing?? true,
            minResellerTopUp: cfg.minResellerTopUp?? 10,
            activeGateway: cfg.provider || 'paystack',
            environment: cfg.environment || (cfg.paymentMode as any) || 'live',
            masterPublicKey: cfg.masterPublicKey || cfg.publicKey || '',
            masterSecretKey: cfg.masterSecretKey || cfg.secretKey || '',
            webhookSecret: cfg.webhookSecret || '',
            webhookUrl: cfg.webhookUrl || '',
            enableMultiGatewayFallback: false,
            fallbackGateway: 'none',
            globalPlatformFeePercent: cfg.globalPlatformFeePercent || cfg.commission_percent || 2,
            minTransactionFee: 0.5,
            agentActivationFee: cfg.agentActivationFee || 150,
            platformTreasuryAccount: cfg.platformTreasuryAccount || '',
            settlementMode: 'automatic_cron',
            payoutDisbursementMethod: 'paystack_transfers',
            emergencyPayoutFreeze: false,
            supportedCurrencies: ['GH₵', '₦', '$', '£'],
            baseCurrency: 'GH₵',
            maxDailyTransactionLimit: 10000,
            maxPoolKycThreshold: 50000,
            enforceHmacSignatures: true,
            webhookIpWhitelist: ''
          } as SuperAdminPaymentConfig;
          console.log('✅ Loaded platformPaymentConfig from Supabase super_admin:', platformPaymentConfig.masterPublicKey?.substring(0,20));
        }

        // Parse agent payment configs too
        let agentPaymentConfigs: Record<string, AgentPaymentConfig> = {};
        (paymentConfigsRes.data || []).forEach((r: any) => {
          if (r.entity_type === 'agent' && r.config) {
            // If you use agent_id in future, map it here
          }
        });

        return {
          group: groupsList.find(g => g.agentId === currentAgentId) || groupsList[0] || null,
          groups: groupsList,
          members: (membersRes.data || []).map((m: any) => ({ id: m.id, groupId: m.group_id, userId: m.user_id, name: m.name, email: m.email, phone: m.phone, avatarUrl: m.avatar_url || '', inviteStatus: m.invite_status, inviteToken: m.invite_token, uniqueCode: m.unique_code, joinedAt: m.joined_at, positionInRotation: m.position_in_rotation, reliabilityScore: m.reliability_score, slotLocked: m.slot_locked?? (m.invite_status === 'active') })),
          payments: (paymentsRes.data || []).map((p: any) => ({ id: p.id, groupId: p.group_id, memberId: p.member_id, paymentDate: p.payment_date, amount: Number(p.amount), status: p.status, paymentMethod: p.payment_method, paystackReference: p.paystack_reference, paidAt: p.paid_at })),
          posts: (postsRes.data as any) || [],
          agents: (agentRes.data || []).map((agt: any) => ({ id: agt.id, firstName: agt.first_name, surname: agt.surname, email: agt.email, phone: agt.phone, avatarUrl: agt.avatar_url || '', isOtpVerified: agt.is_otp_verified, isKycSubmitted: agt.is_kyc_submitted, isActivated: agt.is_activated, activationFeeAmount: Number(agt.activation_fee_amount || 0), activationPaidAt: agt.activation_paid_at, activationTxRef: agt.activation_tx_ref, adminApprovalStatus: agt.admin_approval_status, adminApprovedAt: agt.admin_approved_at, adminReviewNotes: agt.admin_review_notes, licenseNumber: agt.license_number, kycData: agt.kyc_data })),
          agentAccount: null,
          agentPaymentConfig: null,
          agentPaymentConfigs,
          platformPaymentConfig, // ✅ NOW IT'S LOADED!
          liveSupportConfig: liveConfigRes.data || null,
          notifications: (notifsRes.data as any) || [],
        } as any;
      } catch (err) { console.error('Supabase load failed, using local:', err); }
    }
    const saved = localStorage.getItem(LOCAL_STORAGE_DB_KEY);
    if (saved) { try { const parsed = JSON.parse(saved); return {...parsed, group: parsed.group || parsed.groups?.[0] || null, groups: parsed.groups || (parsed.group? [parsed.group] : []), agents: parsed.agents || (parsed.agentAccount? [parsed.agentAccount] : []) }; } catch {} }
    return { group: null, groups: [], members: [], payments: [], posts: [], agentAccount: null, agents: [], agentPaymentConfig: null, platformPaymentConfig: null, liveSupportConfig: null, notifications: [] };
  },

  async persistState(state: DatabaseState): Promise<void> {
    const integrity = validateDatabaseIntegrity(state);
    if (!integrity.valid) throw new Error(integrity.error);
    try { localStorage.setItem(LOCAL_STORAGE_DB_KEY, JSON.stringify(state)); } catch {}
    if (!supabase) return;
    try {
      if (state.groups?.length) await supabase.from('susu_groups').upsert(state.groups.map(g => ({ id: g.id, name: g.name, agent_id: g.agentId, fixed_daily_amount: g.fixedDailyAmount, currency: g.currency, cycle_start_date: g.cycleStartDate, status: g.status, paystack_public_key: (g as any).paystackPublicKey || '' })), { onConflict: 'id' });
      if (state.agents?.length) await supabase.from('agent_accounts').upsert(state.agents.map(a => ({ id: a.id, first_name: a.firstName, surname: a.surname, email: a.email, phone: a.phone, is_otp_verified: a.isOtpVerified, is_kyc_submitted: a.isKycSubmitted, is_activated: a.isActivated, activation_fee_amount: a.activationFeeAmount, activation_paid_at: a.activationPaidAt, activation_tx_ref: a.activationTxRef, admin_approval_status: a.adminApprovalStatus, license_number: a.licenseNumber, kyc_data: a.kycData })), { onConflict: 'id' });
      if (state.members?.length) await supabase.from('group_members').upsert(state.members.map(m => ({ id: m.id, group_id: m.groupId, user_id: m.userId, name: m.name, email: m.email, phone: m.phone, invite_status: m.inviteStatus, invite_token: m.inviteToken, unique_code: m.uniqueCode, joined_at: m.joinedAt, position_in_rotation: m.positionInRotation, reliability_score: (m as any).reliabilityScore || 100 })), { onConflict: 'id' });
      if (state.payments?.length) await supabase.from('daily_payments').upsert(state.payments.map(p => ({ id: p.id, group_id: p.groupId, member_id: p.memberId, payment_date: p.paymentDate, amount: p.amount, status: p.status, payment_method: p.paymentMethod, paystack_reference: p.paystackReference, paid_at: p.paidAt })), { onConflict: 'id' });

      // ✅ FIX: Also persist platformPaymentConfig to payment_configs
      if (state.platformPaymentConfig) {
        const cfg = state.platformPaymentConfig as any;
        await supabase.from('payment_configs').upsert({
          entity_type: 'super_admin',
          config: {
            provider: cfg.provider,
            paymentMode: cfg.paymentMode,
            gatewayStatus: cfg.gatewayStatus,
            publicKey: cfg.masterPublicKey || cfg.publicKey,
            secretKey: cfg.masterSecretKey || cfg.secretKey,
            masterPublicKey: cfg.masterPublicKey || cfg.publicKey,
            masterSecretKey: cfg.masterSecretKey || cfg.secretKey,
            environment: cfg.environment,
            platformTreasuryAccount: cfg.platformTreasuryAccount,
            globalPlatformFeePercent: cfg.globalPlatformFeePercent,
            agentActivationFee: cfg.agentActivationFee
          }
        }, { onConflict: 'entity_type' });
      }
    } catch (err) { console.warn('Supabase sync warning:', err); }
  },
  async createGroup(newGroup: SusuGroup): Promise<void> {
    if (!supabase) return;
    try {
      const currentAgentId = newGroup.agentId || localStorage.getItem('susu_current_agent_id') || localStorage.getItem('susu_active_agent_id') || '';
      const { error } = await supabase.from('susu_groups').insert({
        id: newGroup.id, name: newGroup.name, agent_id: currentAgentId,
        fixed_daily_amount: newGroup.fixedDailyAmount, currency: newGroup.currency,
        cycle_start_date: newGroup.cycleStartDate, status: newGroup.status,
        paystack_public_key: (newGroup as any).paystackPublicKey || ''
      });
      if (error) console.error('Supabase createGroup error:', error);
    } catch (err) { console.error('Failed to insert group:', err); }
  },
  async deleteAgent(agentId: string): Promise<void> { if (supabase) await supabase.from('agent_accounts').delete().eq('id', agentId); },
  async deleteGroup(groupId: string): Promise<void> { if (supabase) { await supabase.from('susu_groups').delete().eq('id', groupId); await supabase.from('group_members').delete().eq('group_id', groupId); } },
  async purgeDatabase(): Promise<void> {
    localStorage.clear();
    if (supabase) {
      try {
        await supabase.from('daily_payments').delete().neq('id', '_never_matches_');
        await supabase.from('group_members').delete().neq('id', '_never_matches_');
        await supabase.from('susu_groups').delete().neq('id', '_never_matches_');
        await supabase.from('agent_accounts').delete().neq('id', '_never_matches_');
      } catch (err) { console.error('Supabase purge failed:', err); }
    }
  }
};