import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AgentAccount, AgentPaymentConfig, AppNotification, DailyPayment, FeedPost, GroupMember, LiveSupportConfig, SuperAdminPaymentConfig, SusuGroup } from '../types/susu';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your-project'));
let supabaseInstance: SupabaseClient | null = null;
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? (supabaseInstance ??= createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: true, storageKey: 'susu-vault-auth' } }))
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
          myGroupIds.length > 0 ? supabase.from('daily_payments').select('*').in('group_id', myGroupIds) : Promise.resolve({ data: [] } as any),
          supabase.from('feed_posts').select('*').order('created_at', { ascending: false }),
          supabase.from('agent_accounts').select('id, first_name, surname, email, phone, avatar_url, is_otp_verified, is_kyc_submitted, is_activated, activation_fee_amount, activation_paid_at, activation_tx_ref, admin_approval_status, admin_approved_at, admin_review_notes, license_number, status, created_at').order('created_at', { ascending: false }),
          supabase.from('payment_configs').select('*'),
          supabase.from('live_support_configs').select('*').limit(1).maybeSingle(),
          supabase.from('notifications').select('*').order('created_at', { ascending: false })
        ]);

        // Resolve email -> real agent id using agent_accounts (fixes phone vs laptop id mismatch)
        if (currentAgentId && currentAgentId.includes('@')) {
          const found = (agentRes.data || []).find((a: any) => a.email?.toLowerCase() === currentAgentId!.toLowerCase());
          if (found) currentAgentId = found.id;
        }

        const groupsList: SusuGroup[] = (groupsRes.data || []).map((g: any) => ({
          id: g.id, name: g.name, agentId: g.agent_id, fixedDailyAmount: Number(g.fixed_daily_amount),
          currency: g.currency, cycleStartDate: g.cycle_start_date, status: g.status, createdAt: g.created_at, paystackPublicKey: g.paystack_public_key || ''
        }));

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
            enableDirectStoreProcessing: cfg.enableDirectStoreProcessing ?? true,
            minResellerTopUp: cfg.minResellerTopUp ?? 10,
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
        }

        // ✅ FIXED: Parse ALL agent payout fields
        let agentPaymentConfigs: Record<string, AgentPaymentConfig> = {};
        let agentPaymentConfig: AgentPaymentConfig | null = null;
        (paymentConfigsRes.data || []).forEach((r: any) => {
          if (r.config && typeof r.entity_type === 'string' && r.entity_type.startsWith('agent_')) {
            const agentIdFromRow = r.entity_id || r.entity_type.replace('agent_', '');
            const cfg = r.config as any;
            const parsed = {
              momoNumber: cfg.momoNumber || cfg.momo_number || '',
              momoName: cfg.momoName || cfg.momoAccountName || cfg.momo_name || '',
              momoAccountName: cfg.momoAccountName || cfg.momoName || cfg.momo_name || '',
              subaccountCode: cfg.subaccountCode || cfg.subaccount_code || cfg.subaccount || '',
              isConnected: Boolean(cfg.subaccountCode || cfg.subaccount_code || cfg.subaccount || cfg.momoNumber),
              provider: cfg.provider || 'paystack',
              payoutMethod: cfg.payoutMethod || 'momo',
              momoProvider: cfg.momoProvider || 'MTN',
              bankName: cfg.bankName || '',
              bankAccountNumber: cfg.bankAccountNumber || '',
              bankAccountName: cfg.bankAccountName || '',
              agentCommissionPercent: cfg.agentCommissionPercent ?? 1.5,
              dailyCutoffTime: cfg.dailyCutoffTime || '',
            } as unknown as AgentPaymentConfig;
            agentPaymentConfigs[agentIdFromRow] = parsed;
            if (agentIdFromRow === currentAgentId) agentPaymentConfig = parsed;
          }
        });

        // Fallback: if currentAgentId didn't match but there is only 1 agent config, use it
        if (!agentPaymentConfig) {
          const vals = Object.values(agentPaymentConfigs);
          if (vals.length === 1) agentPaymentConfig = vals[0] as AgentPaymentConfig;
        }

        return {
          group: groupsList.find(g => g.agentId === currentAgentId) || groupsList[0] || null,
          groups: groupsList,
          members: (membersRes.data || []).map((m: any) => ({ id: m.id, groupId: m.group_id, userId: m.user_id, name: m.name, email: m.email, phone: m.phone, avatarUrl: m.avatar_url || '', inviteStatus: m.invite_status, inviteToken: m.invite_token, uniqueCode: m.unique_code, joinedAt: m.joined_at, positionInRotation: m.position_in_rotation, reliabilityScore: m.reliability_score, slotLocked: m.slot_locked ?? (m.invite_status === 'active') })),
          payments: (paymentsRes.data || []).map((p: any) => ({ id: p.id, groupId: p.group_id, memberId: p.member_id, paymentDate: p.payment_date, amount: Number(p.amount), status: p.status, paymentMethod: p.payment_method, paystackReference: p.paystack_reference, paidAt: p.paid_at })),
          posts: (postsRes.data as any) || [],
          agents: (agentRes.data || []).map((agt: any) => ({ id: agt.id, firstName: agt.first_name, surname: agt.surname, email: agt.email, phone: agt.phone, avatarUrl: agt.avatar_url || '', isOtpVerified: agt.is_otp_verified, isKycSubmitted: agt.is_kyc_submitted, isActivated: agt.is_activated, activationFeeAmount: Number(agt.activation_fee_amount || 0), activationPaidAt: agt.activation_paid_at, activationTxRef: agt.activation_tx_ref, adminApprovalStatus: agt.admin_approval_status, adminApprovedAt: agt.admin_approved_at, adminReviewNotes: agt.admin_review_notes, licenseNumber: agt.license_number, kycData: agt.kyc_data })),
          agentAccount: null,
          agentPaymentConfig: agentPaymentConfig,
          agentPaymentConfigs: agentPaymentConfigs,
          platformPaymentConfig,
          liveSupportConfig: liveConfigRes.data || null,
          notifications: (notifsRes.data as any) || [],
        } as any;
      } catch (err) { console.error('Supabase load failed, using local:', err); }
    }
    const saved = localStorage.getItem(LOCAL_STORAGE_DB_KEY);
    if (saved) { try { const parsed = JSON.parse(saved); return { ...parsed, group: parsed.group || parsed.groups?.[0] || null, groups: parsed.groups || (parsed.group ? [parsed.group] : []), agents: parsed.agents || (parsed.agentAccount ? [parsed.agentAccount] : []) }; } catch {} }
    return { group: null, groups: [], members: [], payments: [], posts: [], agentAccount: null, agents: [], agentPaymentConfig: null, platformPaymentConfig: null, liveSupportConfig: null, notifications: [] };
  },

  async getAgentKyc(agentId: string) {
    if (!supabase) return null;
    const { data } = await supabase.from('agent_accounts').select('kyc_data').eq('id', agentId).maybeSingle();
    return (data as any)?.kyc_data || null;
  },

  async persistState(state: DatabaseState): Promise<void> {
    const integrity = validateDatabaseIntegrity(state);
    if (!integrity.valid) throw new Error(integrity.error);
    try { localStorage.setItem(LOCAL_STORAGE_DB_KEY, JSON.stringify(state)); } catch {}
    if (!supabase) return;
    try {
      if (state.groups?.length) await supabase.from('susu_groups').upsert(state.groups.map(g => ({ id: g.id, name: g.name, agent_id: g.agentId, fixed_daily_amount: g.fixedDailyAmount, currency: g.currency, cycle_start_date: g.cycleStartDate, status: g.status, paystack_public_key: (g as any).paystackPublicKey || '' })), { onConflict: 'id' });
      if (state.agents?.length) await supabase.from('agent_accounts').upsert(state.agents.map(a => ({ id: a.id, first_name: a.firstName, surname: a.surname, email: a.email, phone: a.phone, is_otp_verified: a.isOtpVerified, is_kyc_submitted: a.isKycSubmitted, is_activated: a.isActivated, activation_fee_amount: a.activationFeeAmount, activation_paid_at: a.activationPaidAt, activation_tx_ref: a.activationTxRef, admin_approval_status: a.adminApprovalStatus, admin_approved_at: a.adminApprovedAt, admin_review_notes: a.adminReviewNotes, license_number: a.licenseNumber, ...(a.kycData ? { kyc_data: a.kycData } : {}) })), { onConflict: 'id' });
      if (state.members?.length) await supabase.from('group_members').upsert(state.members.map(m => ({ id: m.id, group_id: m.groupId, user_id: m.userId, name: m.name, email: m.email, phone: m.phone, invite_status: m.inviteStatus, invite_token: m.inviteToken, unique_code: m.uniqueCode, joined_at: m.joinedAt, position_in_rotation: m.positionInRotation, reliability_score: (m as any).reliabilityScore || 100 })), { onConflict: 'id' });
      if (state.payments?.length) await supabase.from('daily_payments').upsert(state.payments.map(p => ({ id: p.id, group_id: p.groupId, member_id: p.memberId, payment_date: p.paymentDate, amount: p.amount, status: p.status, payment_method: p.paymentMethod, paystack_reference: p.paystackReference, paid_at: p.paidAt })), { onConflict: 'id' });

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

      // ✅ FIXED: Save ALL agent payout fields, no entity_id column
      const buildAgentConfig = (cfg: any) => ({
        momoNumber: cfg.momoNumber || '',
        momoName: cfg.momoName || cfg.momoAccountName || '',
        momoAccountName: cfg.momoAccountName || cfg.momoName || '',
        subaccountCode: cfg.subaccountCode || cfg.subaccount || '',
        payoutMethod: cfg.payoutMethod || 'momo',
        momoProvider: cfg.momoProvider || 'MTN',
        bankName: cfg.bankName || '',
        bankAccountNumber: cfg.bankAccountNumber || '',
        bankAccountName: cfg.bankAccountName || '',
        agentCommissionPercent: cfg.agentCommissionPercent ?? 1.5,
        dailyCutoffTime: cfg.dailyCutoffTime || '',
        provider: 'paystack',
        isConnected: true,
      });

      // 1) Save the map if it exists (multi-agent safe)
      if (state.agentPaymentConfigs) {
        for (const [agentId, cfg] of Object.entries(state.agentPaymentConfigs)) {
          if (!agentId) continue;
          const { error } = await supabase.from('payment_configs').upsert({
            entity_type: `agent_${agentId}`,
            config: buildAgentConfig(cfg as any)
          }, { onConflict: 'entity_type' });
          if (error) console.warn('Save agentPaymentConfigs failed:', error.message);
        }
      }

      // 2) Save single current agent config (fallback)
      const agentIdToSave = state.agentAccount?.id || (state.agents?.[0] as any)?.id || (localStorage.getItem('susu_current_agent_id') || '');
      // Don't save if id is an email — resolve it via agents list
      let resolvedId = agentIdToSave;
      if (resolvedId && resolvedId.includes('@')) {
        const found = (state.agents || []).find((a: any) => a.email?.toLowerCase() === resolvedId.toLowerCase());
        if (found) resolvedId = found.id;
      }
      if (state.agentPaymentConfig && resolvedId && !resolvedId.includes('@')) {
        const { error } = await supabase.from('payment_configs').upsert({
          entity_type: `agent_${resolvedId}`,
          config: buildAgentConfig(state.agentPaymentConfig as any)
        }, { onConflict: 'entity_type' });
        if (error) console.warn('Save agentPaymentConfig failed:', error.message);
      }
    } catch (err) { console.warn('Supabase sync warning:', err); }
  },

  async createGroup(newGroup: SusuGroup): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');
  
  let currentAgentId = newGroup.agentId || localStorage.getItem('susu_current_agent_id') || '';
  if (currentAgentId.includes('@')) throw new Error('Agent ID is email, not UUID. Login again.');

  const { error } = await supabase.from('susu_groups').insert({
    id: newGroup.id, 
    name: newGroup.name, 
    agent_id: currentAgentId || null,
    fixed_daily_amount: newGroup.fixedDailyAmount, 
    currency: newGroup.currency,
    cycle_start_date: newGroup.cycleStartDate, 
    status: newGroup.status,
    paystack_public_key: (newGroup as any).paystackPublicKey || ''
  });
  if (error) throw error;
},

async addMember(member: GroupMember): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('group_members').insert({
    id: member.id,
    group_id: member.groupId,
    user_id: member.userId || member.id,
    name: member.name,
    email: member.email || '',
    phone: member.phone || '',
    invite_status: member.inviteStatus || 'active',
    invite_token: member.inviteToken || null,
    unique_code: member.uniqueCode || null,
    joined_at: member.joinedAt || new Date().toISOString(),
    position_in_rotation: member.positionInRotation ?? 0,
    reliability_score: (member as any).reliabilityScore ?? 100,
  });
  if (error) {
    console.error('addMember failed:', error);
    throw error;
  }
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