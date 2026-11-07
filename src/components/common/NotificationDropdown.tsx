import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useSusu } from '../../context/SusuContext';
import { Bell, Send, XCircle, ShoppingBag, CheckCircle2, Trash2, Check, DollarSign } from 'lucide-react';
import { AppNotification } from '../../types/susu';

interface NotificationDropdownProps {
  align?: 'right' | 'left';
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ align = 'right' }) => {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearAllNotifications,
    currentUserRole,
    activeMemberId
  } = useSusu();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // ✅ CORRECT ISOLATION
  const visibleNotifications = useMemo(() => {
    if (currentUserRole === 'member') {
      // Member: ONLY notifications where memberId == me
      return notifications.filter((n: any) => n.memberId === activeMemberId);
    }
    if (currentUserRole === 'agent') {
      // Agent: NEVER show anything that has a memberId (those are member-only DMs)
      return notifications.filter((n: any) =>!n.memberId);
    }
    if (currentUserRole === 'super_admin') {
      // Super Admin: NEVER show member DMs
      return notifications.filter((n: any) =>!n.memberId);
    }
    return notifications;
  }, [notifications, currentUserRole, activeMemberId]);

  const unreadCount = visibleNotifications.filter((n) =>!n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current &&!dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const renderNotificationIcon = (type: AppNotification['type']) => {
    if (type === 'payment_reminder') {
      return <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><DollarSign size={20} color="#D97706" /></div>;
    }
    switch (type) {
      case 'sent': return <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Send size={20} color="#EA580C" /></div>;
      case 'warning': return <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><XCircle size={20} color="#EF4444" /></div>;
      case 'received': return <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><ShoppingBag size={20} color="#16A34A" /></div>;
      default: return <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><CheckCircle2 size={20} color="#2563EB" /></div>;
    }
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button type="button" onClick={() => setIsOpen(!isOpen)} style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#ffffff', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}>
        <Bell size={20} color="#334155" />
        {unreadCount > 0 && <span style={{ position: 'absolute', top: '9px', right: '9px', width: '9px', height: '9px', borderRadius: '50%', background: '#ef4444', border: '2px solid #ffffff' }} />}
      </button>

      {isOpen && (
        <div style={{ position: 'absolute', top: 'calc(100% + 10px)', [align === 'right'? 'right' : 'left']: 0, width: '360px', maxWidth: 'calc(100vw - 32px)', background: '#ffffff', borderRadius: '18px', boxShadow: '0 16px 40px -4px rgba(15, 23, 42, 0.15)', zIndex: 9999, overflow: 'hidden' }}>
          <div style={{ padding: '1.15rem 1.25rem 0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Notifications</h3>
            {unreadCount > 0 && <button type="button" onClick={markAllNotificationsAsRead} style={{ background: 'transparent', border: 'none', color: '#6366f1', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Check size={14} />Mark all as read</button>}
          </div>

          <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
            {visibleNotifications.length === 0? (
              <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: '#94a3b8' }}><Bell size={32} color="#cbd5e1" style={{ margin: '0 auto 0.75rem' }} /><div style={{ fontWeight: 600, color: '#64748b' }}>No notifications</div></div>
            ) : (
              visibleNotifications.map((item) => (
                <div key={item.id} onClick={() => markNotificationAsRead(item.id)} style={{ padding: '1rem 1.25rem', display: 'flex', gap: '1rem', borderBottom: '1px solid #f8fafc', background: item.read? '#ffffff' : '#fcfdff', cursor: 'pointer' }}>
                  {renderNotificationIcon(item.type)}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><h4 style={{ margin: 0, fontSize: '0.94rem', fontWeight: 700, color: '#0f172a' }}>{item.title}</h4>{!item.read && <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#6366f1' }} />}</div>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.84rem', color: '#64748b' }}>{item.description}</p>
                    <span style={{ display: 'inline-block', marginTop: '0.4rem', fontSize: '0.78rem', color: '#94a3b8' }}>{item.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {visibleNotifications.length > 0 && (
            <div style={{ padding: '0.75rem 1.25rem', background: '#fafafa', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
              <span style={{ color: '#94a3b8' }}>{unreadCount > 0? `${unreadCount} unread` : 'All caught up'}</span>
              <button type="button" onClick={clearAllNotifications} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', gap: '0.3rem' }}><Trash2 size={13} />Clear all</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};