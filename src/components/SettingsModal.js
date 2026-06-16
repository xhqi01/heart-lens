import React, { useState } from 'react';
import { LANGUAGES } from '../utils/i18n';

export default function SettingsModal({ apiKey, lang, onSave, onClose, t }) {
  const [key, setKey] = useState(apiKey || '');
  const [selectedLang, setSelectedLang] = useState(lang || 'en');
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    await onSave(key.trim(), selectedLang);
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 700);
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">{t.settingsTitle}</div>
        <div className="modal-sub">{t.settingsSub}</div>

        <div className="form-group">
          <label className="form-label">{t.apiKeyLabel}</label>
          <input type="password" value={key} onChange={e => setKey(e.target.value)}
            placeholder="sk-ant-..." style={{ width: '100%' }}
            onKeyDown={e => e.key === 'Enter' && handleSave()} autoFocus />
        </div>

        <div className="form-group">
          <label className="form-label">{t.languageLabel} — {t.uiLanguage}</label>
          <div className="lang-grid">
            {LANGUAGES.map(l => (
              <button key={l.code}
                className={`lang-chip-btn ${selectedLang === l.code ? 'active' : ''}`}
                onClick={() => setSelectedLang(l.code)}>
                {l.flag} {l.name}
              </button>
            ))}
          </div>
        </div>

        <div className="privacy-note">{t.privacyNote}</div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>{t.cancel}</button>
          <button className="btn-primary" onClick={handleSave}>
            {saved ? t.saved : t.saveKey}
          </button>
        </div>
      </div>
    </div>
  );
}
