import React, { useState } from 'react';
import { useSusu } from '../../context/SusuContext';
import {
  Headphones,
  MessageSquare,
  ExternalLink,
  Save,
  ShieldCheck,
  Check,
  Copy,
  AlertCircle,
  MessageCircle,
  Sparkles
} from 'lucide-react';

interface LiveSupportPageProps {
  onNavigate?: (path: string) => void;
  onOpenWidget?: () => void;
}

export const LiveSupportPage: React.FC<LiveSupportPageProps> = ({ onNavigate: _onNavigate, onOpenWidget }) => {
  const { liveSupportConfig, updateLiveSupportConfig } = useSusu();

  const [apiKey, setApiKey] = useState(liveSupportConfig.apiKey || '');
  const [enabled, setEnabled] = useState(liveSupportConfig.enabled ?? true);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    updateLiveSupportConfig({
      apiKey,
      enabled
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3500);
  };

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto', padding: '1rem 0 3rem' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'rgba(99, 102, 241, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Headphones size={24} color="#818cf8" />
          </div>
          <h1
            style={{
              fontSize: '1.85rem',
              fontWeight: 800,
              color: '#ffffff',
              margin: 0,
              letterSpacing: '-0.02em'
            }}
          >
            Live Support
          </h1>
        </div>
        <p
          style={{
            color: '#94a3b8',
            fontSize: '0.95rem',
            marginTop: '0.4rem',
            lineHeight: 1.4
          }}
        >
          Add a live chat widget to your store for customer support
        </p>
      </div>

      {/* Success Banner */}
      {saved && (
        <div
          style={{
            background: 'rgba(34, 197, 94, 0.15)',
            border: '1px solid rgba(34, 197, 94, 0.4)',
            borderRadius: '10px',
            padding: '0.9rem 1.2rem',
            marginBottom: '1.5rem',
            color: '#4ade80',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            animation: 'fadeIn 0.3s ease'
          }}
        >
          <Check size={18} />
          Live chat settings saved successfully! Widget updated across your store & platform.
        </div>
      )}

      {/* Form & Cards Container */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Card 1: Powered by Rezolv Banner */}
        <div
          style={{
            background: 'linear-gradient(145deg, #12182b 0%, #161e36 100%)',
            border: '1px solid rgba(99, 102, 241, 0.35)',
            borderRadius: '14px',
            padding: '1.35rem 1.5rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1.1rem',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)'
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: '#4f46e5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.4)'
            }}
          >
            <MessageSquare size={22} color="#ffffff" />
          </div>
          <div>
            <h2
              style={{
                fontSize: '1.08rem',
                fontWeight: 700,
                color: '#ffffff',
                margin: '0 0 0.35rem 0'
              }}
            >
              Powered by Rezolv
            </h2>
            <p
              style={{
                fontSize: '0.88rem',
                color: '#94a3b8',
                lineHeight: 1.5,
                margin: 0
              }}
            >
              Let your customers chat with you in real-time directly on your store page. Set up automated
              responses, manage conversations, and provide instant support.
            </p>
          </div>
        </div>

        {/* Card 2: Step 1 - Create Account */}
        <div
          style={{
            background: '#12182b',
            border: '1px solid #1e2942',
            borderRadius: '14px',
            padding: '1.35rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flex: 1, minWidth: '260px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#1d2238',
                color: '#818cf8',
                fontWeight: 700,
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              1
            </div>
            <div>
              <h3
                style={{
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: '#ffffff',
                  margin: '0 0 0.25rem 0'
                }}
              >
                Create your Rezolv account
              </h3>
              <p
                style={{
                  fontSize: '0.86rem',
                  color: '#94a3b8',
                  margin: 0
                }}
              >
                Sign up for free, create a workspace, and customize your chat widget.
              </p>
            </div>
          </div>

          <a
            href="https://www.rezolv.dev/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: '#4f46e5',
              color: '#ffffff',
              padding: '0.65rem 1.25rem',
              borderRadius: '8px',
              fontSize: '0.92rem',
              fontWeight: 600,
              textDecoration: 'none',
              boxShadow: '0 2px 8px rgba(79, 70, 229, 0.35)',
              transition: 'all 0.2s ease'
            }}
          >
            <ExternalLink size={16} />
            Go to Rezolv
          </a>
        </div>

        {/* Card 3: Step 2 - Paste API Key */}
        <div
          style={{
            background: '#12182b',
            border: '1px solid #1e2942',
            borderRadius: '14px',
            padding: '1.35rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#1d2238',
                color: '#818cf8',
                fontWeight: 700,
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              2
            </div>
            <div style={{ flex: 1 }}>
              <h3
                style={{
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: '#ffffff',
                  margin: '0 0 0.25rem 0'
                }}
              >
                Paste your API Key
              </h3>
              <p
                style={{
                  fontSize: '0.86rem',
                  color: '#94a3b8',
                  margin: 0
                }}
              >
                Find it in your Rezolv dashboard under Workspace Settings.
              </p>
            </div>
          </div>

          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              style={{
                width: '100%',
                background: '#0a0e1a',
                border: '1px solid #222d47',
                borderRadius: '10px',
                padding: '0.9rem 3.5rem 0.9rem 1.1rem',
                fontFamily: 'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                fontSize: '0.88rem',
                color: '#f1f5f9',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            <button
              type="button"
              onClick={handleCopyKey}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: copied ? '#4ade80' : '#94a3b8',
                padding: '0.4rem 0.6rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                cursor: 'pointer'
              }}
              title="Copy API Key"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Card 4: Step 3 - Enable Live Chat Toggle */}
        <div
          style={{
            background: '#12182b',
            border: '1px solid #1e2942',
            borderRadius: '14px',
            padding: '1.35rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#1d2238',
                color: '#818cf8',
                fontWeight: 700,
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              3
            </div>
            <div>
              <h3
                style={{
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: '#ffffff',
                  margin: '0 0 0.25rem 0'
                }}
              >
                Enable Live Chat
              </h3>
              <p
                style={{
                  fontSize: '0.86rem',
                  color: '#94a3b8',
                  margin: 0
                }}
              >
                Show the chat widget on your store
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <button
            type="button"
            onClick={() => setEnabled(!enabled)}
            style={{
              width: '52px',
              height: '28px',
              borderRadius: '14px',
              background: enabled ? '#22c55e' : '#334155',
              cursor: 'pointer',
              position: 'relative',
              border: 'none',
              padding: 0,
              transition: 'background-color 0.25s ease',
              flexShrink: 0
            }}
            aria-label="Toggle Live Chat"
          >
            <div
              style={{
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                background: '#ffffff',
                position: 'absolute',
                top: '3px',
                left: enabled ? '27px' : '3px',
                transition: 'left 0.25s ease',
                boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
              }}
            />
          </button>
        </div>

        {/* Status Indicator Banner */}
        {enabled ? (
          <div
            style={{
              background: 'rgba(22, 101, 52, 0.2)',
              border: '1px solid #166534',
              borderRadius: '12px',
              padding: '0.9rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              color: '#4ade80',
              fontSize: '0.92rem',
              fontWeight: 600
            }}
          >
            <ShieldCheck size={20} color="#22c55e" />
            <span>Live chat is active on your store right now.</span>
          </div>
        ) : (
          <div
            style={{
              background: 'rgba(127, 29, 29, 0.2)',
              border: '1px solid #7f1d1d',
              borderRadius: '12px',
              padding: '0.9rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              color: '#f87171',
              fontSize: '0.92rem',
              fontWeight: 600
            }}
          >
            <AlertCircle size={20} color="#f87171" />
            <span>Live chat is currently paused and hidden from visitors.</span>
          </div>
        )}

        {/* Save Live Chat Settings Button */}
        <button
          type="button"
          onClick={() => handleSave()}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '12px',
            padding: '1rem',
            fontWeight: 700,
            fontSize: '1.02rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.65rem',
            cursor: 'pointer',
            boxShadow: '0 4px 18px rgba(79, 70, 229, 0.45)',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease'
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.99)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <Save size={20} />
          Save Live Chat Settings
        </button>

        {/* Interactive Preview & Quick Tester Card */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px dashed #28324a',
            borderRadius: '12px',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            marginTop: '0.5rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Sparkles size={20} color="#a855f7" />
            <div>
              <div style={{ color: '#ffffff', fontWeight: 600, fontSize: '0.92rem' }}>
                Test Floating Widget
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.82rem' }}>
                Click below or locate the purple chat bubble in the bottom right corner of this screen.
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (onOpenWidget) {
                onOpenWidget();
              } else {
                const trigger = document.getElementById('rezolv-live-chat-launcher');
                if (trigger) trigger.click();
              }
            }}
            style={{
              background: 'rgba(99, 102, 241, 0.15)',
              color: '#818cf8',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: '8px',
              padding: '0.6rem 1rem',
              fontSize: '0.88rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer'
            }}
          >
            <MessageCircle size={16} />
            Preview Chat Widget
          </button>
        </div>
      </div>
    </div>
  );
};
