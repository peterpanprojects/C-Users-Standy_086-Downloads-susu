import React, { useState } from 'react';
import { useSusu } from '../../context/SusuContext';
import { MessageSquare, Plus, Pin, ThumbsUp } from 'lucide-react';

export const PublicFeedPage: React.FC = () => {
  const { posts, currentUserRole, addFeedPost } = useSusu();
  const [showPostModal, setShowPostModal] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'group'>('public');

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !body) return;
    addFeedPost(title, body, visibility);
    setTitle('');
    setBody('');
    setShowPostModal(false);
  };

  return (
    <div className="feed-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '0.25rem' }}>Community & Platform Announcements</h1>
          <p style={{ color: 'var(--color-slate-600)', fontSize: '0.95rem' }}>
            Transparent updates, payout confirmations, and platform security notices.
          </p>
        </div>

        {currentUserRole === 'agent' && (
          <button className="btn-gold" onClick={() => setShowPostModal(true)}>
            <Plus size={16} /> Create Post
          </button>
        )}
      </div>

      <div className="feed-posts-list">
        {posts.length === 0 ? (
          <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--color-slate-500)' }}>
            <MessageSquare size={36} color="var(--color-slate-400)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.3rem', color: 'var(--color-slate-700)', marginBottom: '0.5rem' }}>No Announcements Posted Yet</h3>
            <p style={{ fontSize: '0.9rem' }}>Official group and platform updates will appear here once published.</p>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="card feed-card">
              {post.pinned && (
                <div className="pinned-badge">
                  <Pin size={12} /> Pinned Notice
                </div>
              )}

              <div className="post-header">
                <div>
                  <span className="author-name">{post.authorName}</span>
                  <span className={`status-pill ${post.authorRole === 'agent' ? 'active' : 'current'}`}>
                    {post.authorRole.toUpperCase()}
                  </span>
                </div>
                <span className="post-date">{new Date(post.publishedAt).toLocaleDateString()}</span>
              </div>

              <h3 className="post-title">{post.title}</h3>
              <p className="post-body">{post.body}</p>

              <div className="post-footer">
                <span className="like-btn">
                  <ThumbsUp size={14} /> {post.likesCount} Reassurances
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-slate-400)' }}>
                  Visibility: {post.visibility.toUpperCase()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {showPostModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Broadcast Group Announcement</h3>
            <form onSubmit={handlePost}>
              <div className="form-group">
                <label className="form-label">Post Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Announcement Content</label>
                <textarea
                  className="form-textarea"
                  rows={4}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Audience Visibility</label>
                <select
                  className="form-select"
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as any)}
                >
                  <option value="public">Public (Visible to Visitors)</option>
                  <option value="group">Group Only (Members Only)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowPostModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <MessageSquare size={16} /> Publish Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .feed-posts-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          max-width: 800px;
          margin: 0 auto;
        }
        .feed-card {
          position: relative;
        }
        .pinned-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          background: var(--color-gold-100);
          color: var(--color-gold-700);
          padding: 0.2rem 0.6rem;
          border-radius: var(--radius-sm);
          font-size: 0.7rem;
          font-weight: 700;
          margin-bottom: 0.75rem;
        }
        .post-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }
        .author-name {
          font-weight: 700;
          color: var(--color-emerald-950);
          margin-right: 0.5rem;
          font-size: 0.95rem;
        }
        .post-date {
          font-size: 0.8rem;
          color: var(--color-slate-500);
        }
        .post-title {
          font-size: 1.25rem;
          margin-bottom: 0.5rem;
        }
        .post-body {
          font-size: 0.9rem;
          color: var(--color-slate-700);
          line-height: 1.6;
          margin-bottom: 1rem;
        }
        .post-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid var(--color-slate-200);
          padding-top: 0.75rem;
        }
        .like-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.8rem;
          color: var(--color-emerald-700);
          font-weight: 600;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};
