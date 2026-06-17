'use client';

import { useState } from 'react';
import { getT, LANGUAGES } from '@/lib/i18n';
import { api } from '@/lib/client/api';
import type { PublicConfig } from '@/lib/client/types';

const DEFAULTS = {
  anthropic: { baseUrl: 'https://api.anthropic.com', model: 'claude-sonnet-4-6' },
  openai: { baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o' },
};

export default function SettingsModal({
  lang,
  setLang,
  config,
  onSaved,
  onClose,
}: {
  lang: string;
  setLang: (l: string) => void;
  config: PublicConfig | null;
  onSaved: (c: PublicConfig) => void;
  onClose: () => void;
}) {
  const t = getT(lang);
  const [provider, setProvider] = useState<'anthropic' | 'openai'>(
    (config?.provider as 'anthropic' | 'openai') || 'anthropic',
  );
  const [baseUrl, setBaseUrl] = useState(config?.baseUrl || DEFAULTS.anthropic.baseUrl);
  const [model, setModel] = useState(config?.model || DEFAULTS.anthropic.model);
  const [apiKey, setApiKey] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  function switchProvider(p: 'anthropic' | 'openai') {
    setProvider(p);
    // Only overwrite endpoint/model if the user hasn't customised them.
    if (baseUrl === DEFAULTS.anthropic.baseUrl || baseUrl === DEFAULTS.openai.baseUrl) {
      setBaseUrl(DEFAULTS[p].baseUrl);
    }
    if (model === DEFAULTS.anthropic.model || model === DEFAULTS.openai.model) {
      setModel(DEFAULTS[p].model);
    }
  }

  async function save() {
    setBusy(true);
    setError('');
    try {
      const { config: saved } = await api.saveConfig({ provider, baseUrl, model, apiKey: apiKey || undefined });
      onSaved(saved);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">{t.settingsTitle}</div>
        <div className="modal-sub">{t.settingsSub}</div>

        {error && <div className="error-banner" style={{ margin: '0 0 14px' }}>{error}</div>}

        <div className="form-group">
          <label className="form-label">{t.providerLabel}</label>
          <div className="sender-toggle" style={{ gap: 6 }}>
            <button
              type="button"
              className={`lang-chip-btn${provider === 'anthropic' ? ' active' : ''}`}
              onClick={() => switchProvider('anthropic')}
            >
              {t.providerAnthropic}
            </button>
            <button
              type="button"
              className={`lang-chip-btn${provider === 'openai' ? ' active' : ''}`}
              onClick={() => switchProvider('openai')}
            >
              {t.providerOpenAI}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">{t.baseUrlLabel}</label>
          <input type="text" value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} />
        </div>

        <div className="form-group">
          <label className="form-label">{t.modelLabel}</label>
          <input type="text" value={model} onChange={(e) => setModel(e.target.value)} />
        </div>

        <div className="form-group">
          <label className="form-label">
            {t.apiKeyLabel}
            {config?.maskedKey ? ` — current: ${config.maskedKey}` : ''}
          </label>
          <input
            type="password"
            placeholder={config?.maskedKey ? t.apiKeyPlaceholder : 'sk-...'}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">{t.languageLabel}</label>
          <div className="lang-grid">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                type="button"
                className={`lang-chip-btn${lang === l.code ? ' active' : ''}`}
                onClick={() => setLang(l.code)}
              >
                {l.flag} {l.name}
              </button>
            ))}
          </div>
        </div>

        <div className="privacy-note">{t.privacyNote}</div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>
            {t.cancel}
          </button>
          <button className="btn-primary" onClick={save} disabled={busy}>
            {busy ? '…' : t.saveKey}
          </button>
        </div>
      </div>
    </div>
  );
}
