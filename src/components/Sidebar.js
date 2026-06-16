import React, { useState } from 'react';
import { saveArchive, deleteArchive, deleteMessagesByArchive } from '../utils/db';
import { v4 as uuid } from 'uuid';

export default function Sidebar({ archives, activeId, onSelect, onRefresh, onSettings, apiKey, t }) {
  const [showNew, setShowNew] = useState(false);
  const [name, setName] = useState('');
  const [myName, setMyName] = useState('');
  const [note, setNote] = useState('');

  const handleCreate = async () => {
    if (!name.trim()) return;
    const arc = {
      id: uuid(),
      name: name.trim(),
      myName: myName.trim() || 'Me',
      note: note.trim(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messageCount: 0,
    };
    await saveArchive(arc);
    onRefresh();
    onSelect(arc.id);
    setShowNew(false);
    setName(''); setMyName(''); setNote('');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">♡</div>
          <div className="sidebar-logo-text">Heart<span>Lens</span></div>
        </div>
        <button className="btn-new-archive" onClick={() => setShowNew(true)}>
          {t.newArchive}
        </button>
      </div>

      <div className="sidebar-list">
        {archives.length === 0 && (
          <div style={{ padding: '20px 10px', fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            No archives yet.<br />Create one to start.
          </div>
        )}
        {archives.map(arc => (
          <div
            key={arc.id}
            className={`archive-item ${activeId === arc.id ? 'active' : ''}`}
            onClick={() => onSelect(arc.id)}
          >
            <div className="archive-item-row">
              <div className="archive-item-name">{arc.name}</div>
              <span style={{ fontSize: 12 }}>{arc.tier === 'vhigh' || arc.tier === 'high' ? '🟢' : arc.tier === 'moderate' ? '🟡' : arc.tier === 'low' ? '🔴' : ''}</span>
            </div>
            <div className="archive-item-meta">
              {arc.messageCount || 0} {t.msgs}
              {arc.updatedAt ? ` · ${new Date(arc.updatedAt).toLocaleDateString()}` : ''}
            </div>
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        <div className="api-status">
          <div className={`api-dot ${apiKey ? 'on' : ''}`} />
          {apiKey ? t.apiConnected : t.noApiKey}
        </div>
        <button className="btn-settings" onClick={onSettings}>{t.settings}</button>
      </div>

      {showNew && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowNew(false)}>
          <div className="modal">
            <div className="modal-title">{t.newArchiveTitle}</div>
            <div className="modal-sub">{t.newArchiveSub}</div>
            <div className="form-group">
              <label className="form-label">{t.archiveNameLabel}</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder={t.archiveNamePlaceholder} style={{ width: '100%' }}
                onKeyDown={e => e.key === 'Enter' && handleCreate()} autoFocus />
            </div>
            <div className="form-group">
              <label className="form-label">{t.yourNameLabel}</label>
              <input type="text" value={myName} onChange={e => setMyName(e.target.value)}
                placeholder={t.yourNamePlaceholder} style={{ width: '100%' }} />
            </div>
            <div className="form-group">
              <label className="form-label">{t.contextLabel}</label>
              <textarea value={note} onChange={e => setNote(e.target.value)}
                placeholder={t.contextPlaceholder} style={{ width: '100%', minHeight: 64 }} />
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowNew(false)}>{t.cancel}</button>
              <button className="btn-primary" onClick={handleCreate} disabled={!name.trim()}>
                {t.createArchive}
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
