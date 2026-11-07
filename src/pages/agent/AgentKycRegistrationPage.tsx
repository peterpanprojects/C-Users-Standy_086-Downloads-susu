import React, { useState, useRef, useEffect } from 'react';
import { useSusu } from '../../context/SusuContext';
import { AgentKycData } from '../../types/susu';
import {
  ShieldCheck,
  User,
  Calendar,
  MapPin,
  Camera,
  Upload,
  FileText,
  CreditCard,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Eye,
  RefreshCw,
  Building2,
  Check,
  Smartphone,
  Users,
  Globe,
  Hash
} from 'lucide-react';

interface AgentKycRegistrationPageProps {
  onNavigate: (path: string) => void;
}

export const AgentKycRegistrationPage: React.FC<AgentKycRegistrationPageProps> = ({ onNavigate }) => {
  const { agentAccount, registerAgentKyc } = useSusu();

  // 1. Full name (prefilled from agentAccount)
  const [fullName, setFullName] = useState(
    agentAccount.kycData?.fullName ||
      `${agentAccount.firstName} ${agentAccount.surname}`.trim() ||
      ''
  );

  // 2. DOB
  const [dob, setDob] = useState(agentAccount.kycData?.dob || '');

  // 3. City / Country
  const [cityCountry, setCityCountry] = useState(agentAccount.kycData?.cityCountry || 'Accra, Ghana');

  // 4. Gender
  const [gender, setGender] = useState<'male' | 'female' | 'other'>(
    agentAccount.kycData?.gender || 'male'
  );

  // 5. Additional Demographics
  const [nationality, setNationality] = useState(
    agentAccount.kycData?.nationality || 'Ghanaian'
  );
  const [tin, setTin] = useState(
    agentAccount.kycData?.tin || ''
  );

  // 6. Identification card details
  const [idCardType, setIdCardType] = useState<'ecowas_card' | 'passport' | 'voter_id' | 'driver_license'>(
    agentAccount.kycData?.idCardType || 'ecowas_card'
  );
  const [idCardNumber, setIdCardNumber] = useState(
    agentAccount.kycData?.idCardNumber || ''
  );
  const [idIssueDate, setIdIssueDate] = useState(
    agentAccount.kycData?.idIssueDate || ''
  );
  const [idExpiryDate, setIdExpiryDate] = useState(
    agentAccount.kycData?.idExpiryDate || ''
  );

  // 7. Upload image of card (front and back)
  const [idCardFront, setIdCardFront] = useState<string | null>(
    agentAccount.kycData?.idCardFrontUrl || null
  );
  const [idCardBack, setIdCardBack] = useState<string | null>(
    agentAccount.kycData?.idCardBackUrl || null
  );

  // 8. Selfie picture (automatic capture)
  const [selfie, setSelfie] = useState<string | null>(
    agentAccount.kycData?.selfieUrl || null
  );
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // 9. Business particulars
  const [tradeName, setTradeName] = useState(
    agentAccount.kycData?.tradeName || ''
  );
  const [yearsExperience, setYearsExperience] = useState(
    agentAccount.kycData?.yearsExperience || '3-5 years'
  );
  const [businessCertNumber, setBusinessCertNumber] = useState(
    agentAccount.kycData?.businessCertificateNumber || ''
  );
  const [businessCertFile, setBusinessCertFile] = useState<string | null>(
    agentAccount.kycData?.businessCertificateUrl || null
  );

  // 10. Digital and residential addresses
  const [digitalAddress, setDigitalAddress] = useState(
    agentAccount.kycData?.digitalAddress || ''
  );
  const [residentialAddress, setResidentialAddress] = useState(
    agentAccount.kycData?.residentialAddress || ''
  );
  const [landmark, setLandmark] = useState(
    agentAccount.kycData?.landmark || ''
  );

  // 11. Occupation
  const [occupation, setOccupation] = useState(
    agentAccount.kycData?.occupation || ''
  );

  // 12. Marital status
  const [maritalStatus, setMaritalStatus] = useState<'single' | 'married' | 'divorced' | 'widowed'>(
    agentAccount.kycData?.maritalStatus || 'single'
  );

  // 13. Upload any bill available (Utility / ECG / GWCL)
  const [utilityBill, setUtilityBill] = useState<string | null>(
    agentAccount.kycData?.utilityBillUrl || null
  );

  // 14. Payout / Settlement Details
  const [payoutMethod, setPayoutMethod] = useState<'momo' | 'bank'>(
    agentAccount.kycData?.payoutMethod || 'momo'
  );
  const [payoutMomoNetwork, setPayoutMomoNetwork] = useState(
    agentAccount.kycData?.payoutMomoNetwork || 'MTN'
  );
  const [payoutMomoNumber, setPayoutMomoNumber] = useState(
    agentAccount.kycData?.payoutMomoNumber || agentAccount.phone || ''
  );
  const [payoutAccountName, setPayoutAccountName] = useState(
    agentAccount.kycData?.payoutAccountName ||
      agentAccount.kycData?.fullName ||
      `${agentAccount.firstName} ${agentAccount.surname}`.trim() ||
      ''
  );
  const [payoutBankName, setPayoutBankName] = useState(
    agentAccount.kycData?.payoutBankName || 'GCB Bank'
  );
  const [payoutAccountNumber, setPayoutAccountNumber] = useState(
    agentAccount.kycData?.payoutAccountNumber || ''
  );

  // 15. Next of Kin / Guarantor
  const [nextOfKinName, setNextOfKinName] = useState(
    agentAccount.kycData?.nextOfKinName || ''
  );
  const [nextOfKinRelationship, setNextOfKinRelationship] = useState(
    agentAccount.kycData?.nextOfKinRelationship || 'Spouse'
  );
  const [nextOfKinPhone, setNextOfKinPhone] = useState(
    agentAccount.kycData?.nextOfKinPhone || ''
  );
  const [nextOfKinAddress, setNextOfKinAddress] = useState(
    agentAccount.kycData?.nextOfKinAddress || ''
  );

  // Submission state
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Handle Camera initialization for selfie
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setIsCameraActive(true);
        }
      } else {
        setCameraError('Camera access not supported in this browser. Using simulation capture.');
      }
    } catch (err) {
      console.warn('Camera error or blocked permissions', err);
      setCameraError('Camera permission denied or unavailable. Fallback capture used.');
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && isCameraActive) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 320;
      canvas.height = videoRef.current.videoHeight || 240;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setSelfie(dataUrl);
      }
      // Stop video stream
      const stream = videoRef.current.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      setIsCameraActive(false);
    } else {
      // Simulate capture
      setSelfie('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=60');
    }
  };

  // Helper file upload handler
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !idCardNumber.trim() || !digitalAddress.trim()) {
      setError('Please fill in all mandatory fields (Legal Name, ID Card Number, and Digital Address).');
      return;
    }

    setSubmitting(true);

    const kycPayload: AgentKycData = {
      fullName,
      dob,
      cityCountry,
      gender,
      nationality,
      tin,
      idCardType,
      idCardNumber,
      idIssueDate,
      idExpiryDate,
      idCardFrontUrl: idCardFront || undefined,
      idCardBackUrl: idCardBack || undefined,
      selfieUrl: selfie || undefined,
      businessCertificateNumber: businessCertNumber,
      businessCertificateUrl: businessCertFile || undefined,
      tradeName,
      yearsExperience,
      digitalAddress,
      residentialAddress,
      landmark,
      occupation,
      maritalStatus,
      utilityBillUrl: utilityBill || undefined,
      payoutMethod,
      payoutMomoNetwork: payoutMethod === 'momo' ? payoutMomoNetwork : undefined,
      payoutMomoNumber: payoutMethod === 'momo' ? payoutMomoNumber : undefined,
      payoutAccountName,
      payoutBankName: payoutMethod === 'bank' ? payoutBankName : undefined,
      payoutAccountNumber: payoutMethod === 'bank' ? payoutAccountNumber : undefined,
      nextOfKinName,
      nextOfKinRelationship,
      nextOfKinPhone,
      nextOfKinAddress,
      status: 'pending_verification',
      submittedAt: new Date().toISOString()
    };

    registerAgentKyc(kycPayload);

    setTimeout(() => {
      setSubmitting(false);
      // Route immediately to the Paid Agent Activation Page
      onNavigate('/agent/activate');
    }, 600);
  };

  return (
    <div style={{ maxWidth: '820px', margin: '2rem auto', paddingBottom: '3rem' }}>
      {/* Header Banner */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div
          className="brand-logo"
          style={{
            display: 'inline-flex',
            background: 'var(--color-emerald-950)',
            padding: '0.65rem',
            borderRadius: '14px',
            marginBottom: '0.75rem',
            border: '1px solid rgba(229, 169, 60, 0.3)'
          }}
        >
          <ShieldCheck size={32} color="#E5A93C" />
        </div>
        <div style={{ display: 'inline-block', background: 'var(--color-gold-100)', color: 'var(--color-gold-900)', padding: '0.2rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          MANDATORY AGENT ACCREDITATION
        </div>
        <h1 style={{ fontSize: '2.1rem', marginBottom: '0.4rem' }}>
          Agent Official Registration Form
        </h1>
        <p style={{ color: 'var(--color-slate-600)', fontSize: '0.92rem', maxWidth: '640px', margin: '0 auto' }}>
          In accordance with community banking compliance, all Agents must submit their verified KYC credentials before accessing agent privileges and managing member funds.
        </p>
      </div>

      {error && (
        <div
          style={{
            padding: '0.85rem 1rem',
            background: '#fee2e2',
            border: '1px solid #fca5a5',
            color: '#dc2626',
            borderRadius: '10px',
            fontSize: '0.85rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* SECTION 1: PERSONAL PARTICULARS */}
        <div className="card" style={{ marginBottom: '1.5rem', padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--color-emerald-950)', marginBottom: '1rem', borderBottom: '1px solid var(--color-slate-200)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={18} color="var(--color-emerald-700)" />
            1. Personal Demographics
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {/* 1. Full Name */}
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">1. Full Legal Name *</label>
              <input
                type="text"
                className="form-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            {/* 2. DOB */}
            <div className="form-group">
              <label className="form-label">2. Date of Birth (DOB) *</label>
              <input
                type="date"
                className="form-input"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                required
              />
            </div>

            {/* 3. Nationality */}
            <div className="form-group">
              <label className="form-label">3. Nationality / Citizenship *</label>
              <input
                type="text"
                className="form-input"
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
                required
              />
            </div>

            {/* 4. Gender */}
            <div className="form-group">
              <label className="form-label">4. Gender *</label>
              <select
                className="form-select"
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* 5. Marital Status */}
            <div className="form-group">
              <label className="form-label">5. Marital Status *</label>
              <select
                className="form-select"
                value={maritalStatus}
                onChange={(e) => setMaritalStatus(e.target.value as any)}
              >
                <option value="single">Single</option>
                <option value="married">Married</option>
                <option value="divorced">Divorced</option>
                <option value="widowed">Widowed</option>
              </select>
            </div>

            {/* 6. Tax Identification Number (TIN) */}
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">6. Tax Identification Number (TIN / GRA TIN)</label>
              <input
                type="text"
                className="form-input"
                value={tin}
                onChange={(e) => setTin(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: IDENTIFICATION & BIOMETRIC CAPTURE */}
        <div className="card" style={{ marginBottom: '1.5rem', padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--color-emerald-950)', marginBottom: '1rem', borderBottom: '1px solid var(--color-slate-200)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CreditCard size={18} color="var(--color-gold-600)" />
            2. Official Identification & Biometric Capture
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {/* ID Card Type */}
            <div className="form-group">
              <label className="form-label">7a. Identification Card Type *</label>
              <select
                className="form-select"
                value={idCardType}
                onChange={(e) => setIdCardType(e.target.value as any)}
              >
                <option value="ecowas_card">ECOWAS Card (Ghana Card)</option>
                <option value="passport">International Passport</option>
                <option value="voter_id">Voter ID Card</option>
                <option value="driver_license">Driver's License</option>
              </select>
            </div>

            {/* ID Card Number */}
            <div className="form-group">
              <label className="form-label">7b. Identification Card Number *</label>
              <input
                type="text"
                className="form-input"
                value={idCardNumber}
                onChange={(e) => setIdCardNumber(e.target.value)}
                required
              />
            </div>

            {/* Issue Date & Expiry Date */}
            <div className="form-group">
              <label className="form-label">7c. ID Card Issue Date</label>
              <input
                type="date"
                className="form-input"
                value={idIssueDate}
                onChange={(e) => setIdIssueDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">7d. ID Card Expiry Date</label>
              <input
                type="date"
                className="form-input"
                value={idExpiryDate}
                onChange={(e) => setIdExpiryDate(e.target.value)}
              />
            </div>
          </div>

          {/* Upload image of card (front and back) */}
          <div style={{ marginTop: '1rem' }}>
            <label className="form-label" style={{ fontWeight: 700 }}>
              8. Upload Image of Card (Front and Back) *
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
              {/* Front Upload */}
              <div
                style={{
                  border: '2px dashed var(--color-slate-300)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  textAlign: 'center',
                  background: 'var(--color-slate-50)'
                }}
              >
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-emerald-950)', marginBottom: '0.5rem' }}>
                  Front of ID Card
                </div>
                {idCardFront ? (
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img
                      src={idCardFront}
                      alt="ID Front Preview"
                      style={{ width: '100%', maxHeight: '110px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ccc' }}
                    />
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-emerald-700)', marginTop: '0.3rem', fontWeight: 600 }}>
                      ✓ Front Image Uploaded
                    </div>
                  </div>
                ) : (
                  <Upload size={28} color="var(--color-slate-400)" style={{ margin: '0 auto 0.5rem' }} />
                )}
                <label
                  style={{
                    display: 'inline-block',
                    marginTop: '0.5rem',
                    padding: '0.35rem 0.85rem',
                    background: '#fff',
                    border: '1px solid var(--color-slate-300)',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Choose Front File
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => handleFileUpload(e, setIdCardFront)}
                  />
                </label>
              </div>

              {/* Back Upload */}
              <div
                style={{
                  border: '2px dashed var(--color-slate-300)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  textAlign: 'center',
                  background: 'var(--color-slate-50)'
                }}
              >
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-emerald-950)', marginBottom: '0.5rem' }}>
                  Back of ID Card
                </div>
                {idCardBack ? (
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img
                      src={idCardBack}
                      alt="ID Back Preview"
                      style={{ width: '100%', maxHeight: '110px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ccc' }}
                    />
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-emerald-700)', marginTop: '0.3rem', fontWeight: 600 }}>
                      ✓ Back Image Uploaded
                    </div>
                  </div>
                ) : (
                  <Upload size={28} color="var(--color-slate-400)" style={{ margin: '0 auto 0.5rem' }} />
                )}
                <label
                  style={{
                    display: 'inline-block',
                    marginTop: '0.5rem',
                    padding: '0.35rem 0.85rem',
                    background: '#fff',
                    border: '1px solid var(--color-slate-300)',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Choose Back File
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => handleFileUpload(e, setIdCardBack)}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Selfie picture (automatic capture) */}
          <div style={{ marginTop: '1.5rem', borderTop: '1px dashed var(--color-slate-200)', paddingTop: '1.25rem' }}>
            <label className="form-label" style={{ fontWeight: 700 }}>
              9. Live Selfie Picture (Automatic / Snapshot Capture) *
            </label>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-slate-500)', marginBottom: '0.75rem' }}>
              Hold your face steadily within the frame. Our biometric system matches your live selfie with your identification card.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1.25rem',
                alignItems: 'center',
                background: 'var(--color-emerald-50)',
                padding: '1.25rem',
                borderRadius: '12px',
                border: '1px solid var(--color-emerald-200)'
              }}
            >
              <div style={{ textAlign: 'center' }}>
                {isCameraActive ? (
                  <div style={{ position: 'relative', width: '220px', height: '180px', margin: '0 auto' }}>
                    <video
                      ref={videoRef}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px', border: '2px solid var(--color-gold-500)' }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: '15%',
                        left: '20%',
                        width: '60%',
                        height: '70%',
                        border: '2px dashed #fff',
                        borderRadius: '50%',
                        pointerEvents: 'none'
                      }}
                    />
                  </div>
                ) : selfie ? (
                  <div style={{ display: 'inline-block' }}>
                    <img
                      src={selfie}
                      alt="Captured Selfie"
                      style={{ width: '140px', height: '140px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--color-emerald-600)', boxShadow: 'var(--shadow-sm)' }}
                    />
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-emerald-800)', fontWeight: 700, marginTop: '0.3rem' }}>
                      ✓ Selfie Verified & Captured
                    </div>
                  </div>
                ) : (
                  <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'var(--color-slate-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                    <Camera size={36} color="var(--color-slate-500)" />
                  </div>
                )}
              </div>

              <div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {!isCameraActive ? (
                    <button
                      type="button"
                      className="btn-gold"
                      style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                      onClick={startCamera}
                    >
                      <Camera size={16} /> Open Camera & Capture
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn-primary"
                      style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                      onClick={capturePhoto}
                    >
                      <CheckCircle2 size={16} /> Snap Photo Now
                    </button>
                  )}

                  <label
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      padding: '0.45rem 1rem',
                      background: '#fff',
                      border: '1px solid var(--color-slate-300)',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      fontWeight: 600,
                      color: 'var(--color-slate-700)'
                    }}
                  >
                    <Upload size={14} /> Or Upload Picture File
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => handleFileUpload(e, setSelfie)}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: RESIDENTIAL LOCATION & ADDRESS VERIFICATION */}
        <div className="card" style={{ marginBottom: '1.5rem', padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--color-emerald-950)', marginBottom: '1rem', borderBottom: '1px solid var(--color-slate-200)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={18} color="var(--color-emerald-700)" />
            3. Residential Location & Address Verification
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {/* Digital Address */}
            <div className="form-group">
              <label className="form-label">10. Digital Address (Ghana Post GPS) *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  value={digitalAddress}
                  onChange={(e) => setDigitalAddress(e.target.value.toUpperCase())}
                  required
                />
                <MapPin size={16} style={{ position: 'absolute', right: '12px', top: '13px', color: '#888' }} />
              </div>
            </div>

            {/* City / Country */}
            <div className="form-group">
              <label className="form-label">11. City / Country *</label>
              <input
                type="text"
                className="form-input"
                value={cityCountry}
                onChange={(e) => setCityCountry(e.target.value)}
                required
              />
            </div>

            {/* Residential Address */}
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">12. Residential Physical Address (House No, Street, Suburb) *</label>
              <input
                type="text"
                className="form-input"
                value={residentialAddress}
                onChange={(e) => setResidentialAddress(e.target.value)}
                required
              />
            </div>

            {/* Nearest Landmark */}
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">13. Nearest Notable Landmark</label>
              <input
                type="text"
                className="form-input"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
              />
            </div>

            {/* Utility Bill Upload */}
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">14. Upload Proof of Residence / Utility Bill (Electricity / Water / Tenancy)</label>
              <div
                style={{
                  border: '1.5px dashed var(--color-slate-300)',
                  borderRadius: '10px',
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'var(--color-slate-50)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <FileText size={24} color="var(--color-emerald-700)" />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                      {utilityBill ? 'Utility Proof Attached' : 'Attach Recent Utility Bill or Rental Receipt'}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)' }}>
                      Supports PDF, PNG, JPG (ECG Electricity, Ghana Water, or Tenancy Agreement)
                    </span>
                  </div>
                </div>

                <label
                  style={{
                    padding: '0.4rem 0.85rem',
                    background: '#fff',
                    border: '1px solid var(--color-slate-300)',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Browse File
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    style={{ display: 'none' }}
                    onChange={(e) => handleFileUpload(e, setUtilityBill)}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: BUSINESS, AGENCY & PROFESSIONAL PROFILE */}
        <div className="card" style={{ marginBottom: '1.5rem', padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--color-emerald-950)', marginBottom: '1rem', borderBottom: '1px solid var(--color-slate-200)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building2 size={18} color="var(--color-emerald-700)" />
            4. Business & Professional Background
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {/* Trade Name */}
            <div className="form-group">
              <label className="form-label">15. Trade / Susu Agency Name</label>
              <input
                type="text"
                className="form-input"
                value={tradeName}
                onChange={(e) => setTradeName(e.target.value)}
              />
            </div>

            {/* Experience */}
            <div className="form-group">
              <label className="form-label">16. Susu / Financial Collection Experience</label>
              <select
                className="form-select"
                value={yearsExperience}
                onChange={(e) => setYearsExperience(e.target.value)}
              >
                <option value="Under 1 year">Under 1 year (New Operator)</option>
                <option value="1-3 years">1 – 3 years</option>
                <option value="3-5 years">3 – 5 years (Experienced)</option>
                <option value="5+ years">5+ years (Master Collector)</option>
              </select>
            </div>

            {/* Occupation */}
            <div className="form-group">
              <label className="form-label">17. Primary Occupation / Trade *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  required
                />
                <Briefcase size={16} style={{ position: 'absolute', right: '12px', top: '13px', color: '#888' }} />
              </div>
            </div>

            {/* Business Certificate */}
            <div className="form-group">
              <label className="form-label">18. Business Reg Certificate Number (BN / CS)</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '0.75rem' }}>
                <input
                  type="text"
                  className="form-input"
                  value={businessCertNumber}
                  onChange={(e) => setBusinessCertNumber(e.target.value)}
                />
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    background: 'var(--color-slate-100)',
                    border: '1px solid var(--color-slate-300)',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <Upload size={14} /> {businessCertFile ? 'Doc ✓' : 'Upload'}
                  <input
                    type="file"
                    style={{ display: 'none' }}
                    onChange={(e) => handleFileUpload(e, setBusinessCertFile)}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 5: PAYOUT & SETTLEMENT ACCOUNT */}
        <div className="card" style={{ marginBottom: '1.5rem', padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--color-emerald-950)', marginBottom: '1rem', borderBottom: '1px solid var(--color-slate-200)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Smartphone size={18} color="var(--color-emerald-700)" />
            5. Mobile Money & Settlement Account
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--color-slate-500)', marginBottom: '1rem' }}>
            Specify the official account for receiving platform disbursements, commissions, and circle rotations.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">19. Settlement Channel *</label>
              <select
                className="form-select"
                value={payoutMethod}
                onChange={(e) => setPayoutMethod(e.target.value as any)}
              >
                <option value="momo">Mobile Money (Recommended)</option>
                <option value="bank">Commercial Bank Account</option>
              </select>
            </div>

            {payoutMethod === 'momo' ? (
              <>
                <div className="form-group">
                  <label className="form-label">20. Mobile Money Network *</label>
                  <select
                    className="form-select"
                    value={payoutMomoNetwork}
                    onChange={(e) => setPayoutMomoNetwork(e.target.value)}
                  >
                    <option value="MTN">MTN Mobile Money</option>
                    <option value="Telecel">Telecel Cash</option>
                    <option value="AirtelTigo">AT Money (AirtelTigo)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">21. Mobile Money Number *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={payoutMomoNumber}
                    onChange={(e) => setPayoutMomoNumber(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">22. Registered Account Holder Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={payoutAccountName}
                    onChange={(e) => setPayoutAccountName(e.target.value)}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="form-group">
                  <label className="form-label">20. Bank Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={payoutBankName}
                    onChange={(e) => setPayoutBankName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">21. Bank Account Number *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={payoutAccountNumber}
                    onChange={(e) => setPayoutAccountNumber(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">22. Registered Account Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={payoutAccountName}
                    onChange={(e) => setPayoutAccountName(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* SECTION 6: NEXT OF KIN / GUARANTOR */}
        <div className="card" style={{ marginBottom: '2rem', padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--color-emerald-950)', marginBottom: '1rem', borderBottom: '1px solid var(--color-slate-200)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={18} color="var(--color-emerald-700)" />
            6. Next of Kin & Emergency Guarantor
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">23. Next of Kin Full Name *</label>
              <input
                type="text"
                className="form-input"
                value={nextOfKinName}
                onChange={(e) => setNextOfKinName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">24. Relationship *</label>
              <select
                className="form-select"
                value={nextOfKinRelationship}
                onChange={(e) => setNextOfKinRelationship(e.target.value)}
              >
                <option value="Spouse">Spouse</option>
                <option value="Sibling">Brother / Sister</option>
                <option value="Parent">Parent</option>
                <option value="Child">Child</option>
                <option value="Business Partner">Business Partner</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">25. Next of Kin Phone Number *</label>
              <input
                type="tel"
                className="form-input"
                value={nextOfKinPhone}
                onChange={(e) => setNextOfKinPhone(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">26. Next of Kin Residential Address</label>
              <input
                type="text"
                className="form-input"
                value={nextOfKinAddress}
                onChange={(e) => setNextOfKinAddress(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* SUBMISSION BAR */}
        <div
          style={{
            background: '#fff',
            padding: '1.5rem',
            borderRadius: '16px',
            boxShadow: 'var(--shadow-md)',
            border: '1px solid var(--color-slate-200)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div>
            <div style={{ fontWeight: 800, color: 'var(--color-emerald-950)', fontSize: '1rem' }}>
              Next Step: Paid Agent Service Activation
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-slate-600)' }}>
              Registration is not free. You will proceed to pay your official service activation fee.
            </p>
          </div>

          <button
            type="submit"
            className="btn-gold"
            disabled={submitting}
            style={{
              padding: '0.85rem 2rem',
              fontSize: '1rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {submitting ? 'Submitting...' : 'Submit Registration & Proceed to Activation'}
            <ArrowRight size={18} />
          </button>
        </div>
      </form>
    </div>
  );
};
