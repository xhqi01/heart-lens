import React, { useState } from 'react';
import { v4 as uuid } from 'uuid';
import VoiceButton from './VoiceButton';

export default function JournalTab({ entries, onAdd, onDelete, lang, t }) {
  const [text, setText] = useState('');
  const [tagInput, setTagInput] = useState('');

  const handleAdd = (content, type = 'text') => {
    if (!content.trim()) return;
    const tags = tagInput.split(',').map(s => s.trim()).filter(Boolean);
    onAdd({
      id: uuid(),
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' }),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      text: content.trim(),
      type,
      tags,
      createdAt: Date.now(),
    });
    setText('');
    setTagInput('');
  };

  return (
    <div className="journal-panel">
      <div className="journal-intro">
        <span style={{ fontSize: 20, marginTop: 1 }}>📓</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{t.newEntry}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{t.journalDesc}</div>
        </div>
      </div>

      <div className="card">
        <div className="section-label">{t.newEntry}</div>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={t.journalPlaceholder}
          style={{ width: '100%', minHeight: 88, boxSizing: 'border-box' }}
        />
        <div style={{ marginTop: 9, display: 'flex', gap: 7, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            placeholder={t.tagsPlaceholder}
            style={{ flex: 1, minWidth: 150, fontFamily: 'var(--mono)', fontSize: 11 }}
          />
          <VoiceButton lang={lang} t={t} onTranscript={txt => handleAdd(txt, 'voice')} />
          <button
            className="btn-primary"
            onClick={() => handleAdd(text)}
            disabled={!text.trim()}
          >
            {t.saveEntry}
          </button>
        </div>
      </div>

      {entries.map(entry => (
        <div key={entry.id} className="journal-entry-card">
          <div className="journal-entry-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <span>{entry.type === 'voice' ? '🎙' : '✏️'}</span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-secondary)' }}>{entry.date}</span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-muted)' }}>{entry.time}</span>
              {entry.type === 'voice' && entry.duration && (
                <span className="chip" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                  {entry.duration}
                </span>
              )}
            </div>
            <button
              onClick={() => onDelete(entry.id)}
              style={{ fontSize: 11, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px' }}>
              ✕
            </button>
          </div>
          <div className="journal-entry-body">
            <div style={{ fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.8 }}>{entry.text}</div>
            {entry.tags?.length > 0 && (
              <div className="journal-tags">
                {entry.tags.map((tag, i) => (
                  <span key={i} className="chip" style={{ background: 'var(--border-soft)', color: 'var(--text-muted)' }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}

      {entries.length === 0 && (
        <div className="empty-state">No entries yet. Write or record what happened.</div>
      )}
    </div>
  );
}
