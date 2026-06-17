'use client';

import { useRef, useState } from 'react';
import { getT } from '@/lib/i18n';
import type { ArchiveDetail } from '@/lib/client/types';

export default function MessagesTab({
  detail,
  lang,
  onAddMessage,
  onImport,
}: {
  detail: ArchiveDetail;
  lang: string;
  onAddMessage: (sender: 'me' | 'them', content: string) => Promise<void>;
  onImport: (content: string, myUsername?: string) => Promise<void>;
}) {
  const t = getT(lang);
  const [sender, setSender] = useState<'me' | 'them'>('me');
  const [text, setText] = useState('');
  const [myUsername, setMyUsername] = useState('');
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function add() {
    if (!text.trim()) return;
    setBusy(true);
    try {
      await onAddMessage(sender, text.trim());
      setText('');
    } finally {
      setBusy(false);
    }
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const content = await file.text();
    await onImport(content, myUsername.trim() || undefined);
    if (fileRef.current) fileRef.current.value = '';
  }

  const messages = detail.messages;
  const shown = messages.slice(-100);

  return (
    <div className="messages-panel">
      <div className="import-card">
        <div className="section-label">{t.importTitle}</div>
        <div className="import-grid">
          <button className="import-btn" onClick={() => fileRef.current?.click()}>
            <span className="import-btn-icon">📸</span> Instagram JSON
          </button>
          <button className="import-btn" onClick={() => fileRef.current?.click()}>
            <span className="import-btn-icon">💬</span> WhatsApp JSON
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          style={{ display: 'none' }}
          onChange={handleFile}
        />
        <input
          type="text"
          placeholder={t.yourNamePlaceholder}
          value={myUsername}
          onChange={(e) => setMyUsername(e.target.value)}
          style={{ marginBottom: 10 }}
        />
        <div className="import-hint">{t.importHint}</div>
      </div>

      <div className="messages-list-card">
        <div className="messages-list-header">
          <span className="section-label" style={{ margin: 0 }}>
            {t.tabMessages}
          </span>
          <span className="archive-item-meta">
            {messages.length > 100
              ? t.showingLast.replace('{n}', String(messages.length))
              : `${messages.length} ${t.msgs}`}
          </span>
        </div>
        <div className="messages-scroll">
          {shown.length === 0 ? (
            <div className="empty-state">{t.noMessages}</div>
          ) : (
            shown.map((m) => (
              <div key={m.id} className={`msg-row ${m.sender === 'me' ? 'me' : 'them'}`}>
                <span className={`msg-tag ${m.sender === 'me' ? 'me' : 'them'}`}>
                  {m.sender === 'me' ? t.me : t.them}
                </span>
                <div className={`msg-bubble ${m.sender === 'me' ? 'me' : 'them'}`}>{m.content}</div>
              </div>
            ))
          )}
        </div>
        <div className="messages-list-footer">
          <div className="sender-toggle">
            <button className={`sender-btn me${sender === 'me' ? ' active' : ''}`} onClick={() => setSender('me')}>
              {t.me}
            </button>
            <button
              className={`sender-btn them${sender === 'them' ? ' active' : ''}`}
              onClick={() => setSender('them')}
            >
              {t.them}
            </button>
          </div>
          <input
            type="text"
            placeholder={t.addMessage}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && add()}
            style={{ flex: 1 }}
          />
          <button className="btn-primary" onClick={add} disabled={busy || !text.trim()}>
            {t.add}
          </button>
        </div>
      </div>
    </div>
  );
}
