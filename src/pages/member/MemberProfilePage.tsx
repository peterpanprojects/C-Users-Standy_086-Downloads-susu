import React from 'react';
import { useSusu } from '../../context/SusuContext';
import { Lock, ShieldCheck, Key } from 'lucide-react';
import { ProfilePictureUpload } from '../../components/common/ProfilePictureUpload';

export const MemberProfilePage: React.FC = () => {
  const { activeMemberId, members, group, getMemberReliability, updateMemberProfile } = useSusu();
  const currentMember = members.find((m) => m.id === activeMemberId) || members[0];

  if (!currentMember) {
    return (
      <div style={{ maxWidth: '540px', margin: '3rem auto', textAlign: 'center' }}>
        <div className="card" style={{ padding: '3rem 2rem' }}>
          <h2>No Member Profile Found</h2>
          <p style={{ color: 'var(--color-slate-600)', marginTop: '0.5rem' }}>
            No member account is currently logged in or enrolled in this group.
          </p>
        </div>
      </div>
    );
  }

  const score = getMemberReliability(currentMember.id);

  const handleAvatarChange = (newUrl: string) => {
    updateMemberProfile(currentMember.id, { avatarUrl: newUrl });
  };

  return (
    <div style={{ maxWidth: '560px', margin: '0 auto', paddingBottom: '3rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(229, 169, 60, 0.15)', color: 'var(--color-gold-800)', padding: '0.2rem 0.65rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.4rem' }}>
          <ShieldCheck size={13} /> MEMBER ACCOUNT & IDENTITY
        </div>
        <h1 style={{ fontSize: '2rem', margin: 0 }}>Member Profile</h1>
        <p style={{ color: 'var(--color-slate-600)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Manage your personal details, profile picture, and circle membership.
        </p>
      </div>

      {/* Profile Picture Upload Section */}
      <ProfilePictureUpload
        currentAvatarUrl={currentMember.avatarUrl}
        fallbackName={currentMember.name}
        onAvatarChange={handleAvatarChange}
        title="Upload Member Profile Photo"
        subtitle="Click or drop a picture to update your photo across circle records."
        roleLabel="Circle Contributor"
      />

      {/* Member Details Card */}
      <div className="card">
        <div style={{ textAlign: 'center', padding: '1rem 0 1.5rem', borderBottom: '1px solid var(--color-slate-200)' }}>
          <div
            style={{
              width: '84px',
              height: '84px',
              borderRadius: '50%',
              overflow: 'hidden',
              background: 'var(--color-emerald-950)',
              border: '3px solid var(--color-gold-400)',
              color: 'var(--color-gold-400)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              fontWeight: 800,
              margin: '0 auto 1rem',
              fontFamily: 'var(--font-heading)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)'
            }}
          >
            {currentMember.avatarUrl ? (
              <img src={currentMember.avatarUrl} alt={currentMember.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              currentMember.name.charAt(0)
            )}
          </div>
          <h2 style={{ fontSize: '1.4rem', margin: 0 }}>{currentMember.name}</h2>
          <span className="status-pill active" style={{ marginTop: '0.5rem', display: 'inline-block' }}>
            Verified Susu Member
          </span>
        </div>

        <div style={{ padding: '1.5rem 0 0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--color-slate-600)', fontSize: '0.85rem' }}>Email Address</span>
            <strong style={{ fontSize: '0.9rem' }}>{currentMember.email}</strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--color-slate-600)', fontSize: '0.85rem' }}>Phone Number</span>
            <strong style={{ fontSize: '0.9rem' }}>{currentMember.phone}</strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--color-slate-600)', fontSize: '0.85rem' }}>Group Membership</span>
            <strong style={{ fontSize: '0.9rem', color: 'var(--color-emerald-800)' }}>{group.name}</strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--color-slate-600)', fontSize: '0.85rem' }}>Rotation Position</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <strong style={{ fontSize: '0.9rem' }}>Position #{currentMember.positionInRotation}</strong>
              <span style={{ fontSize: '0.72rem', background: 'var(--color-slate-100)', color: 'var(--color-slate-700)', padding: '2px 6px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}>
                <Lock size={10} /> Locked
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--color-slate-600)', fontSize: '0.85rem' }}>Reliability Rating</span>
            <strong style={{ fontSize: '0.9rem', color: 'var(--color-gold-700)' }}>{score}%</strong>
          </div>

          {currentMember.uniqueCode && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-gold-50)', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid var(--color-gold-200)' }}>
              <span style={{ color: 'var(--color-gold-900)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                <Key size={14} /> Secret Login Code
              </span>
              <code style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--color-emerald-950)', letterSpacing: '1px' }}>
                {currentMember.uniqueCode}
              </code>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
