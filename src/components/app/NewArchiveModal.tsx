'use client';

import { useState } from 'react';
import { getT } from '@/lib/i18n';

// Keep in sync with ATTACHMENT_STYLES in @/lib/schemas/archive.
const ATTACHMENTS = ['secure', 'anxious', 'avoidant', 'disorganized', 'unknown'];

export default function NewArchiveModal({
  lang,
  onCreate,
  onClose,
}: {
  lang: string;
  onCreate: (data: {
    name: string;
    context?: string;
    mbti?: string;
    attachment?: string;
    traits?: string;
  }) => Promise<void>;
  onClose: () => void;
}) {
  const t = getT(lang);
  const [name, setName] = useState('');
  const [context, setContext] = useState('');
  const [mbti, setMbti] = useState('');
  const [attachment, setAttachment] = useState('');
  const [traits, setTraits] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function create() {
    if (!name.trim()) return;
    setBusy(true);
    setError('');
    try {
      await onCreate({
        name: name.trim(),
        context: context.trim() || undefined,
        mbti: mbti.trim() || undefined,
        attachment: attachment || undefined,
        traits: traits.trim() || undefined,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create');
      setBusy(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">{t.newArchiveTitle}</div>
        <div className="modal-sub">{t.newArchiveSub}</div>

        {error && <div className="error-banner" style={{ margin: '0 0 14px' }}>{error}</div>}

        <div className="form-group">
          <label className="form-label">{t.archiveNameLabel}</label>
          <input
            type="text"
            autoFocus
            placeholder={t.archiveNamePlaceholder}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && create()}
          />
        </div>

        <div className="form-group">
          <label className="form-label">{t.contextLabel}</label>
          <textarea
            rows={3}
            placeholder={t.contextPlaceholder}
            value={context}
            onChange={(e) => setContext(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">{t.mbtiLabel}</label>
            <input type="text" placeholder="e.g. ISFP" value={mbti} onChange={(e) => setMbti(e.target.value)} />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">{t.attachmentLabel}</label>
            <select value={attachment} onChange={(e) => setAttachment(e.target.value)}>
              <option value="">{t.attachmentNone}</option>
              {ATTACHMENTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">{t.traitsLabel}</label>
          <input
            type="text"
            placeholder={t.traitsPlaceholder}
            value={traits}
            onChange={(e) => setTraits(e.target.value)}
          />
        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>
            {t.cancel}
          </button>
          <button className="btn-primary" onClick={create} disabled={busy || !name.trim()}>
            {busy ? '…' : t.createArchive}
          </button>
        </div>
      </div>
    </div>
  );
}
