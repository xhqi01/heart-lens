'use client';

import { useRef, useState } from 'react';
import { getT } from '@/lib/i18n';
import { IMPORT_SOURCES } from '@/lib/parsers/sources';
import type { ArchiveDetail } from '@/lib/client/types';

const actionBtn = {
  background: 'transparent',
  border: 'none',
  color: 'var(--text-muted)',
  cursor: 'pointer',
  fontSize: 11,
  padding: '0 3px',
};

export default function MessagesTab({
  detail,
  lang,
  onAddMessage,
  onImport,
  onEditMessage,
  onDeleteMessage,
  onClearMessages,
}: {
  detail: ArchiveDetail;
  lang: string;
  onAddMessage: (sender: 'me' | 'them', content: string) => Promise<void>;
  onImport: (content: string, opts: { source?: string; myUsername?: string }) => Promise<void>;
  onEditMessage: (messageId: string, content: string) => Promise<void>;
  onDeleteMessage: (messageId: string) => Promise<void>;
  onClearMessages: () => Promise<void>;
}) {
  const t = getT(lang);
  const [sender, setSender] = useState<'me' | 'them'>('me');
  const [text, setText] = useState('');
  const [myUsername, setMyUsername] = useState('');
  const [source, setSource] = useState<string>('instagram');
  const [pasteText, setPasteText] = useState('');
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const current = IMPORT_SOURCES.find((s) => s.id === source) || IMPORT_SOURCES[0];

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
    setBusy(true);
    try {
      const content = await file.text();
      await onImport(content, { source, myUsername: myUsername.trim() || undefined });
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function doPaste() {
    if (!pasteText.trim()) return;
    setBusy(true);
    try {
      await onImport(pasteText, { source: 'paste', myUsername: myUsername.trim() || undefined });
      setPasteText('');
    } finally {
      setBusy(false);
    }
  }

  function startEdit(id: string, content: string) {
    setEditingId(id);
    setEditText(content);
  }

  async function saveEdit() {
    if (!editingId || !editText.trim()) return;
    setBusy(true);
    try {
      await onEditMessage(editingId, editText.trim());
      setEditingId(null);
      setEditText('');
    } finally {
      setBusy(false);
    }
  }

  const messages = detail.messages;
  const shown = messages.slice(-100);

  return (
    <div className="messages-panel">
      <div className="import-card">
        <div className="section-label">{t.importTitle}</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <span className="pattern-key">{t.importSource}</span>
          <select value={source} onChange={(e) => setSource(e.target.value)} style={{ maxWidth: 170 }}>
            {IMPORT_SOURCES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
          {current.fileBased && (
            <button
              className="import-btn"
              style={{ flex: 'none' }}
              onClick={() => fileRef.current?.click()}
              disabled={busy}
            >
              📂 {t.chooseFile}
            </button>
          )}
        </div>

        {current.fileBased && (
          <input
            ref={fileRef}
            type="file"
            accept={current.accept}
            style={{ display: 'none' }}
            onChange={handleFile}
          />
        )}

        {!current.fileBased && (
          <>
            <textarea
              rows={5}
              placeholder={t.pasteHint}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              style={{ marginBottom: 8 }}
            />
            <button
              className="btn-primary"
              onClick={doPaste}
              disabled={busy || !pasteText.trim()}
              style={{ marginBottom: 10 }}
            >
              {t.doImport}
            </button>
          </>
        )}

        <input
          type="text"
          placeholder={t.yourNamePlaceholder}
          value={myUsername}
          onChange={(e) => setMyUsername(e.target.value)}
          style={{ marginBottom: 10 }}
        />
        <div className="import-hint">{current.hint}</div>
      </div>

      <div className="messages-list-card">
        <div className="messages-list-header">
          <span className="section-label" style={{ margin: 0 }}>
            {t.tabMessages}
          </span>
          <span style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span className="archive-item-meta">
              {messages.length > 100
                ? t.showingLast.replace('{n}', String(messages.length))
                : `${messages.length} ${t.msgs}`}
            </span>
            {messages.length > 0 && (
              <button
                onClick={onClearMessages}
                style={{ ...actionBtn, color: 'var(--accent)', fontFamily: 'var(--sans)' }}
              >
                {t.clearAll}
              </button>
            )}
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
                {editingId === m.id ? (
                  <div style={{ display: 'flex', gap: 6, flex: 1, alignItems: 'center' }}>
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                      style={{ flex: 1 }}
                      autoFocus
                    />
                    <button className="btn-primary" onClick={saveEdit} disabled={busy || !editText.trim()}>
                      {t.saveMsg}
                    </button>
                    <button style={actionBtn} onClick={() => setEditingId(null)} title={t.cancel}>
                      ✕
                    </button>
                  </div>
                ) : (
                  <>
                    <div className={`msg-bubble ${m.sender === 'me' ? 'me' : 'them'}`}>{m.content}</div>
                    <span style={{ display: 'flex', alignItems: 'center' }}>
                      <button style={actionBtn} title={t.editMsg} onClick={() => startEdit(m.id, m.content)}>
                        ✎
                      </button>
                      <button style={actionBtn} title="Delete" onClick={() => onDeleteMessage(m.id)}>
                        ✕
                      </button>
                    </span>
                  </>
                )}
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
