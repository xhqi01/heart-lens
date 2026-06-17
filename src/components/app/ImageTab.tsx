'use client';

import { useState } from 'react';
import { getT } from '@/lib/i18n';
import type { AnyJson } from '@/lib/client/types';

export default function ImageTab({
  lang,
  onAnalyze,
}: {
  lang: string;
  onAnalyze: (base64: string, mediaType: string) => Promise<AnyJson>;
}) {
  const t = getT(lang);
  const [preview, setPreview] = useState<string | null>(null);
  const [base64, setBase64] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState('image/png');
  const [result, setResult] = useState<Record<string, any> | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setMediaType(file.type || 'image/png');
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPreview(dataUrl);
      setBase64(dataUrl.replace(/^data:[^;]+;base64,/, ''));
    };
    reader.readAsDataURL(file);
  }

  async function analyze() {
    if (!base64) return;
    setBusy(true);
    setError('');
    try {
      setResult((await onAnalyze(base64, mediaType)) as Record<string, any>);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="image-panel">
      <label className="image-drop">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="screenshot" style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 8 }} />
        ) : (
          <div className="pattern-val">{t.dropScreenshot}</div>
        )}
        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={onFile} />
      </label>

      {base64 && (
        <button className="btn-primary" onClick={analyze} disabled={busy}>
          {busy ? t.analyzing : t.analyze}
        </button>
      )}
      {error && <div className="error-banner" style={{ margin: 0 }}>{error}</div>}

      {result && (
        <div className="card image-result">
          <div>
            <div className="section-label">{t.commStyle}</div>
            <div className="pattern-val">{result.summary}</div>
          </div>
          {result.senderMood && (
            <span className="chip" style={{ background: 'var(--accent-light)', color: 'var(--accent)', alignSelf: 'flex-start' }}>
              {result.senderMood}
            </span>
          )}
          <div className="flag-2col">
            <div>
              <div className="section-label">{t.greenFlags}</div>
              {(result.greenFlags || []).map((s: string, i: number) => (
                <div key={i} className="signal-item signal-positive">
                  {s}
                </div>
              ))}
            </div>
            <div>
              <div className="section-label">{t.watchOut}</div>
              {(result.redFlags || []).map((s: string, i: number) => (
                <div key={i} className="signal-item signal-warning">
                  {s}
                </div>
              ))}
            </div>
          </div>
          {result.suggestedReply && (
            <div className="predicted-reply-box">
              <div className="predicted-reply-label">{t.likelyResponse}</div>
              <div className="predicted-reply-text">{result.suggestedReply}</div>
            </div>
          )}
          {result.overallRead && <div className="advice-box">{result.overallRead}</div>}
        </div>
      )}
    </div>
  );
}
