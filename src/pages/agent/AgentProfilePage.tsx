import React, { useState, useEffect } from 'react';
import { useSusu } from '../../context/SusuContext';
import {
  ShieldCheck,
  UserCheck,
  Phone,
  Mail,
  Building2,
  CreditCard,
  MapPin,
  FileCheck2,
  Calendar,
  Save,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { ProfilePictureUpload } from '../../components/common/ProfilePictureUpload';

interface AgentProfilePageProps {
  onNavigate?: (path: string) => void;
}

export const AgentProfilePage: React.FC<AgentProfilePageProps> = ({ onNavigate }) => {
  const { agentAccount, updateAgentAccount, updateAgentKyc, myGroups } = useSusu();

  const kyc = agentAccount.kycData;
  const agentFullName = kyc?.fullName || `${agentAccount.firstName} ${agentAccount.surname}`.trim() || 'Agent Organizer';

  const [firstName, setFirstName] = useState(agentAccount.firstName || '');
  const [surname, setSurname] = useState(agentAccount.surname || '');
  const [phone, setPhone] = useState(agentAccount.phone || '');
  const [tradeName, setTradeName] = useState(kyc?.tradeName || '');
  const [payoutMomoNetwork, setPayoutMomoNetwork] = useState(kyc?.payoutMomoNetwork || 'MTN');
  const [payoutMomoNumber, setPayoutMomoNumber] = useState(kyc?.payoutMomoNumber || agentAccount.phone || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setFirstName(agentAccount.firstName || '');
    setSurname(agentAccount.surname || '');
    setPhone(agentAccount.phone || '');
    setTradeName(kyc?.tradeName || '');
    setPayoutMomoNetwork(kyc?.payoutMomoNetwork || 'MTN');
    setPayoutMomoNumber(kyc?.payoutMomoNumber || agentAccount.phone || '');
  }, [agentAccount, kyc]);

  const handleAvatarChange = (newUrl: string) => {
    updateAgentAccount(agentAccount.id, { avatarUrl: newUrl });
    updateAgentKyc(agentAccount.id, { selfieUrl: newUrl });
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateAgentAccount(agentAccount.id, {
      firstName: firstName.trim(),
      surname: surname.trim(),
      phone: phone.trim()
    });
    updateAgentKyc(agentAccount.id, {
      fullName: `${firstName.trim()} ${surname.trim()}`.trim(),
      tradeName: tradeName.trim(),
      payoutMomoNetwork,
      payoutMomoNumber: payoutMomoNumber.trim()
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  const currentPhoto = agentAccount.avatarUrl || kyc?.selfieUrl;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(229, 169, 60, 0.2)', color: 'var(--color-gold-800)', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          <ShieldCheck size={14} color="#E5A93C" /> VERIFIED MERCHANT AGENT
        </div>
        <h1 style={{ fontSize: '2.1rem', margin: 0, fontFamily: 'var(--font-heading)' }}>
          Agent Profile & Credentials
        </h1>
        <p style={{ color: 'var(--color-slate-600)', fontSize: '0.95rem', marginTop: '0.35rem' }}>
          Manage your official profile photo, agency trade identity, and merchant disbursement credentials.
        </p>
      </div>

      {savedSuccess && (
        <div
          style={{
            padding: '0.85rem 1.25rem',
            background: 'var(--color-emerald-50)',
            border: '1px solid var(--color-emerald-300)',
            borderRadius: '10px',
            color: 'var(--color-emerald-950)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            fontSize: '0.9rem',
            fontWeight: 600
          }}
        >
          <CheckCircle2 size={20} color="var(--color-emerald-700)" />
          <span>Agent profile and contact credentials updated successfully!</span>
        </div>
      )}

      {/* Profile Picture Upload Card */}
      <ProfilePictureUpload
        currentAvatarUrl={currentPhoto}
        fallbackName={agentFullName}
        onAvatarChange={handleAvatarChange}
        title="Official Agent Profile Photo"
        subtitle="This picture is displayed to your circle members, ledger receipts, and support chat."
        roleLabel="Licensed Agent Organizer"
        size={104}
      />

      {/* Agent Identity & Credentials Card */}
      <div className="card" style={{ marginBottom: '1.75rem', padding: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--color-slate-200)', paddingBottom: '1.25rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                overflow: 'hidden',
                background: 'var(--color-emerald-950)',
                border: '2px solid var(--color-gold-400)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 800,
                color: 'var(--color-gold-400)',
                flexShrink: 0
              }}
            >
              {currentPhoto ? (
                <img src={currentPhoto} alt={agentFullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                agentFullName.charAt(0)
              )}
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', margin: 0, color: 'var(--color-emerald-950)' }}>
                {agentFullName}
              </h2>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-slate-600)' }}>
                {tradeName || 'Susu Micro-Savings Enterprise'}
              </span>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: '#ecfdf5',
                color: '#047857',
                border: '1px solid #a7f3d0',
                padding: '0.3rem 0.75rem',
                borderRadius: '999px',
                fontSize: '0.78rem',
                fontWeight: 700
              }}
            >
              <FileCheck2 size={13} /> {agentAccount.licenseNumber || 'SUSU-AGT-VERIFIED'}
            </span>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)', marginTop: '0.3rem' }}>
              Managing {myGroups.length} Susu Circle{myGroups.length === 1 ? '' : 's'}
            </div>
          </div>
        </div>

        {/* Form to update contact and trade details */}
        <form onSubmit={handleSaveProfile}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">First Name *</label>
              <input
                type="text"
                className="form-input"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Surname *</label>
              <input
                type="text"
                className="form-input"
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="tel"
                  className="form-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
                <Phone size={16} style={{ position: 'absolute', right: '12px', top: '13px', color: '#94a3b8' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address (Login)</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="form-input"
                  value={agentAccount.email}
                  disabled
                  style={{ background: 'var(--color-slate-100)', color: 'var(--color-slate-600)' }}
                />
                <Mail size={16} style={{ position: 'absolute', right: '12px', top: '13px', color: '#94a3b8' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Business / Agency Trade Name</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  value={tradeName}
                  onChange={(e) => setTradeName(e.target.value)}
                />
                <Building2 size={16} style={{ position: 'absolute', right: '12px', top: '13px', color: '#94a3b8' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Mobile Money Network</label>
              <select
                className="form-select"
                value={payoutMomoNetwork}
                onChange={(e) => setPayoutMomoNetwork(e.target.value)}
              >
                <option value="MTN">MTN MoMo</option>
                <option value="Telecel">Telecel Cash</option>
                <option value="AT">AT Money</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">MoMo Payout Number</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="tel"
                  className="form-input"
                  value={payoutMomoNumber}
                  onChange={(e) => setPayoutMomoNumber(e.target.value)}
                />
                <CreditCard size={16} style={{ position: 'absolute', right: '12px', top: '13px', color: '#94a3b8' }} />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--color-slate-100)' }}>
            <button type="submit" className="btn-gold" style={{ padding: '0.65rem 1.5rem', fontSize: '0.9rem' }}>
              <Save size={16} /> Save Profile Changes
            </button>
          </div>
        </form>
      </div>

      {/* KYC & Agency Records Overview */}
      <div className="card" style={{ padding: '1.75rem' }}>
        <h3 style={{ fontSize: '1.15rem', color: 'var(--color-emerald-950)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <UserCheck size={18} color="var(--color-emerald-700)" />
          Verified Biometrics & Agency Information
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.85rem' }}>
          <div style={{ background: 'var(--color-slate-50)', padding: '0.75rem 1rem', borderRadius: '8px' }}>
            <div style={{ color: 'var(--color-slate-500)', fontSize: '0.75rem', marginBottom: '0.2rem' }}>Digital Address</div>
            <strong>{kyc?.digitalAddress || 'GA-183-9022'}</strong>
          </div>

          <div style={{ background: 'var(--color-slate-50)', padding: '0.75rem 1rem', borderRadius: '8px' }}>
            <div style={{ color: 'var(--color-slate-500)', fontSize: '0.75rem', marginBottom: '0.2rem' }}>Residential Address</div>
            <strong>{kyc?.residentialAddress || 'Accra Central, Ghana'}</strong>
          </div>

          <div style={{ background: 'var(--color-slate-50)', padding: '0.75rem 1rem', borderRadius: '8px' }}>
            <div style={{ color: 'var(--color-slate-500)', fontSize: '0.75rem', marginBottom: '0.2rem' }}>Identity Card Number</div>
            <strong>{kyc?.idCardNumber || 'GHA-719283019-2'}</strong>
          </div>

          <div style={{ background: 'var(--color-slate-50)', padding: '0.75rem 1rem', borderRadius: '8px' }}>
            <div style={{ color: 'var(--color-slate-500)', fontSize: '0.75rem', marginBottom: '0.2rem' }}>TIN Number</div>
            <strong>{kyc?.tin || 'P0018928410'}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
