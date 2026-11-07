import React, { useRef, useState } from 'react';
import { Camera, Upload, Trash2, Link as LinkIcon, Check, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { compressImageFile, validateImageFile, PRESET_AVATARS } from '../../utils/imageUtils';

interface ProfilePictureUploadProps {
  currentAvatarUrl?: string;
  fallbackName: string;
  onAvatarChange: (newUrl: string) => void;
  size?: number;
  title?: string;
  subtitle?: string;
  roleLabel?: string;
}

export const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  currentAvatarUrl,
  fallbackName,
  onAvatarChange,
  size = 96,
  title = 'Profile Picture',
  subtitle = 'Upload a clear headshot or avatar photo (JPG, PNG, WEBP).',
  roleLabel
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [manualUrl, setManualUrl] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const displayInitials = fallbackName
    ? fallbackName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0].toUpperCase())
        .join('')
    : 'U';

  const showToast = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback(null);
    }, 4000);
  };

  const processFile = async (file: File) => {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      showToast('error', validation.error || 'Invalid image file');
      return;
    }

    setIsCompressing(true);
    try {
      const compressedDataUrl = await compressImageFile(file, 360, 0.88);
      onAvatarChange(compressedDataUrl);
      showToast('success', 'Profile photo updated successfully!');
      setShowUrlInput(false);
      setShowPresets(false);
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to process image');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    // reset input so same file can be re-selected if desired
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleApplyUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = manualUrl.trim();
    if (!trimmed) {
      showToast('error', 'Please enter a valid image URL');
      return;
    }
    onAvatarChange(trimmed);
    showToast('success', 'Profile picture URL applied!');
    setManualUrl('');
    setShowUrlInput(false);
  };

  const handleSelectPreset = (url: string) => {
    onAvatarChange(url);
    showToast('success', 'Preset avatar selected!');
    setShowPresets(false);
  };

  const handleRemovePhoto = () => {
    onAvatarChange('');
    showToast('success', 'Profile photo removed. Reverted to initials.');
  };

  return (
    <div
      className="profile-picture-upload-container"
      style={{
        background: '#ffffff',
        border: '1px solid var(--color-slate-200)',
        borderRadius: '16px',
        padding: '1.5rem',
        marginBottom: '1.5rem'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', color: 'var(--color-emerald-950)', margin: 0, fontWeight: 700 }}>
            {title}
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--color-slate-500)', margin: '0.25rem 0 0' }}>
            {subtitle}
          </p>
        </div>
        {roleLabel && (
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              background: 'rgba(229, 169, 60, 0.15)',
              color: 'var(--color-gold-800)',
              padding: '0.25rem 0.65rem',
              borderRadius: '999px'
            }}
          >
            {roleLabel}
          </span>
        )}
      </div>

      {feedback && (
        <div
          style={{
            padding: '0.65rem 0.9rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: feedback.type === 'success' ? 'var(--color-emerald-50)' : '#fef2f2',
            color: feedback.type === 'success' ? 'var(--color-emerald-900)' : '#991b1b',
            border: `1px solid ${feedback.type === 'success' ? 'var(--color-emerald-200)' : '#fecaca'}`
          }}
        >
          {feedback.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Main Avatar Uploader Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          flexWrap: 'wrap'
        }}
      >
        {/* Interactive Avatar Circle with Camera Overlay */}
        <div
          style={{
            position: 'relative',
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: '50%',
            cursor: 'pointer',
            flexShrink: 0
          }}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          title="Click or drag photo here to change picture"
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              overflow: 'hidden',
              background: 'var(--color-emerald-950)',
              border: isDragOver
                ? '3px dashed var(--color-gold-500)'
                : '3px solid var(--color-gold-400)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
              position: 'relative'
            }}
          >
            {isCompressing ? (
              <Loader2 size={32} className="spin" color="var(--color-gold-400)" />
            ) : currentAvatarUrl ? (
              <img
                src={currentAvatarUrl}
                alt={fallbackName}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <span
                style={{
                  fontSize: `${size * 0.38}px`,
                  fontWeight: 800,
                  color: 'var(--color-gold-400)',
                  fontFamily: 'var(--font-heading)'
                }}
              >
                {displayInitials}
              </span>
            )}
          </div>

          {/* Camera Badge Icon Overlay */}
          <div
            style={{
              position: 'absolute',
              bottom: '2px',
              right: '2px',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'var(--color-gold-500)',
              color: 'var(--color-emerald-950)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.25)',
              border: '2px solid #ffffff'
            }}
          >
            <Camera size={16} strokeWidth={2.5} />
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ flex: 1, minWidth: '240px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '0.75rem' }}>
            {/* Native file input trigger */}
            <button
              type="button"
              className="btn-gold"
              onClick={() => fileInputRef.current?.click()}
              disabled={isCompressing}
              style={{ padding: '0.5rem 1rem', fontSize: '0.84rem' }}
            >
              {isCompressing ? (
                <>
                  <Loader2 size={16} className="spin" /> Processing...
                </>
              ) : (
                <>
                  <Upload size={16} /> Upload Photo
                </>
              )}
            </button>

            {/* Presets Button */}
            <button
              type="button"
              className="btn-outline"
              onClick={() => {
                setShowPresets(!showPresets);
                setShowUrlInput(false);
              }}
              style={{ padding: '0.5rem 0.85rem', fontSize: '0.82rem' }}
            >
              <Sparkles size={15} color="var(--color-gold-600)" /> Choose Avatar
            </button>

            {/* URL Input Button */}
            <button
              type="button"
              className="btn-outline"
              onClick={() => {
                setShowUrlInput(!showUrlInput);
                setShowPresets(false);
              }}
              style={{ padding: '0.5rem 0.85rem', fontSize: '0.82rem' }}
            >
              <LinkIcon size={15} /> Paste Link
            </button>

            {/* Remove Photo (if custom photo is set) */}
            {currentAvatarUrl && (
              <button
                type="button"
                className="btn-outline"
                onClick={handleRemovePhoto}
                style={{
                  padding: '0.5rem 0.85rem',
                  fontSize: '0.82rem',
                  color: '#dc2626',
                  borderColor: '#fca5a5'
                }}
                title="Remove current photo"
              >
                <Trash2 size={15} /> Remove
              </button>
            )}
          </div>

          <span style={{ fontSize: '0.76rem', color: 'var(--color-slate-500)', display: 'block' }}>
            Tip: You can take a live camera photo or pick an image from your device gallery.
          </span>
        </div>
      </div>

      {/* Hidden Native File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* Direct URL Input Tray */}
      {showUrlInput && (
        <form
          onSubmit={handleApplyUrl}
          style={{
            marginTop: '1.25rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--color-slate-200)',
            display: 'flex',
            gap: '0.5rem'
          }}
        >
          <input
            type="url"
            className="form-input"
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            style={{ fontSize: '0.85rem', flex: 1 }}
            autoFocus
          />
          <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
            Apply URL
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setShowUrlInput(false)}
            style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
          >
            Cancel
          </button>
        </form>
      )}

      {/* Preset Avatars Gallery */}
      {showPresets && (
        <div
          style={{
            marginTop: '1.25rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--color-slate-200)'
          }}
        >
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-slate-700)', marginBottom: '0.65rem' }}>
            Select from Curated Avatars:
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {PRESET_AVATARS.map((preset) => (
              <div
                key={preset.id}
                onClick={() => handleSelectPreset(preset.url)}
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: currentAvatarUrl === preset.url ? '3px solid var(--color-gold-500)' : '2px solid var(--color-slate-200)',
                  transition: 'transform 0.15s ease, border-color 0.15s ease',
                  transform: currentAvatarUrl === preset.url ? 'scale(1.08)' : 'scale(1)'
                }}
                title={preset.label}
              >
                <img
                  src={preset.url}
                  alt={preset.label}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
