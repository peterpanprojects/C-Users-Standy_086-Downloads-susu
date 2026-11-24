import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AgentAccount, AgentPaymentConfig, AppNotification, DailyPayment, FeedPost, GroupMember, LiveSupportConfig, PayoutDisbursement, SuperAdminPaymentConfig, SusuGroup } from '../types/susu';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your-project'));
let supabaseInstance: SupabaseClient | null = null;
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? (supabaseInstance ??= createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: true, autoRefreshToken: true } }))
  : null;

export interface DatabaseState {
  group: SusuGroup | null; groups?: SusuGroup[]; members: GroupMember[]; payments: DailyPayment[];
  posts: FeedPost[]; agentAccount: AgentAccount | null; agents?: AgentAccount[];
  agentPaymentConfig: AgentPaymentConfig | null; agentPaymentConfigs?: Record<string, AgentPaymentConfig>;
  platformPaymentConfig: SuperAdminPaymentConfig | null; liveSupportConfig: LiveSupportConfig | null; notifications: AppNotification[];
  agentMessages?: any[]; payoutDisbursements?: PayoutDisbursement[];
}

function mapPayoutDisbursement(row: any, proofUrl?: string): PayoutDisbursement {
  return {
    id: row.id,
    groupId: row.group_id,
    agentId: row.agent_id,
    memberId: row.member_id,
    weekNumber: row.week_number,
    weekStartDate: row.week_start_date,
    weekEndDate: row.week_end_date,
    currency: row.currency,
    poolAmount: Number(row.pool_amount),
    transferAmount: Number(row.transfer_amount),
    status: row.status,
    failureReason: row.failure_reason || undefined,
    transferReference: row.transfer_reference || undefined,
    proofPath: row.proof_path || undefined,
    proofUrl,
    agentSentAt: row.agent_sent_at || undefined,
    memberResponse: row.member_response || undefined,
    memberRespondedAt: row.member_responded_at || undefined
  };
}

function hasSubmittedKyc(kycData: any): boolean {
  const parsedKyc = typeof kycData === 'string'
    ? (() => {
        try { return JSON.parse(kycData); } catch { return null; }
      })()
    : kycData;
  return Boolean(
    parsedKyc?.submittedAt ||
    (parsedKyc?.fullName?.trim() && parsedKyc?.idCardNumber?.trim() && parsedKyc?.digitalAddress?.trim())
  );
}

export function mapAgentAccount(row: any): AgentAccount {
  let kycData = row.kyc_data;
  if (typeof kycData === 'string') {
    try { kycData = JSON.parse(kycData); } catch {}
  }
  return {
    id: row.id,
    firstName: row.first_name,
    surname: row.surname,
    email: row.email,
    phone: row.phone || '',
    avatarUrl: row.avatar_url || '',
    isOtpVerified: Boolean(row.is_otp_verified),
    isKycSubmitted: Boolean(row.is_kyc_submitted || hasSubmittedKyc(kycData)),
    isActivated: Boolean(row.is_activated || row.activation_paid_at || row.activation_tx_ref),
    activationFeeAmount: Number(row.activation_fee_amount || 150),
    activationPaidAt: row.activation_paid_at,
    activationTxRef: row.activation_tx_ref,
    adminApprovalStatus: row.admin_approval_status || 'none',
    adminApprovedAt: row.admin_approved_at,
    adminReviewNotes: row.admin_review_notes,
    licenseNumber: row.license_number || '',
    kycData
  };
}

let agentWriteQueue: Promise<void> = Promise.resolve();

function saveAgentAccounts(agents: AgentAccount[], userIds: Record<string, string> = {}): Promise<void> {
  const write = agentWriteQueue.then(async () => {
    if (!supabase) throw new Error('Supabase is not configured.');
    if (!agents.length) return;

    const { data: existingRows, error: fetchError } = await supabase
      .from('agent_accounts')
      .select('id, user_id, is_kyc_submitted, is_activated, activation_paid_at, activation_tx_ref, admin_approval_status, admin_approved_at, admin_review_notes, kyc_data')
      .in('id', agents.map(agent => agent.id));
    if (fetchError) throw new Error(`Failed to check existing agent data: ${fetchError.message}`);

    const existingById = new Map((existingRows || []).map((row: any) => [row.id, row]));
    const rows = agents.map(agent => {
      const existing = existingById.get(agent.id) as any;
      const existingKycSubmitted = Boolean(existing?.is_kyc_submitted || hasSubmittedKyc(existing?.kyc_data));
      const agentKycSubmitted = Boolean(agent.isKycSubmitted || hasSubmittedKyc(agent.kycData));
      const preserveExistingKyc = existingKycSubmitted && !agentKycSubmitted;
      const existingActivated = Boolean(existing?.is_activated || existing?.activation_paid_at || existing?.activation_tx_ref);
      const existingReviewStatus = ['verified', 'rejected'].includes(existing?.admin_approval_status)
        ? existing.admin_approval_status
        : null;
      const preserveExistingReview = Boolean(existingReviewStatus && agent.adminApprovalStatus !== existingReviewStatus);

      return {
        id: agent.id,
        user_id: userIds[agent.id] || existing?.user_id,
        first_name: agent.firstName,
        surname: agent.surname,
        email: agent.email,
        phone: agent.phone,
        is_otp_verified: agent.isOtpVerified,
        is_kyc_submitted: agentKycSubmitted || existingKycSubmitted,
        is_activated: Boolean(agent.isActivated || existingActivated),
        activation_fee_amount: agent.activationFeeAmount,
        activation_paid_at: agent.activationPaidAt || existing?.activation_paid_at,
        activation_tx_ref: agent.activationTxRef || existing?.activation_tx_ref,
        admin_approval_status: preserveExistingReview ? existingReviewStatus : agent.adminApprovalStatus,
        admin_approved_at: preserveExistingReview ? existing.admin_approved_at : (agent.adminApprovedAt || existing?.admin_approved_at),
        admin_review_notes: preserveExistingReview ? existing.admin_review_notes : (agent.adminReviewNotes || existing?.admin_review_notes),
        license_number: agent.licenseNumber || '',
        ...((preserveExistingKyc ? existing.kyc_data : agent.kycData || existing?.kyc_data)
          ? { kyc_data: preserveExistingKyc ? existing.kyc_data : agent.kycData || existing?.kyc_data }
          : {})
      };
    });

    const { error } = await supabase.from('agent_accounts').upsert(rows, { onConflict: 'id' });
    if (error) throw new Error(`Failed to save agent accounts: ${error.message}`);

    const submittedAgents = agents.filter(agent =>
      agent.isKycSubmitted || hasSubmittedKyc(agent.kycData)
    );
    if (submittedAgents.length) {
      const { data: savedRows, error: verifyError } = await supabase
        .from('agent_accounts')
        .select('id, is_kyc_submitted, kyc_data')
        .in('id', submittedAgents.map(agent => agent.id));
      if (verifyError) throw new Error(`KYC was sent but could not be verified in Supabase: ${verifyError.message}`);

      const savedById = new Map((savedRows || []).map((row: any) => [row.id, row]));
      for (const agent of submittedAgents) {
        const saved = savedById.get(agent.id) as any;
        if (!saved || !(saved.is_kyc_submitted || hasSubmittedKyc(saved.kyc_data))) {
          throw new Error(`Supabase did not confirm the KYC submission for ${agent.email}. Please retry and contact support if it continues.`);
        }
      }
    }
  });

  agentWriteQueue = write.then(() => undefined, () => undefined);
  return write;
}

export function validateDatabaseIntegrity(state: Partial<DatabaseState>): { valid: boolean; error?: string } {
  if (state.group && state.group.fixedDailyAmount <= 0) return { valid: false, error: 'fixedDailyAmount must be > 0' };
  return { valid: true };
}

export const DatabaseService = {
  async loadAgents(): Promise<AgentAccount[]> {
    if (!supabase) throw new Error('Supabase is not configured.');
    const { data, error } = await supabase
      .from('agent_accounts')
      .select('*');
    if (error) throw new Error(`Failed to load agent applications: ${error.message}`);
    return (data || [])
      .sort((a: any, b: any) => String(b.created_at || '').localeCompare(String(a.created_at || '')))
      .map(mapAgentAccount);
  },

  async submitAgentKyc(agent: AgentAccount): Promise<AgentAccount> {
    if (!supabase) throw new Error('Supabase is not configured.');
    const write = agentWriteQueue.then(async (): Promise<AgentAccount> => {
      const { data, error } = await supabase
        .from('agent_accounts')
        .update({
          is_kyc_submitted: true,
          kyc_data: agent.kycData,
          admin_approval_status: 'pending_admin_approval',
          admin_approved_at: null,
          admin_review_notes: null,
          license_number: agent.licenseNumber || ''
        })
        .eq('id', agent.id)
        .select('*')
        .single();
      if (error) throw new Error(`Failed to save KYC submission: ${error.message}`);
      const savedAgent = mapAgentAccount(data);
      if (!savedAgent.isKycSubmitted) {
        throw new Error('Supabase did not confirm the KYC submission. Please retry.');
      }
      return savedAgent;
    });
    agentWriteQueue = write.then(() => undefined, () => undefined);
    return write;
  },

  async loadState(): Promise<DatabaseState> {
    if (supabase) {
      try {
        const [
          groupsRes,
          membersRes,
          paymentsRes,
          postsRes,
          agentRes,
          paymentConfigsRes,
          liveConfigRes,
          notifsRes,
          agentMessagesRes,
          payoutDisbursementsRes
        ] = await Promise.all([
          supabase.from('susu_groups').select('*').order('created_at', { ascending: false }),
          supabase.from('group_members').select('*').order('position_in_rotation', { ascending: true }),
          supabase.from('daily_payments').select('*'),
          supabase.from('feed_posts').select('*').order('created_at', { ascending: false }),
          supabase.from('agent_accounts').select('id, first_name, surname, email, phone, is_otp_verified, is_kyc_submitted, is_activated, activation_fee_amount, activation_paid_at, activation_tx_ref, admin_approval_status, admin_approved_at, admin_review_notes, license_number, kyc_data, created_at').order('created_at', { ascending: false }),
          supabase.from('payment_configs').select('*'),
          supabase.from('live_support_configs').select('*').limit(1).maybeSingle(),
          supabase.from('notifications').select('*').order('created_at', { ascending: false }),
          supabase.from('agent_messages').select('*').order('created_at', { ascending: true }),
          supabase.from('payout_disbursements').select('*').order('week_start_date', { ascending: false })
        ]);

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
            enableDirectStoreProcessing: cfg.enableDirectStoreProcessing ?? true,
            minResellerTopUp: cfg.minResellerTopUp ?? 10,
            activeGateway: cfg.provider || 'paystack',
            environment: cfg.environment || (cfg.paymentMode as any) || 'live',
            masterPublicKey: cfg.masterPublicKey || cfg.publicKey || '',
            webhookUrl: cfg.webhookUrl || '',
            enableMultiGatewayFallback: false,
            fallbackGateway: 'none',
            globalPlatformFeePercent: cfg.globalPlatformFeePercent ?? cfg.commission_percent ?? 2,
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
              paystackSubaccountCode: cfg.paystackSubaccountCode || cfg.subaccountCode || cfg.subaccount_code || cfg.subaccount || '',
              paystackRecipientCode: cfg.paystackRecipientCode || cfg.recipientCode || '',
              isConnected: Boolean(cfg.subaccountCode || cfg.subaccount_code || cfg.subaccount || cfg.momoNumber),
              provider: cfg.provider || 'paystack',
              payoutMethod: cfg.payoutMethod || 'momo',
              momoProvider: cfg.momoProvider || 'MTN',
              bankName: cfg.bankName || '',
              bankAccountNumber: cfg.bankAccountNumber || '',
              bankAccountName: cfg.bankAccountName || '',
              allowPaystackOnline: cfg.allowPaystackOnline ?? true,
              agentCommissionPercent: cfg.agentCommissionPercent ?? 1.5,
              dailyCutoffTime: cfg.dailyCutoffTime || '',
            } as unknown as AgentPaymentConfig;
            agentPaymentConfigs[agentIdFromRow] = parsed;
          }
        });

        if (!agentPaymentConfig) {
          const vals = Object.values(agentPaymentConfigs);
          if (vals.length === 1) agentPaymentConfig = vals[0] as AgentPaymentConfig;
        }

        return {
          group: groupsList[0] || null,
          groups: groupsList,
          members: (membersRes.data || []).map((m: any) => ({ id: m.id, groupId: m.group_id, userId: m.user_id, name: m.name, email: m.email, phone: m.phone, avatarUrl: m.avatar_url || '', inviteStatus: m.invite_status, inviteToken: m.invite_token, uniqueCode: m.unique_code, joinedAt: m.joined_at, positionInRotation: m.position_in_rotation, reliabilityScore: m.reliability_score, slotLocked: m.slot_locked ?? (m.invite_status === 'active') })),
          payments: (paymentsRes.data || []).map((p: any) => ({ id: p.id, groupId: p.group_id, memberId: p.member_id, paymentDate: p.payment_date, amount: Number(p.amount), platformFee: Number(p.platform_fee || 0), status: p.status, paymentMethod: p.payment_method, paystackReference: p.paystack_reference, paidAt: p.paid_at })),
          posts: (postsRes.data || []).map((post: any) => ({
            id: post.id,
            authorName: post.author_name,
            authorRole: post.author_role,
            title: post.title,
            body: post.body,
            publishedAt: post.published_at,
            visibility: post.visibility,
            likesCount: post.likes_count,
            pinned: Boolean(post.pinned)
          })),
          agents: (agentRes.data || []).map(mapAgentAccount),
          agentAccount: null,
          agentPaymentConfig: agentPaymentConfig,
          agentPaymentConfigs: agentPaymentConfigs,
          platformPaymentConfig,
          liveSupportConfig: liveConfigRes.data ? ({
            provider: liveConfigRes.data.provider || 'rezolv',
            enabled: liveConfigRes.data.enabled,
            apiKey: liveConfigRes.data.api_key || '',
            welcomeMessage: liveConfigRes.data.welcome_message || '',
            autoReply: liveConfigRes.data.auto_reply
          } as LiveSupportConfig) : null,
          notifications: (notifsRes.data as any) || [],
          agentMessages: (agentMessagesRes.data || []).map((message: any) => ({
            id: message.id,
            agentId: message.agent_id,
            groupId: message.group_id,
            memberId: message.member_id,
            senderRole: 'agent',
            message: message.message,
            createdAt: message.created_at,
            read: Boolean(message.read)
          })),
          payoutDisbursements: (payoutDisbursementsRes.data || []).map((row: any) => mapPayoutDisbursement(row)),
        } as any;
      } catch (err) { console.error('Supabase load failed:', err); }
    }
    return { group: null, groups: [], members: [], payments: [], posts: [], agentAccount: null, agents: [], agentPaymentConfig: null, platformPaymentConfig: null, liveSupportConfig: null, notifications: [] };
  },

  async savePlatformPaymentConfig(config: SuperAdminPaymentConfig): Promise<void> {
    if (!supabase) throw new Error('Supabase is not configured.');
    const publicConfig = {
      ...config,
      publicKey: config.masterPublicKey || config.publicKey || '',
      masterPublicKey: config.masterPublicKey || config.publicKey || ''
    };
    const { error } = await supabase
      .from('payment_configs')
      .upsert({ entity_type: 'super_admin', config: publicConfig }, { onConflict: 'entity_type' });
    if (error) throw new Error(`Failed to save payment configuration: ${error.message}`);
  },

  async savePayments(payments: DailyPayment[]): Promise<void> {
    if (!supabase) throw new Error('Supabase is not configured.');
    if (!payments.length) return;
    const { error } = await supabase.from('daily_payments').upsert(payments.map(payment => ({
      id: payment.id,
      group_id: payment.groupId,
      member_id: payment.memberId,
      payment_date: payment.paymentDate,
      amount: payment.amount,
      platform_fee: payment.platformFee || 0,
      status: payment.status,
      payment_method: payment.paymentMethod,
      paystack_reference: payment.paystackReference || null,
      paid_at: payment.paidAt || null
    })), { onConflict: 'id' });
    if (error) throw new Error(`Failed to save payment: ${error.message}`);
  },

  async loadPayoutDisbursements(): Promise<PayoutDisbursement[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('payout_disbursements')
      .select('*')
      .order('week_start_date', { ascending: false });
    if (error) throw new Error(`Failed to load payout records: ${error.message}`);
    return Promise.all((data || []).map(async (row: any) => {
      if (!row.proof_path) return mapPayoutDisbursement(row);
      const { data: signedUrl, error: urlError } = await supabase.storage
        .from('payout-proofs')
        .createSignedUrl(row.proof_path, 1800);
      if (urlError) throw new Error(`Failed to access payout proof: ${urlError.message}`);
      return mapPayoutDisbursement(row, signedUrl.signedUrl);
    }));
  },

  async loadMemberPayouts(code: string): Promise<{ memberId: string; groupId: string; payouts: PayoutDisbursement[] }> {
    const response = await fetch('/api/payouts/member', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'list', code })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result?.error || 'Unable to verify Member Code.');
    return {
      memberId: result.memberId,
      groupId: result.groupId,
      payouts: (result.payouts || []).map((row: any) => mapPayoutDisbursement(row, row.proof_url))
    };
  },

  async respondToMemberPayout(code: string, payoutId: string, responseValue: 'received' | 'not_received'): Promise<void> {
    const response = await fetch('/api/payouts/member', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'respond', code, payoutId, memberResponse: responseValue })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result?.error || 'Failed to save payout confirmation.');
  },

  async uploadPayoutProof(payoutId: string, file: File): Promise<void> {
    if (!supabase) throw new Error('Supabase is not configured.');
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) throw new Error('Upload a JPG, PNG, WEBP, or PDF receipt.');
    if (file.size > 8 * 1024 * 1024) throw new Error('Receipt must be 8 MB or smaller.');
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-100) || 'receipt';
    const path = `${payoutId}/${Date.now()}-${safeName}`;
    const { error: uploadError } = await supabase.storage
      .from('payout-proofs')
      .upload(path, file, { contentType: file.type, upsert: false });
    if (uploadError) throw new Error(`Failed to upload payout proof: ${uploadError.message}`);

    const { error: updateError } = await supabase
      .from('payout_disbursements')
      .update({ status: 'sent_to_member', proof_path: path, agent_sent_at: new Date().toISOString() })
      .eq('id', payoutId)
      .eq('status', 'awaiting_agent')
      .select('id')
      .single();
    if (updateError) {
      const { error: cleanupError } = await supabase.storage.from('payout-proofs').remove([path]);
      if (cleanupError) console.error('Unable to remove unlinked payout proof:', cleanupError.message);
      throw new Error(`Failed to save payout proof: ${updateError.message}`);
    }
  },

  async respondToPayout(payoutId: string, response: 'received' | 'not_received'): Promise<void> {
    if (!supabase) throw new Error('Supabase is not configured.');
    const { error } = await supabase
      .from('payout_disbursements')
      .update({
        member_response: response,
        status: response === 'received' ? 'member_received' : 'member_disputed',
        member_responded_at: new Date().toISOString()
      })
      .eq('id', payoutId)
      .in('status', ['sent_to_member', 'member_disputed'])
      .select('id')
      .single();
    if (error) throw new Error(`Failed to save payout confirmation: ${error.message}`);
  },

  async getAgentKyc(agentId: string) {
    if (!supabase) return null;
    const { data } = await supabase.from('agent_accounts').select('kyc_data').eq('id', agentId).maybeSingle();
    return (data as any)?.kyc_data || null;
  },

  async getAgentAccount(agentId: string): Promise<AgentAccount> {
    if (!supabase) throw new Error('Supabase is not configured.');
    const { data, error } = await supabase
      .from('agent_accounts')
      .select('*')
      .eq('id', agentId)
      .single();
    if (error) throw new Error(`Failed to load agent account: ${error.message}`);
    return mapAgentAccount(data);
  },

  async setAgentKycReview(
    agentId: string,
    status: 'verified' | 'rejected',
    notes: string
  ): Promise<AgentAccount> {
    if (!supabase) throw new Error('Supabase is not configured.');
    const write = agentWriteQueue.then(async (): Promise<AgentAccount> => {
      const { data: currentRow, error: fetchError } = await supabase
        .from('agent_accounts')
        .select('*')
        .eq('id', agentId)
        .single();
      if (fetchError) throw new Error(`Failed to load agent account: ${fetchError.message}`);
      const agent = mapAgentAccount(currentRow);
      if (!agent.isKycSubmitted) throw new Error('This agent has not submitted KYC yet.');

      const licenseNumber = status === 'verified'
        ? agent.licenseNumber && !agent.licenseNumber.includes('Pending')
          ? agent.licenseNumber
          : `SUSU-AGT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`
        : agent.licenseNumber || '';
      const { data, error } = await supabase
        .from('agent_accounts')
        .update({
          is_kyc_submitted: true,
          admin_approval_status: status,
          admin_approved_at: status === 'verified' ? new Date().toISOString() : null,
          admin_review_notes: notes,
          license_number: licenseNumber
        })
        .eq('id', agentId)
        .select('*')
        .single();
      if (error) throw new Error(`Failed to save KYC ${status} decision: ${error.message}`);
      return mapAgentAccount(data);
    });
    agentWriteQueue = write.then(() => undefined, () => undefined);
    return write;
  },

  async saveAgentAccount(agent: AgentAccount, userId?: string): Promise<void> {
    if (!supabase) throw new Error('Supabase is not configured.');
    await saveAgentAccounts([agent], userId ? { [agent.id]: userId } : {});
  },

  async persistState(state: DatabaseState): Promise<void> {
    const integrity = validateDatabaseIntegrity(state);
    if (!integrity.valid) throw new Error(integrity.error);
    if (!supabase) return;
    try {
      if (state.groups?.length) {
        const { error } = await supabase.from('susu_groups').upsert(state.groups.map(g => ({
          id: g.id,
          name: g.name,
          agent_id: g.agentId,
          fixed_daily_amount: g.fixedDailyAmount,
          currency: g.currency,
          cycle_start_date: g.cycleStartDate,
          status: g.status,
          paystack_public_key: (g as any).paystackPublicKey || ''
        })), { onConflict: 'id' });
        if (error) throw new Error(`Failed to sync groups (${error.code || 'Supabase'}): ${error.message}`);
      }
      if (state.agents?.length) {
        await saveAgentAccounts(state.agents);
      }
      if (state.members?.length) {
        const { error } = await supabase.from('group_members').upsert(state.members.map(m => ({
          id: m.id,
          group_id: m.groupId,
          user_id: m.userId,
          name: m.name,
          email: m.email,
          phone: m.phone,
          invite_status: m.inviteStatus,
          invite_token: m.inviteToken,
          unique_code: m.uniqueCode,
          joined_at: m.joinedAt,
          position_in_rotation: m.positionInRotation,
          reliability_score: (m as any).reliabilityScore || 100
        })), { onConflict: 'id' });
        if (error) throw new Error(`Failed to sync members (${error.code || 'Supabase'}): ${error.message}`);
      }
      if (state.payments?.length) {
        const { error } = await supabase.from('daily_payments').upsert(state.payments.map(p => ({
          id: p.id,
          group_id: p.groupId,
          member_id: p.memberId,
          payment_date: p.paymentDate,
          amount: p.amount,
          platform_fee: p.platformFee || 0,
          status: p.status,
          payment_method: p.paymentMethod,
          paystack_reference: p.paystackReference,
          paid_at: p.paidAt
        })), { onConflict: 'id' });
        if (error) throw new Error(`Failed to sync payments (${error.code || 'Supabase'}): ${error.message}`);
      }
      if (state.posts?.length) await supabase.from('feed_posts').upsert(state.posts.map(post => ({
        id: post.id,
        group_id: null,
        author_name: post.authorName,
        author_role: post.authorRole,
        title: post.title,
        body: post.body,
        published_at: post.publishedAt,
        visibility: post.visibility,
        likes_count: post.likesCount
      })), { onConflict: 'id' });

      if (state.liveSupportConfig) {
        const existing = await supabase.from('live_support_configs').select('id').limit(1).maybeSingle();
        if (existing.error) throw new Error(`Failed to load live support config (${existing.error.code || 'Supabase'}): ${existing.error.message}`);
        const { error } = await supabase.from('live_support_configs').upsert({
          ...(existing.data?.id ? { id: existing.data.id } : {}),
          provider: (state.liveSupportConfig as any).provider || 'rezolv',
          enabled: (state.liveSupportConfig as any).enabled ?? true,
          api_key: (state.liveSupportConfig as any).apiKey || '',
          welcome_message: (state.liveSupportConfig as any).welcomeMessage || '',
          auto_reply: (state.liveSupportConfig as any).autoReply ?? true
        }, { onConflict: 'id' });
        if (error) throw new Error(`Failed to sync live support config (${error.code || 'Supabase'}): ${error.message}`);
      }

      if (state.agentMessages?.length) await supabase.from('agent_messages').upsert(state.agentMessages.map((message: any) => ({
        id: message.id,
        agent_id: message.agentId,
        group_id: message.groupId,
        member_id: message.memberId,
        message: message.message,
        read: Boolean(message.read),
        created_at: message.createdAt
      })), { onConflict: 'id' });

      if (state.platformPaymentConfig) {
        const cfg = state.platformPaymentConfig as any;
        await supabase.from('payment_configs').upsert({
          entity_type: 'super_admin',
          config: {
            provider: cfg.provider,
            paymentMode: cfg.paymentMode,
            gatewayStatus: cfg.gatewayStatus,
            publicKey: cfg.masterPublicKey || cfg.publicKey,
            masterPublicKey: cfg.masterPublicKey || cfg.publicKey,
            environment: cfg.environment,
            platformTreasuryAccount: cfg.platformTreasuryAccount,
            globalPlatformFeePercent: cfg.globalPlatformFeePercent,
            agentActivationFee: cfg.agentActivationFee
          }
        }, { onConflict: 'entity_type' });
      }

      const buildAgentConfig = (cfg: any) => ({
        momoNumber: cfg.momoNumber || '',
        momoName: cfg.momoName || cfg.momoAccountName || '',
        momoAccountName: cfg.momoAccountName || cfg.momoName || '',
        subaccountCode: cfg.subaccountCode || cfg.subaccount || '',
        paystackRecipientCode: cfg.paystackRecipientCode || cfg.recipientCode || '',
        payoutMethod: cfg.payoutMethod || 'momo',
        momoProvider: cfg.momoProvider || 'MTN',
        bankName: cfg.bankName || '',
        bankAccountNumber: cfg.bankAccountNumber || '',
        bankAccountName: cfg.bankAccountName || '',
        allowPaystackOnline: cfg.allowPaystackOnline ?? true,
        agentCommissionPercent: cfg.agentCommissionPercent ?? 1.5,
        dailyCutoffTime: cfg.dailyCutoffTime || '',
        provider: 'paystack',
        isConnected: true,
      });

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

      const agentIdToSave = state.agentAccount?.id || (state.agents?.[0] as any)?.id || '';
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
    } catch (err) { console.error('Supabase state sync failed:', err); }
  },

  async createGroup(newGroup: SusuGroup): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured');
    const currentAgentId = newGroup.agentId || '';
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