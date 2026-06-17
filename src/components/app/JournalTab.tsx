'use client';

import { useState } from 'react';
import { getT } from '@/lib/i18n';
import VoiceButton from './VoiceButton';
import type { ArchiveDetail } from '@/lib/client/types';

export default function JournalTab({
  detail,
  lang,
  onAdd,
  onDelete,
}: {
  detail: ArchiveDetail;
  lang: string;
  onAdd: (data: { text: string; tags?: string; type?: 'text' | 'voice' }) => Promise<void>;
  onDelete: (entryId: string) => Promise<void>;
}) {
  const t = getT(lang);
  const [text, setText] = useState('');
  const [tags, setTags] = useState('');
  const [type, setType] = useState<'text' | 'voice'>('text');
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!text.trim()) return;
    setBusy(true);
    try {
      await onAdd({ text: text.trim(), tags: tags.trim() || undefined, type });
      setText('');
      setTags('');
      setType('text');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="journal-panel">
      <div className="journal-intro">
        <div style={{ fontSize: 22 }}>📓</div>
        <div className="step-text">{t.journalDesc}</div>
      </div>

      <div className="card">
        <div className="section-label">{t.newEntry}</div>
        <textarea
          rows={4}
          placeholder={t.journalPlaceholder}
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ marginBottom: 10 }}
        />
        <input
          type="text"
          placeholder={t.tagsPlaceholder}
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          style={{ marginBottom: 10 }}
        />
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <VoiceButton
            lang={lang}
            onTranscript={(x) => {
              setText(x);
              setType('voice');
            }}
          />
          <button
            className="btn-primary"
            onClick={save}
            disabled={busy || !text.trim()}
            style={{ marginLeft: 'auto' }}
          >
            {t.saveEntry}
          </button>
        </div>
      </div>

      {detail.journal.map((j) => (
        <div key={j.id} className="journal-entry-card">
          <div className="journal-entry-header">
            <span className="archive-item-meta">
              {j.type === 'voice' ? '🎙' : '🖊'} {new Date(j.createdAt).toLocaleString()}
            </span>
            <button className="btn-delete" onClick={() => onDelete(j.id)}>
              ✕
            </button>
          </div>
          <div className="journal-entry-body">
            <div className="pattern-val">{j.text}</div>
            {j.tags && (
              <div className="journal-tags">
                {j.tags.split(',').map((tg, i) => (
                  <span key={i} className="chip" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                    {tg.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
