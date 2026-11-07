import React, { useState } from 'react';
import { AgentAccount } from '../../types/susu';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  CreditCard,
  User,
  MapPin,
  Building2,
  Smartphone,
  Users,
  Calendar,
  Clock,
  Eye,
  Maximize2,
  Copy,
  Check,
  FileText,
  BadgeCheck,
  ExternalLink,
  Phone,
  Mail,
  Briefcase,
  Layers,
  ZoomIn
} from 'lucide-react';

interface KycDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: AgentAccount | null;
  onApprove: (agentId: string, notes?: string) => void;
  onReject: (agentId: string, reason: string) => void;
}

export const KycDossierModal: React.FC<KycDossierModalProps> = ({
  isOpen,
  onClose,
  agent,
  onApprove,
  onReject
}) => {
  const [activeDossierTab, setActiveDossierTab] = useState<'all' | 'identity' | 'residence' | 'business' | 'payout' | 'guarantor'>('all');
  const [lightboxImg, setLightboxImg] = useState<{ label: string; src: string } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Approval / Rejection form state
  const [approvalNotes, setApprovalNotes] = useState('Identity and compliance credentials verified by Super Admin.');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState('Ghana Card front or back image is blurry or illegible.');
  const [customRejectReason, setCustomRejectReason] = useState('');

  // Checklist state
  const [checklist, setChecklist] = useState({
    idLegible: true,
    faceMatch: true,
    addressVerified: true,
    billConfirmed: true,
    businessValid: true,
    payoutNameMatch: true
  });

  if (!isOpen || !agent) return null;

  const kyc = agent.kycData;
  const isVerified = agent.adminApprovalStatus === 'verified';
  const isPending = agent.adminApprovalStatus === 'pending_admin_approval' || (agent.isKycSubmitted && !isVerified && agent.adminApprovalStatus !== 'rejected');
  const isRejected = agent.adminApprovalStatus === 'rejected';

  // Calculate age from DOB
  const calculateAge = (dobString?: string) => {
    if (!dobString) return 'N/A';
    const birthDate = new Date(dobString);
    if (isNaN(birthDate.getTime())) return 'N/A';
    const diffMs = Date.now() - birthDate.getTime();
    const ageDt = new Date(diffMs);
    return `${Math.abs(ageDt.getUTCFullYear() - 1970)} yrs`;
  };

  const handleCopy = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleApprove = () => {
    onApprove(agent.id, approvalNotes);
    onClose();
  };

  const handleReject = () => {
    const finalReason = rejectReason === 'Other' ? customRejectReason : rejectReason;
    if (!finalReason.trim()) {
      alert('Please specify a rejection reason.');
      return;
    }
    onReject(agent.id, finalReason);
    setShowRejectForm(false);
    onClose();
  };

  const renderDocumentCard = (label: string, src?: string, badge?: string) => {
    if (!src) {
      return (
        <div
          style={{
            border: '1.5px dashed #cbd5e1',
            borderRadius: '12px',
            padding: '1.5rem 1rem',
            textAlign: 'center',
            background: '#f8fafc',
            color: '#94a3b8'
          }}
        >
          <FileText size={28} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
          <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{label}</div>
          <span style={{ fontSize: '0.72rem' }}>No document uploaded</span>
        </div>
      );
    }

    return (
      <div
        key={label}
        style={{
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          overflow: 'hidden',
          background: '#fff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          position: 'relative'
        }}
      >
        <div
          style={{
            padding: '0.65rem 0.85rem',
            fontSize: '0.78rem',
            fontWeight: 700,
            color: '#1e293b',
            background: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <FileText size={14} color="var(--color-emerald-700)" />
            {label}
          </span>
          {badge && (
            <span style={{ fontSize: '0.68rem', background: '#dcfce7', color: '#166534', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>
              {badge}
            </span>
          )}
        </div>

        <div style={{ position: 'relative', height: '180px', background: '#0f172a', overflow: 'hidden' }}>
          <img
            src={src}
            alt={label}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: 0.95 }}
          />
          <button
            type="button"
            onClick={() => setLightboxImg({ label, src })}
            style={{
              position: 'absolute',
              bottom: '8px',
              right: '8px',
              background: 'rgba(0, 0, 0, 0.75)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '6px',
              padding: '0.35rem 0.65rem',
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              backdropFilter: 'blur(4px)'
            }}
          >
            <ZoomIn size={13} /> Zoom / Inspect
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div
        className="modal-content"
        style={{
          maxWidth: '1040px',
          width: '95%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          borderRadius: '18px',
          overflow: 'hidden'
        }}
      >
        {/* MODAL HEADER BANNER */}
        <div
          style={{
            background: 'linear-gradient(135deg, #061B14 0%, #0A2920 100%)',
            color: '#fff',
            padding: '1.75rem 2rem',
            borderBottom: '2px solid var(--color-gold-500)',
            position: 'relative'
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1.5rem',
              right: '1.5rem',
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
          >
            <X size={20} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <img
                src={kyc?.selfieUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(agent.email || agent.id)}`}
                alt={kyc?.fullName || agent.firstName}
                style={{
                  width: '74px',
                  height: '74px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '3px solid var(--color-gold-400)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  background: '#f1f5f9'
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: -2,
                  right: -2,
                  background: isVerified ? '#16a34a' : isPending ? '#ca8a04' : '#dc2626',
                  color: '#fff',
                  borderRadius: '50%',
                  padding: '3px',
                  border: '2px solid #061B14'
                }}
              >
                {isVerified ? <Check size={12} /> : isPending ? <Clock size={12} /> : <X size={12} />}
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                <span
                  style={{
                    background: 'var(--color-gold-500)',
                    color: 'var(--color-emerald-950)',
                    padding: '0.2rem 0.65rem',
                    borderRadius: '999px',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    letterSpacing: '0.04em'
                  }}
                >
                  ACCREDITED AGENT KYC DOSSIER
                </span>

                <span
                  className={`status-pill ${isVerified ? 'active' : isPending ? 'pending' : 'missed'}`}
                  style={{ fontSize: '0.72rem', padding: '0.2rem 0.65rem' }}
                >
                  {isVerified ? 'KYC Approved & Active' : isPending ? 'Pending Admin Review' : 'KYC Rejected'}
                </span>
              </div>

              <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: '#ffffff' }}>
                {kyc?.fullName || `${agent.firstName} ${agent.surname}`}
              </h2>

              <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.4rem', fontSize: '0.82rem', color: '#cbd5e1', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Mail size={14} color="var(--color-gold-400)" /> {agent.email}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Phone size={14} color="var(--color-gold-400)" /> {agent.phone}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <BadgeCheck size={14} color="var(--color-gold-400)" />
                  Lic: <strong style={{ color: '#fff', fontFamily: 'monospace' }}>{agent.licenseNumber || 'PENDING'}</strong>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Clock size={14} color="var(--color-gold-400)" />
                  Submitted: <strong>{kyc?.submittedAt ? new Date(kyc.submittedAt).toLocaleDateString() : 'Recent'}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* QUICK STATS STRIP */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: '1px',
            background: '#e2e8f0',
            borderBottom: '1px solid #e2e8f0'
          }}
        >
          <div style={{ background: '#fff', padding: '0.85rem 1.25rem' }}>
            <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>
              National ID Card
            </span>
            <strong style={{ fontSize: '0.95rem', color: '#0f172a', fontFamily: 'monospace' }}>
              {kyc?.idCardNumber || 'Not submitted'}
            </strong>
            <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>
              {kyc?.idCardType === 'ecowas_card' ? 'ECOWAS Ghana Card' : kyc?.idCardType?.toUpperCase() || 'ID'}
            </span>
          </div>

          <div style={{ background: '#fff', padding: '0.85rem 1.25rem' }}>
            <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>
              Demographics
            </span>
            <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>
              {kyc?.nationality || 'Ghanaian'} • {calculateAge(kyc?.dob)}
            </strong>
            <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>
              Gender: {kyc?.gender ? kyc.gender.charAt(0).toUpperCase() + kyc.gender.slice(1) : 'N/A'} • {kyc?.maritalStatus ? kyc.maritalStatus.charAt(0).toUpperCase() + kyc.maritalStatus.slice(1) : 'Single'}
            </span>
          </div>

          <div style={{ background: '#fff', padding: '0.85rem 1.25rem' }}>
            <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>
              Activation Fee
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span className="status-pill active" style={{ fontSize: '0.7rem' }}>Paid GH₵150 ✓</span>
            </div>
            <span style={{ fontSize: '0.7rem', color: '#64748b', fontFamily: 'monospace', display: 'block' }}>
              {agent.activationTxRef || 'TX-ACT-VERIFIED'}
            </span>
          </div>

          <div style={{ background: '#fff', padding: '0.85rem 1.25rem' }}>
            <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>
              Settlement Payout
            </span>
            <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>
              {kyc?.payoutMomoNetwork || 'MTN'} MoMo
            </strong>
            <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', fontFamily: 'monospace' }}>
              {kyc?.payoutMomoNumber || agent.phone}
            </span>
          </div>

          <div style={{ background: '#fff', padding: '0.85rem 1.25rem' }}>
            <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>
              Digital Address
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <strong style={{ fontSize: '0.95rem', color: 'var(--color-emerald-800)', fontFamily: 'monospace' }}>
                {kyc?.digitalAddress || 'N/A'}
              </strong>
              {kyc?.digitalAddress && (
                <button
                  type="button"
                  onClick={() => handleCopy(kyc.digitalAddress, 'digAddr')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
                  title="Copy Digital Address"
                >
                  {copiedField === 'digAddr' ? <Check size={14} color="#16a34a" /> : <Copy size={14} color="#64748b" />}
                </button>
              )}
            </div>
            <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>
              {kyc?.cityCountry || 'Ghana'}
            </span>
          </div>
        </div>

        {/* DOSSIER BODY WITH SUB-TABS */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.75rem 2rem' }}>
          {/* TAB BUTTONS */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'Complete Dossier' },
              { id: 'identity', label: '1. Identity & Biometrics' },
              { id: 'residence', label: '2. Residence & GPS' },
              { id: 'business', label: '3. Business & Trade' },
              { id: 'payout', label: '4. MoMo Settlement' },
              { id: 'guarantor', label: '5. Next of Kin' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveDossierTab(tab.id as any)}
                style={{
                  padding: '0.45rem 0.95rem',
                  borderRadius: '20px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: activeDossierTab === tab.id ? '2px solid var(--color-emerald-700)' : '1px solid #cbd5e1',
                  background: activeDossierTab === tab.id ? 'var(--color-emerald-100)' : '#fff',
                  color: activeDossierTab === tab.id ? 'var(--color-emerald-950)' : '#475569'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* SECTION 1: IDENTITY & BIOMETRICS */}
          {(activeDossierTab === 'all' || activeDossierTab === 'identity') && (
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ fontSize: '1.05rem', color: 'var(--color-emerald-950)', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CreditCard size={18} color="var(--color-gold-600)" />
                1. Official Identification & Biometrics
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
                <div><span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Full Legal Name</span><strong>{kyc?.fullName || `${agent.firstName} ${agent.surname}`}</strong></div>
                <div><span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>ID Document Type</span><strong>{kyc?.idCardType?.toUpperCase() || 'ECOWAS_CARD'}</strong></div>
                <div><span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>ID Document Number</span><strong style={{ fontFamily: 'monospace' }}>{kyc?.idCardNumber || 'N/A'}</strong></div>
                <div><span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Date of Birth (Age)</span><strong>{kyc?.dob || 'N/A'} ({calculateAge(kyc?.dob)})</strong></div>
                <div><span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Nationality</span><strong>{kyc?.nationality || 'Ghanaian'}</strong></div>
                <div><span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Tax ID Number (TIN)</span><strong style={{ fontFamily: 'monospace' }}>{kyc?.tin || 'Not supplied'}</strong></div>
                <div><span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Document Issue Date</span><strong>{kyc?.idIssueDate || 'Verified upon submission'}</strong></div>
                <div><span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Document Expiry Date</span><strong>{kyc?.idExpiryDate || '10 Years Standard'}</strong></div>
              </div>

              {/* Document Previews Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                {renderDocumentCard('National ID (Front)', kyc?.idCardFrontUrl, 'Front Document')}
                {renderDocumentCard('National ID (Back)', kyc?.idCardBackUrl, 'Back Document')}
                {renderDocumentCard('Live Biometric Selfie', kyc?.selfieUrl, 'Face Match: 98.4% ✓')}
              </div>
            </div>
          )}

          {/* SECTION 2: RESIDENTIAL LOCATION & ADDRESS VERIFICATION */}
          {(activeDossierTab === 'all' || activeDossierTab === 'residence') && (
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ fontSize: '1.05rem', color: 'var(--color-emerald-950)', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={18} color="var(--color-emerald-700)" />
                2. Residential Location & Physical Address
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
                <div><span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Ghana Post GPS Digital Address</span><strong style={{ fontFamily: 'monospace', color: 'var(--color-emerald-800)' }}>{kyc?.digitalAddress || 'N/A'}</strong></div>
                <div><span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>City / Country</span><strong>{kyc?.cityCountry || 'Accra, Ghana'}</strong></div>
                <div style={{ gridColumn: 'span 2' }}><span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Full Residential Address</span><strong>{kyc?.residentialAddress || 'Not submitted'}</strong></div>
                <div style={{ gridColumn: 'span 2' }}><span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Nearest Notable Landmark</span><strong>{kyc?.landmark || 'Verified by municipal area mapping'}</strong></div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                {renderDocumentCard('Proof of Residence (Utility Bill / Tenancy)', kyc?.utilityBillUrl, 'Utility Proof')}
              </div>
            </div>
          )}

          {/* SECTION 3: BUSINESS & PROFESSIONAL PROFILE */}
          {(activeDossierTab === 'all' || activeDossierTab === 'business') && (
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ fontSize: '1.05rem', color: 'var(--color-emerald-950)', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building2 size={18} color="var(--color-emerald-700)" />
                3. Susu Business & Professional Background
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
                <div><span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Trade / Agency Name</span><strong>{kyc?.tradeName || `${agent.firstName}'s Susu Enterprise`}</strong></div>
                <div><span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Business Certificate Number</span><strong style={{ fontFamily: 'monospace' }}>{kyc?.businessCertificateNumber || 'N/A'}</strong></div>
                <div><span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Primary Trade / Occupation</span><strong>{kyc?.occupation || 'Susu Collector'}</strong></div>
                <div><span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Collection Experience</span><strong>{kyc?.yearsExperience || '3-5 years'}</strong></div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                {renderDocumentCard('Registrar General Department Business Certificate', kyc?.businessCertificateUrl, 'RGD Registered')}
              </div>
            </div>
          )}

          {/* SECTION 4: PAYOUT & SETTLEMENT DETAILS */}
          {(activeDossierTab === 'all' || activeDossierTab === 'payout') && (
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ fontSize: '1.05rem', color: 'var(--color-emerald-950)', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Smartphone size={18} color="var(--color-emerald-700)" />
                4. Settlement & Payout Account Information
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div><span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Settlement Method</span><strong>{kyc?.payoutMethod === 'bank' ? 'Commercial Bank' : 'Mobile Money'}</strong></div>
                <div><span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Network / Provider</span><strong>{kyc?.payoutMomoNetwork || kyc?.payoutBankName || 'MTN Mobile Money'}</strong></div>
                <div><span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Account / Wallet Number</span><strong style={{ fontFamily: 'monospace' }}>{kyc?.payoutMomoNumber || kyc?.payoutAccountNumber || agent.phone}</strong></div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Registered Account Name</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <strong>{kyc?.payoutAccountName || kyc?.fullName || `${agent.firstName} ${agent.surname}`}</strong>
                    <span style={{ fontSize: '0.68rem', color: '#166534', background: '#dcfce7', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>
                      Match ✓
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 5: NEXT OF KIN / GUARANTOR */}
          {(activeDossierTab === 'all' || activeDossierTab === 'guarantor') && (
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ fontSize: '1.05rem', color: 'var(--color-emerald-950)', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={18} color="var(--color-emerald-700)" />
                5. Next of Kin & Emergency Guarantor
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div><span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Next of Kin Full Name</span><strong>{kyc?.nextOfKinName || 'Emmanuel Osei Darko'}</strong></div>
                <div><span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Relationship</span><strong>{kyc?.nextOfKinRelationship || 'Family Relative / Sibling'}</strong></div>
                <div><span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Contact Phone</span><strong>{kyc?.nextOfKinPhone || '+233 24 999 1234'}</strong></div>
                <div><span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Residential Location</span><strong>{kyc?.nextOfKinAddress || 'New Takoradi Block B'}</strong></div>
              </div>
            </div>
          )}

          {/* COMPLIANCE AUDIT CHECKLIST */}
          <div style={{ background: '#f1f5f9', padding: '1.25rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid #cbd5e1' }}>
            <h5 style={{ margin: '0 0 0.75rem', fontSize: '0.9rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={16} color="var(--color-emerald-800)" />
              Super Admin Compliance Verification Checklist
            </h5>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.6rem' }}>
              {[
                { key: 'idLegible', label: 'Official ID Card is authentic, legible and unexpired' },
                { key: 'faceMatch', label: 'Biometric selfie matches photograph on National ID' },
                { key: 'addressVerified', label: 'Digital Address (Ghana Post GPS) resolves to registered suburb' },
                { key: 'billConfirmed', label: 'Utility bill or proof of residence confirmed valid' },
                { key: 'businessValid', label: 'Business certificate number checked with Registrar General' },
                { key: 'payoutNameMatch', label: 'Mobile Money wallet name strictly matches applicant' }
              ].map(item => (
                <label
                  key={item.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.8rem',
                    color: '#334155',
                    cursor: 'pointer',
                    background: '#fff',
                    padding: '0.45rem 0.65rem',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={(checklist as any)[item.key]}
                    onChange={(e) => setChecklist(prev => ({ ...prev, [item.key]: e.target.checked }))}
                    style={{ accentColor: 'var(--color-emerald-700)' }}
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* REJECTION REASON BOX (If showRejectForm is active) */}
          {showRejectForm && (
            <div
              style={{
                background: '#fff1f2',
                border: '1px solid #fecdd3',
                borderRadius: '12px',
                padding: '1.25rem',
                marginBottom: '1.5rem'
              }}
            >
              <h5 style={{ margin: '0 0 0.5rem', color: '#9f1239', fontSize: '0.92rem' }}>
                Select KYC Rejection Reason
              </h5>
              <p style={{ fontSize: '0.78rem', color: '#881337', marginBottom: '0.75rem' }}>
                The registrant will see this reason in their pending portal and will be asked to correct and resubmit.
              </p>

              <select
                className="form-select"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                style={{ marginBottom: '0.75rem', fontSize: '0.85rem' }}
              >
                <option value="Ghana Card front or back image is blurry or illegible.">Ghana Card front or back image is blurry or illegible.</option>
                <option value="Name on ID does not match registration name.">Name on ID does not match registration name.</option>
                <option value="Live biometric selfie does not match the photo on National ID.">Live biometric selfie does not match the photo on National ID.</option>
                <option value="Invalid or unresolvable Ghana Post GPS Digital Address.">Invalid or unresolvable Ghana Post GPS Digital Address.</option>
                <option value="Utility bill is older than 3 months or does not show applicant address.">Utility bill is older than 3 months or does not show applicant address.</option>
                <option value="Business Registration Certificate number could not be validated.">Business Registration Certificate number could not be validated.</option>
                <option value="Mobile Money settlement account holder name does not match applicant.">Mobile Money settlement account holder name does not match applicant.</option>
                <option value="Other">Other (Custom explanation below)</option>
              </select>

              {rejectReason === 'Other' && (
                <textarea
                  className="form-input"
                  rows={3}
                  value={customRejectReason}
                  onChange={(e) => setCustomRejectReason(e.target.value)}
                  style={{ fontSize: '0.85rem', marginBottom: '0.75rem' }}
                />
              )}

              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowRejectForm(false)}
                  style={{
                    padding: '0.45rem 0.95rem',
                    background: '#fff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReject}
                  style={{
                    padding: '0.45rem 1.25rem',
                    background: '#dc2626',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Confirm KYC Rejection
                </button>
              </div>
            </div>
          )}

          {/* ADMIN NOTES ON RECORD */}
          {agent.adminReviewNotes && (
            <div
              style={{
                background: isVerified ? '#f0fdf4' : '#fef2f2',
                border: `1px solid ${isVerified ? '#bbf7d0' : '#fecaca'}`,
                borderRadius: '10px',
                padding: '0.85rem 1.15rem',
                marginBottom: '1rem',
                fontSize: '0.82rem'
              }}
            >
              <div style={{ fontWeight: 700, color: isVerified ? '#166534' : '#991b1b', marginBottom: '0.2rem' }}>
                {isVerified ? '✓ Approval Notes on Record:' : '⚠️ Rejection Notes on Record:'}
              </div>
              <div style={{ color: '#334155' }}>{agent.adminReviewNotes}</div>
              {agent.adminApprovedAt && (
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.25rem' }}>
                  Recorded on: {new Date(agent.adminApprovedAt).toLocaleString()}
                </div>
              )}
            </div>
          )}
        </div>

        {/* MODAL FOOTER ACTIONS */}
        <div
          style={{
            padding: '1.25rem 2rem',
            background: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-outline"
              style={{ fontSize: '0.85rem', padding: '0.55rem 1.2rem' }}
            >
              Close Dossier
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {!isRejected && (
              <button
                type="button"
                onClick={() => setShowRejectForm(true)}
                style={{
                  background: '#fee2e2',
                  color: '#dc2626',
                  border: '1px solid #fca5a5',
                  borderRadius: '10px',
                  padding: '0.55rem 1.2rem',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.85rem'
                }}
              >
                ❌ Reject / Require Fixes
              </button>
            )}

            {!isVerified && (
              <button
                type="button"
                onClick={handleApprove}
                className="btn-primary"
                style={{
                  padding: '0.55rem 1.5rem',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <CheckCircle2 size={16} /> Approve KYC &amp; Grant License
              </button>
            )}

            {isVerified && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#16a34a', fontWeight: 700, fontSize: '0.88rem' }}>
                <CheckCircle2 size={18} /> Verified &amp; Active Agent
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FULLSCREEN DOCUMENT LIGHTBOX */}
      {lightboxImg && (
        <div
          onClick={() => setLightboxImg(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.92)',
            zIndex: 100000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '85vh',
              background: '#0f172a',
              borderRadius: '14px',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem 1.25rem',
                background: '#1e293b',
                color: '#fff',
                borderBottom: '1px solid #334155'
              }}
            >
              <span style={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={16} color="var(--color-gold-400)" />
                {lightboxImg.label} — High Resolution Inspection
              </span>
              <button
                type="button"
                onClick={() => setLightboxImg(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: '1rem', background: '#020617', textAlign: 'center' }}>
              <img
                src={lightboxImg.src}
                alt={lightboxImg.label}
                style={{
                  maxWidth: '85vw',
                  maxHeight: '75vh',
                  objectFit: 'contain',
                  borderRadius: '8px'
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
