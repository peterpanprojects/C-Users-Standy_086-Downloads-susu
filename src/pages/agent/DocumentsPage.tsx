import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/db';

export const DocumentsPage: React.FC = () => {
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    const { data, error } = await supabase
      .from('group_members')
      .select('id, name, phone, photo_url, id_card_url, document_url, created_at, group_id')
      .or('photo_url.not.is.null,id_card_url.not.is.null,document_url.not.is.null')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setDocs(data);
    }
    setLoading(false);
  };

  if (loading) return <div style={{padding: '2rem'}}>Loading documents...</div>;

  return (
    <div style={{padding: '1.5rem'}}>
      <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem'}}>All Uploaded Documents</h2>
      
      {docs.length === 0 ? (
        <div style={{background: '#fff', padding: '2rem', borderRadius: '12px', textAlign: 'center', color: '#64748b'}}>
          <p>No documents uploaded yet.</p>
          <p style={{fontSize: '0.85rem', marginTop: '8px'}}>Upload a member photo and it will appear here.</p>
        </div>
      ) : (
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem'}}>
          {docs.map((m) => (
            <div key={m.id} style={{background: '#fff', borderRadius: '12px', padding: '1rem', border: '1px solid #e2e8f0'}}>
              <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
                <img 
                  src={m.photo_url || m.id_card_url || m.document_url} 
                  alt={m.name}
                  style={{width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', background: '#f1f5f9'}}
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
                <div>
                  <div style={{fontWeight: '600'}}>{m.name}</div>
                  <div style={{fontSize: '0.85rem', color: '#64748b'}}>{m.phone}</div>
                  <div style={{fontSize: '0.75rem', color: '#94a3b8'}}>{new Date(m.created_at).toLocaleDateString()}</div>
                </div>
              </div>
              <div style={{marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
                {m.photo_url && <a href={m.photo_url} target="_blank" style={{fontSize: '0.8rem', color: '#2563eb'}}>View Photo</a>}
                {m.id_card_url && <a href={m.id_card_url} target="_blank" style={{fontSize: '0.8rem', color: '#2563eb'}}>View ID</a>}
                {m.document_url && <a href={m.document_url} target="_blank" style={{fontSize: '0.8rem', color: '#2563eb'}}>View Doc</a>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};