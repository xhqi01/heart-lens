'use client';

import { useState } from 'react';
import { getT } from '@/lib/i18n';

export default function NewArchiveModal({
  lang,
  onCreate,
  onClose,
}: {
  lang: string;
  onCreate: (data: { name: string; context?: string }) => Promise<void>;
  onClose: () => void;
}) {
  const t = getT(lang);
  const [name, setName] = useState('');
  const [context, setContext] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function create() {
    if (!name.trim()) return;
    setBusy(true);
    setError('');
    try {
      await onCreate({ name: name.trim(), context: context.trim() || undefined });
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
