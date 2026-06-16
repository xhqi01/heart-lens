import React, { useState } from 'react';
import { LANGUAGES } from '../utils/i18n';

export default function LangPicker({ lang, onChange }) {
  const [open, setOpen] = useState(false);
  const cur = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  return (
    <div className="lang-picker">
      <button className="lang-btn" onClick={() => setOpen(o => !o)}>
        {cur.flag} {cur.name} ▾
      </button>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setOpen(false)} />
          <div className="lang-dropdown">
            {LANGUAGES.map(l => (
              <div key={l.code}
                className={`lang-option ${l.code === lang ? 'active' : ''}`}
                onClick={() => { onChange(l.code); setOpen(false); }}>
                <span>{l.flag}</span> {l.name}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
