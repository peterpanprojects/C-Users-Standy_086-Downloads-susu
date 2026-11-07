import React, { useState, useEffect } from 'react';
import { useSusu } from '../../context/SusuContext';
import { X, UserCheck, Save } from 'lucide-react';
import { AgentKycData, AgentAccount } from '../../types/susu';
import { ProfilePictureUpload } from '../common/ProfilePictureUpload';

interface EditAgentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent?: AgentAccount | null;
}

export const EditAgentProfileModal: React.FC<EditAgentProfileModalProps> = ({ isOpen, onClose, agent }) => {
  const { agentAccount, updateAgentKyc, updateAgentAccount } = useSusu();
  const targetAgent = agent || agentAccount;
  const kyc = targetAgent.kycData;

  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('female');
  const [nationality, setNationality] = useState('Ghanaian');
  const [tin, setTin] = useState('');
  const [idCardType, setIdCardType] = useState<'ecowas_card' | 'passport'>('ecowas_card');
  const [idCardNumber, setIdCardNumber] = useState('');
  const [cityCountry, setCityCountry] = useState('Accra, Ghana');
  const [digitalAddress, setDigitalAddress] = useState('');
  const [residentialAddress, setResidentialAddress] = useState('');
  const [tradeName, setTradeName] = useState('');
  const [occupation, setOccupation] = useState('');
  const [maritalStatus, setMaritalStatus] = useState<'single' | 'married' | 'divorced' | 'widowed'>('single');
  const [businessCert, setBusinessCert] = useState('');
  const [payoutMomoNetwork, setPayoutMomoNetwork] = useState('MTN');
  const [payoutMomoNumber, setPayoutMomoNumber] = useState('');
  const [nextOfKinName, setNextOfKinName] = useState('');
  const [nextOfKinPhone, setNextOfKinPhone] = useState('');
  const [status, setStatus] = useState<'verified' | 'pending_verification'>('verified');
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFullName(kyc?.fullName || `${targetAgent.firstName} ${targetAgent.surname}`.trim() || 'Agent Organizer');
      setDob(kyc?.dob || '1988-06-14');
      setGender(kyc?.gender || 'female');
      setNationality(kyc?.nationality || 'Ghanaian');
      setTin(kyc?.tin || '');
      setIdCardType(kyc?.idCardType === 'passport' ? 'passport' : 'ecowas_card');
      setIdCardNumber(kyc?.idCardNumber || 'GHA-719283019-2');
      setCityCountry(kyc?.cityCountry || 'Accra, Ghana');
      setDigitalAddress(kyc?.digitalAddress || 'GA-183-9022');
      setResidentialAddress(kyc?.residentialAddress || 'House 14, Ring Road Central, Kokomlemle, Accra');
      setTradeName(kyc?.tradeName || '');
      setOccupation(kyc?.occupation || 'Microfinance Officer & Agent');
      setMaritalStatus(kyc?.maritalStatus || 'married');
      setBusinessCert(kyc?.businessCertificateNumber || 'BN-2024-88192');
      setPayoutMomoNetwork(kyc?.payoutMomoNetwork || 'MTN');
      setPayoutMomoNumber(kyc?.payoutMomoNumber || targetAgent.phone || '');
      setNextOfKinName(kyc?.nextOfKinName || '');
      setNextOfKinPhone(kyc?.nextOfKinPhone || '');
      setStatus(kyc?.status || 'verified');
      setAvatarUrl(targetAgent.avatarUrl || kyc?.selfieUrl || '');
    }
  }, [isOpen, kyc, targetAgent]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedKyc: Partial<AgentKycData> = {
      fullName: fullName.trim(),
      dob,
      gender,
      nationality: nationality.trim(),
      tin: tin.trim(),
      idCardType,
      idCardNumber: idCardNumber.trim(),
      cityCountry: cityCountry.trim(),
      digitalAddress: digitalAddress.trim(),
      residentialAddress: residentialAddress.trim(),
      tradeName: tradeName.trim(),
      occupation: occupation.trim(),
      maritalStatus,
      businessCertificateNumber: businessCert.trim(),
      payoutMomoNetwork,
      payoutMomoNumber: payoutMomoNumber.trim(),
      nextOfKinName: nextOfKinName.trim(),
      nextOfKinPhone: nextOfKinPhone.trim(),
      status,
      selfieUrl: avatarUrl
    };
    updateAgentAccount(targetAgent.id, { avatarUrl });
    updateAgentKyc(targetAgent.id, updatedKyc);
    onClose();
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div className="modal-content" style={{ maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--color-slate-200)', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ background: 'var(--color-gold-100)', padding: '0.4rem', borderRadius: '8px' }}>
              <UserCheck size={20} color="var(--color-gold-800)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', margin: 0, color: 'var(--color-emerald-950)' }}>Edit Agent KYC &amp; Profile</h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--color-slate-500)' }}>Full identity, biometrics, and verification records</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-slate-400)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <ProfilePictureUpload
              currentAvatarUrl={avatarUrl}
              fallbackName={fullName || `${targetAgent.firstName} ${targetAgent.surname}`}
              onAvatarChange={setAvatarUrl}
              size={76}
              title="Agent Profile Photo"
              subtitle="Upload official agent identification photo"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-slate-700)', display: 'block', marginBottom: '0.35rem' }}>
                Full Legal Name
              </label>
              <input
                type="text"
                className="input-field"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-slate-700)', display: 'block', marginBottom: '0.35rem' }}>
                Date of Birth
              </label>
              <input
                type="date"
                className="input-field"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-slate-700)', display: 'block', marginBottom: '0.35rem' }}>
                Gender
              </label>
              <select
                className="input-field"
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-slate-700)', display: 'block', marginBottom: '0.35rem' }}>
                Nationality
              </label>
              <input
                type="text"
                className="input-field"
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-slate-700)', display: 'block', marginBottom: '0.35rem' }}>
                Tax ID (TIN)
              </label>
              <input
                type="text"
                className="input-field"
                value={tin}
                onChange={(e) => setTin(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-slate-700)', display: 'block', marginBottom: '0.35rem' }}>
                ID Card Type
              </label>
              <select
                className="input-field"
                value={idCardType}
                onChange={(e) => setIdCardType(e.target.value as any)}
              >
                <option value="ecowas_card">Ghana Card (ECOWAS)</option>
                <option value="passport">Passport</option>
              </select>
            </div>
            <div className="form-group">
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-slate-700)', display: 'block', marginBottom: '0.35rem' }}>
                ID Card Number
              </label>
              <input
                type="text"
                className="input-field"
                value={idCardNumber}
                onChange={(e) => setIdCardNumber(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-slate-700)', display: 'block', marginBottom: '0.35rem' }}>
                City &amp; Country
              </label>
              <input
                type="text"
                className="input-field"
                value={cityCountry}
                onChange={(e) => setCityCountry(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-slate-700)', display: 'block', marginBottom: '0.35rem' }}>
                GhanaPost Digital Address
              </label>
              <input
                type="text"
                className="input-field"
                value={digitalAddress}
                onChange={(e) => setDigitalAddress(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-slate-700)', display: 'block', marginBottom: '0.35rem' }}>
              Residential Physical Address
            </label>
            <input
              type="text"
              className="input-field"
              value={residentialAddress}
              onChange={(e) => setResidentialAddress(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-slate-700)', display: 'block', marginBottom: '0.35rem' }}>
                Trade / Susu Name
              </label>
              <input
                type="text"
                className="input-field"
                value={tradeName}
                onChange={(e) => setTradeName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-slate-700)', display: 'block', marginBottom: '0.35rem' }}>
                Occupation
              </label>
              <input
                type="text"
                className="input-field"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-slate-700)', display: 'block', marginBottom: '0.35rem' }}>
                Business Cert. No.
              </label>
              <input
                type="text"
                className="input-field"
                value={businessCert}
                onChange={(e) => setBusinessCert(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-slate-700)', display: 'block', marginBottom: '0.35rem' }}>
                MoMo Network
              </label>
              <select
                className="input-field"
                value={payoutMomoNetwork}
                onChange={(e) => setPayoutMomoNetwork(e.target.value)}
              >
                <option value="MTN">MTN Mobile Money</option>
                <option value="Telecel">Telecel Cash</option>
                <option value="AirtelTigo">AT Money</option>
              </select>
            </div>
            <div className="form-group">
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-slate-700)', display: 'block', marginBottom: '0.35rem' }}>
                MoMo Settlement Number
              </label>
              <input
                type="text"
                className="input-field"
                value={payoutMomoNumber}
                onChange={(e) => setPayoutMomoNumber(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-slate-700)', display: 'block', marginBottom: '0.35rem' }}>
                Next of Kin Full Name
              </label>
              <input
                type="text"
                className="input-field"
                value={nextOfKinName}
                onChange={(e) => setNextOfKinName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-slate-700)', display: 'block', marginBottom: '0.35rem' }}>
                Next of Kin Contact Phone
              </label>
              <input
                type="text"
                className="input-field"
                value={nextOfKinPhone}
                onChange={(e) => setNextOfKinPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-slate-700)', display: 'block', marginBottom: '0.35rem' }}>
              Biometrics &amp; Profile Verification
            </label>
            <select
              className="input-field"
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
            >
              <option value="verified">Verified ✓</option>
              <option value="pending_verification">Pending Verification</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--color-slate-200)' }}>
            <button type="button" className="btn-secondary" onClick={onClose} style={{ padding: '0.5rem 1rem' }}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Save size={16} /> Save Profile Records
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
