export type UserRole = 'visitor' | 'agent' | 'member' | 'super_admin';

export type InviteStatus = 'pending' | 'accepted' | 'active' | 'removed';

export type PayoutWeekStatus = 'paid_out' | 'current' | 'upcoming';

export type DailyPaymentStatus = 'paid' | 'missed' | 'pending';

export type PaymentMethod = 'paystack' | 'cash_override' | 'admin_grant';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatarUrl?: string;
  isFrozen?: boolean;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'security';
  message: string;
  source: string;
}

export interface SusuGroup {
  id: string;
  agentId: string;
  name: string;
  fixedDailyAmount: number;
  currency: string; // 'GH₵' | '₦' | '$' | '£'
  cycleStartDate: string; // YYYY-MM-DD (Must be a Monday)
  status: 'active' | 'completed';
  createdAt: string;
  paystackPublicKey?: string;
  paystackSecretKey?: string;
}

export interface AgentPaymentConfig {
  // Gateway Provider Settings (Direct online payments)
  provider: 'paystack' | 'mooire' | 'hubtel' | 'flutterwave';
  paymentMode: 'test' | 'live';
  gatewayStatus: 'active' | 'inactive';
  storeCheckoutType: string;
  publicKey: string;
  secretKey: string;
  webhookSecret: string;
  enableDirectStoreProcessing: boolean;
  minResellerTopUp: number; // in GHS

  // Susu circle payout and commission settings
  payoutMethod: 'momo' | 'bank';
  momoProvider: 'MTN' | 'Telecel' | 'AirtelTigo';
  momoNumber: string;
  momoAccountName: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
  bankBranch: string;
  allowPaystackOnline: boolean;
  allowCashOverride: boolean;
  allowBankTransfer: boolean;
  agentCommissionPercent: number; // e.g., 1.5%
  dailyCutoffTime: string; // "22:00"
  gracePeriodHours: number; // 24
  autoSendSmsReceipts: boolean;
  requireCashReceiptProof: boolean;
  paystackSubaccountCode?: string;
  customReferencePrefix: string;
}

export interface SuperAdminPaymentConfig {
  // Provider Settings (Screenshot configuration)
  provider?: 'paystack' | 'mooire' | 'hubtel' | 'flutterwave';
  paymentMode?: 'test' | 'live';
  gatewayStatus?: 'active' | 'inactive';
  storeCheckoutType?: string;
  publicKey?: string;
  secretKey?: string;
  enableDirectStoreProcessing?: boolean;
  minResellerTopUp?: number;

  activeGateway: 'paystack' | 'flutterwave' | 'hubtel' | 'stripe';
  environment: 'test' | 'live';
  masterPublicKey: string;
  masterSecretKey: string;
  webhookSecret: string;
  webhookUrl: string;
  enableMultiGatewayFallback: boolean;
  fallbackGateway: 'flutterwave' | 'hubtel' | 'none';
  globalPlatformFeePercent: number; // e.g. 2.0%
  minTransactionFee: number; // e.g. 0.50
  agentActivationFee: number; // e.g. 150.00
  platformTreasuryAccount: string;
  settlementMode: 'automatic_cron' | 'manual_admin_approval' | 'agent_2fa';
  payoutDisbursementMethod: 'paystack_transfers' | 'flutterwave_bulk' | 'hubtel_momo';
  emergencyPayoutFreeze: boolean;
  supportedCurrencies: string[];
  baseCurrency: string;
  maxDailyTransactionLimit: number; // e.g. 5000
  maxPoolKycThreshold: number; // e.g. 20000
  enforceHmacSignatures: boolean;
  webhookIpWhitelist: string;
}


export interface AgentKycData {
  fullName: string;
  dob: string;
  cityCountry: string;
  gender: 'male' | 'female' | 'other';
  nationality?: string;
  tin?: string; // Tax Identification Number
  idCardType: 'ecowas_card' | 'passport' | 'voter_id' | 'driver_license';
  idCardNumber: string;
  idIssueDate?: string;
  idExpiryDate?: string;
  idCardFrontUrl?: string;
  idCardBackUrl?: string;
  selfieUrl?: string;
  businessCertificateUrl?: string;
  businessCertificateNumber?: string;
  tradeName?: string; // e.g. Serwaa Susu Enterprises
  yearsExperience?: string; // e.g. "3-5 years"
  digitalAddress: string; // e.g. GA-183-9022
  residentialAddress: string;
  landmark?: string; // Nearest Landmark
  occupation: string;
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';
  utilityBillUrl?: string;
  // Payout / Settlement Details
  payoutMethod?: 'momo' | 'bank';
  payoutMomoNetwork?: 'MTN' | 'Telecel' | 'AirtelTigo' | string;
  payoutMomoNumber?: string;
  payoutAccountName?: string;
  payoutBankName?: string;
  payoutAccountNumber?: string;
  // Next of Kin / Guarantor
  nextOfKinName?: string;
  nextOfKinRelationship?: string;
  nextOfKinPhone?: string;
  nextOfKinAddress?: string;
  submittedAt?: string;
  status: 'pending_verification' | 'verified';
}

export type AdminApprovalStatus = 'none' | 'pending_admin_approval' | 'verified' | 'rejected';

export interface AgentAccount {
  id: string;
  firstName: string;
  surname: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  isOtpVerified: boolean;
  kycData?: AgentKycData;
  isKycSubmitted: boolean;
  isActivated: boolean; // Paid activation fee
  activationPaidAt?: string;
  activationFeeAmount: number; // e.g. 150
  activationTxRef?: string;
  adminApprovalStatus: AdminApprovalStatus;
  adminApprovedAt?: string;
  adminReviewNotes?: string;
  licenseNumber?: string;
}

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  inviteStatus: InviteStatus;
  inviteToken: string;
  uniqueCode: string; // e.g. SUSU-7A92
  joinedAt: string;
  positionInRotation: number; // 1 to N
  reliabilityScore: number; // 0 - 100 percentage
  slotLocked?: boolean; // Whether slot selection is locked for member
}

export interface PayoutScheduleWeek {
  id: string;
  groupId: string;
  memberId: string; // group_members id
  memberName: string;
  weekNumber: number; // 1 to N
  weekStartDate: string; // Monday (YYYY-MM-DD)
  weekEndDate: string; // Sunday (YYYY-MM-DD)
  status: PayoutWeekStatus;
  expectedPoolAmount: number; // fixedDailyAmount * 7 * N
  paidOutAt?: string;
  isAvailable?: boolean;
}

export interface DailyPayment {
  id: string;
  groupId: string;
  memberId: string; // group_members id
  paymentDate: string; // YYYY-MM-DD
  amount: number;
  status: DailyPaymentStatus;
  paymentMethod: PaymentMethod;
  paystackReference?: string;
  paidAt?: string;
}

export interface FeedPost {
  id: string;
  authorName: string;
  authorRole: 'agent' | 'platform';
  title: string;
  body: string;
  publishedAt: string;
  visibility: 'public' | 'group';
  likesCount: number;
  pinned?: boolean;
}

export interface LiveSupportConfig {
  provider: 'rezolv';
  enabled: boolean;
  apiKey: string;
  welcomeMessage?: string;
  autoReply?: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  message?: string; // <-- add this
  time: string;
  type: 'sent' | 'warning' | 'received' | 'info' | 'payment_reminder'; // <-- added payment_reminder
  read: boolean;
  link?: string;
  createdAt: number;
  memberId?: string; // <-- add this (who should receive)
  groupId?: string;  // <-- add this
}

export interface AgentMessage {
  id: string;
  agentId: string;
  groupId: string;
  memberId: string; // 'all' for broadcast to whole group
  senderRole: 'agent';
  message: string;
  createdAt: string;
  read: boolean;
}


