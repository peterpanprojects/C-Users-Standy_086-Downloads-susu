import React from 'react';
import { CheckCheck, Trash2 } from 'lucide-react';
import { useSusu } from '../../context/SusuContext';

export const NotificationDropdown: React.FC<{ onClose?: () => void; align?: string }> = ({ onClose, align }) => {
  const { notifications, markAllNotificationsAsRead, clearAllNotifications, markNotificationAsRead } = useSusu();

  return (
    <div
      className="notification-dropdown"
      style={{
        position: 'absolute',
        top: '65px',
        ...(align === 'left' ? { left: '12px' } : { right: '12px' }),
        width: '380px',
        maxWidth: 'calc(100vw - 24px)',
        maxHeight: '78vh',
        overflowY: 'auto',
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.18)',
        border: '1px solid #e2e8f0',
        zIndex: 99999,
        padding: '0',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '14px 16px',
        borderBottom: '1px solid #f1f5f9',
        position: 'sticky',
        top: 0,
        background: 'white',
        borderTopLeftRadius: '16px',
        borderTopRightRadius: '16px',
        zIndex: 2
      }}>
        <h3 style={{ fontWeight: 700, fontSize: '0.95rem' }}>Notifications</h3>
        <button
          onClick={() => markAllNotificationsAsRead()}
          style={{
            background: 'none',
            border: 'none',
            color: '#6366f1',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <CheckCheck size={14} /> Mark all as read
        </button>
      </div>

      {/* List */}
      <div style={{ padding: '8px 0' }}>
        {notifications.length === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
            No notifications
          </div>
        ) : (
          notifications.map((n: any) => (
            <div
              key={n.id}
              onClick={() => markNotificationAsRead(n.id)}
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid #f8fafc',
                cursor: 'pointer',
                display: 'flex',
                gap: '10px',
                background: n.read ? 'white' : '#f8fafc'
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: '2px' }}>
                  {n.title}
                </div>
                <div style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: '1.4' }}>
                  {n.description || n.message}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>
                  {n.time || new Date(n.createdAt).toLocaleString()}
                </div>
              </div>
              {!n.read && (
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#6366f1',
                  marginTop: '6px',
                  flexShrink: 0
                }} />
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div style={{
          padding: '10px 16px',
          borderTop: '1px solid #f1f5f9',
          display: 'flex',
          justifyContent: 'center',
          position: 'sticky',
          bottom: 0,
          background: 'white',
          borderBottomLeftRadius: '16px',
          borderBottomRightRadius: '16px',
        }}>
          <button
            onClick={() => clearAllNotifications()}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <Trash2 size={14} /> Clear all
          </button>
        </div>
      )}
    </div>
  );
};