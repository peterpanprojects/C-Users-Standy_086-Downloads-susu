import React, { useState, useRef, useEffect } from 'react';
import { useSusu } from '../../context/SusuContext';
import {
  MessageSquare,
  X,
  Send,
  Headphones,
  Bot,
  User,
  Sparkles,
  ExternalLink,
  CheckCheck
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'support' | 'user';
  text: string;
  time: string;
}

const QUICK_QUESTIONS = [
  'How do rotation slots work?',
  'How do I pay my daily contribution?',
  'Where is my invite token?',
  'How do I become a licensed agent?'
];

export const LiveChatWidget: React.FC = () => {
  const { liveSupportConfig, group, platformPaymentConfig } = useSusu();

  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'support',
      text: `👋 Hello! Welcome to ${group?.name || 'Susu Savings Vault'}. How can our support team help you today?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  // If live support is disabled in settings, do not show widget
  if (!liveSupportConfig.enabled) {
    return null;
  }

  const getAutomatedResponse = (query: string): string => {
    const q = query.toLowerCase();

    if (q.includes('slot') || q.includes('rotation') || q.includes('payout')) {
      return `🎉 In Susu Savings Vault, rotation slots represent your designated payout week! You can view and claim available open slots directly in your Member Portal under "Rotation Slots". The schedule dynamically updates as members pick their weeks.`;
    }

    if (q.includes('pay') || q.includes('daily') || q.includes('deposit') || q.includes('contribution')) {
      return `💳 Daily contributions are fixed at ${group?.currency || 'GH₵'}${group?.fixedDailyAmount || 20}/day. You can pay securely online via Paystack (Mobile Money or Debit Card) or via Cash payment verified by your Agent Organizer.`;
    }

    if (q.includes('invite') || q.includes('token') || q.includes('code') || q.includes('join')) {
      return `🎟️ If you received an invite link or token, click "Accept Invite / Enter Token" on the Sign In page or navigate to the Invite page. You can also log in anytime using your unique Member Code (e.g. SUSU-AK792).`;
    }

    if (q.includes('agent') || q.includes('kyc') || q.includes('license') || q.includes('organizer')) {
      const activationFee = Number(platformPaymentConfig?.agentActivationFee ?? 150);
      return `🛡️ Agents can create and manage their own Susu groups! To activate your license, complete the KYC verification in your dashboard and pay the one-time GHS ${activationFee.toFixed(0)} regulatory licensing fee.`;
    }

    if (q.includes('hello') || q.includes('hi') || q.includes('hey')) {
      return `Hello! How can I assist you today with Susu Savings Vault? Feel free to ask about payments, rotation slots, or member invites.`;
    }

    return `Thank you for reaching out! A live Rezolv support representative has received your inquiry ("${query}"). We typically respond within 2 to 5 minutes. Feel free to leave your contact email or phone if you would like follow-up updates!`;
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Simulate real-time response delay from Rezolv
    setTimeout(() => {
      const responseText = getAutomatedResponse(text);
      const replyMsg: ChatMessage = {
        id: `reply-${Date.now()}`,
        sender: 'support',
        text: responseText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, replyMsg]);
      setIsTyping(false);
    }, 900);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 99999,
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      {/* Expanded Chat Window */}
      {isOpen && (
        <div
          style={{
            width: '370px',
            maxWidth: 'calc(100vw - 32px)',
            height: '520px',
            maxHeight: 'calc(100vh - 100px)',
            background: 'linear-gradient(180deg, #10162a 0%, #0d1222 100%)',
            border: '1px solid rgba(99, 102, 241, 0.35)',
            borderRadius: '18px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            marginBottom: '14px',
            animation: 'slideUpFade 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {/* Header */}
          <div
            style={{
              background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
              padding: '1rem 1.25rem',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}
              >
                <Headphones size={20} color="#ffffff" />
                <span
                  style={{
                    position: 'absolute',
                    bottom: '-2px',
                    right: '-2px',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: '#22c55e',
                    border: '2px solid #3730a3'
                  }}
                />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.98rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span>Susu Live Support</span>
                </div>
                <div style={{ fontSize: '0.75rem', opacity: 0.85, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80' }}></span>
                  Powered by Rezolv • Online
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: 'none',
                color: '#ffffff',
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              title="Close chat"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Container */}
          <div
            style={{
              flex: 1,
              padding: '1rem',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem'
            }}
          >
            {/* Rezolv verified badge */}
            <div
              style={{
                textAlign: 'center',
                padding: '0.4rem 0.75rem',
                background: 'rgba(99, 102, 241, 0.08)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                borderRadius: '20px',
                fontSize: '0.72rem',
                color: '#a5b4fc',
                margin: '0 auto 0.5rem auto'
              }}
            >
              🛡️ Live Support encrypted via Rezolv Workspace
            </div>

            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div
                  style={{
                    maxWidth: '85%',
                    padding: '0.75rem 0.95rem',
                    borderRadius:
                      msg.sender === 'user'
                        ? '16px 16px 2px 16px'
                        : '16px 16px 16px 2px',
                    background:
                      msg.sender === 'user'
                        ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
                        : '#1a2238',
                    color: '#ffffff',
                    fontSize: '0.86rem',
                    lineHeight: 1.45,
                    border: msg.sender === 'user' ? 'none' : '1px solid #24304e',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)'
                  }}
                >
                  {msg.text}
                </div>
                <span
                  style={{
                    fontSize: '0.68rem',
                    color: '#64748b',
                    marginTop: '0.2rem',
                    padding: '0 0.35rem'
                  }}
                >
                  {msg.time}
                </span>
              </div>
            ))}

            {isTyping && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div
                  style={{
                    padding: '0.6rem 0.85rem',
                    background: '#1a2238',
                    borderRadius: '16px 16px 16px 2px',
                    border: '1px solid #24304e',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#818cf8', animation: 'bounce 1s infinite 0.1s' }} />
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#818cf8', animation: 'bounce 1s infinite 0.2s' }} />
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#818cf8', animation: 'bounce 1s infinite 0.3s' }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions Suggestions */}
          {messages.length <= 3 && (
            <div
              style={{
                padding: '0 1rem 0.65rem 1rem',
                display: 'flex',
                gap: '0.4rem',
                overflowX: 'auto',
                whiteSpace: 'nowrap'
              }}
            >
              {QUICK_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(q)}
                  style={{
                    background: '#182035',
                    border: '1px solid #283556',
                    color: '#cbd5e1',
                    borderRadius: '12px',
                    padding: '0.35rem 0.65rem',
                    fontSize: '0.73rem',
                    cursor: 'pointer',
                    flexShrink: 0
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#6366f1')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#283556')}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input Bar */}
          <div
            style={{
              padding: '0.75rem 1rem',
              borderTop: '1px solid #1e2942',
              background: '#0d1222',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.45rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{
                  flex: 1,
                  background: '#13192b',
                  border: '1px solid #25314d',
                  borderRadius: '10px',
                  padding: '0.65rem 0.85rem',
                  fontSize: '0.86rem',
                  color: '#f8fafc',
                  outline: 'none'
                }}
              />
              <button
                type="button"
                onClick={() => handleSendMessage()}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: inputText.trim() ? '#4f46e5' : '#1e2538',
                  color: inputText.trim() ? '#ffffff' : '#64748b',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: inputText.trim() ? 'pointer' : 'default',
                  transition: 'background 0.2s ease'
                }}
                disabled={!inputText.trim()}
              >
                <Send size={16} />
              </button>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.68rem',
                color: '#64748b',
                padding: '0 0.2rem'
              }}
            >
              <span>⚡ Powered by Rezolv</span>
              <span>Workspace ID: {liveSupportConfig.apiKey.substring(0, 12)}...</span>
            </div>
          </div>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        id="rezolv-live-chat-launcher"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '58px',
          height: '58px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
          color: '#ffffff',
          border: 'none',
          boxShadow: '0 8px 25px rgba(79, 70, 229, 0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          position: 'relative',
          transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease'
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        aria-label="Open live support chat"
        title="Chat with Susu Support (Powered by Rezolv)"
      >
        {isOpen ? (
          <X size={24} />
        ) : (
          <>
            <MessageSquare size={24} />
            {/* Green Online Notification Dot */}
            <span
              style={{
                position: 'absolute',
                top: '2px',
                right: '2px',
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                background: '#22c55e',
                border: '2.5px solid #10162a',
                boxShadow: '0 0 6px #22c55e'
              }}
            />
          </>
        )}
      </button>
    </div>
  );
};
