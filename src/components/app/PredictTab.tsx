'use client';

import { useState } from 'react';
import { getT, getConfLabel, CONFIDENCE, type ConfKey } from '@/lib/i18n';
import type { AnyJson } from '@/lib/client/types';

export default function PredictTab({
  lang,
  onPredict,
}: {
  lang: string;
  onPredict: (draft: string) => Promise<AnyJson>;
}) {
  const t = getT(lang);
  const [draft, setDraft] = useState('');
  const [result, setResult] = useState<Record<string, any> | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function predict() {
    if (!draft.trim()) return;
    setBusy(true);
    setError('');
    try {
      setResult((await onPredict(draft.trim())) as Record<string, any>);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setBusy(false);
    }
  }

  const confKey = result?.confidence as ConfKey | undefined;
  const conf = confKey ? CONFIDENCE[confKey] : null;

  return (
    <div className="predict-panel">
      <div className="card">
        <div className="section-label">{t.predictTitle}</div>
        <div className="pattern-val" style={{ marginBottom: 10 }}>
          {t.predictDesc}
        </div>
        <textarea
          rows={3}
          placeholder={t.addMessage}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') predict();
          }}
          style={{ marginBottom: 10 }}
        />
        <button className="btn-primary" onClick={predict} disabled={busy || !draft.trim()}>
          {busy ? t.analyzing : t.predictBtn}
        </button>
      </div>

      {error && <div className="error-banner" style={{ margin: 0 }}>{error}</div>}

      {result && (
        <div className="predict-result-card">
          <div className="predict-result-header">
            {conf && (
              <>
                <span className="confidence-dot" style={{ background: conf.color }} />
                <span className="confidence-label" style={{ color: conf.color }}>
                  {getConfLabel(confKey as ConfKey, lang)}
                </span>
                <div className="confidence-bar-wrap">
                  <div className="confidence-bar" style={{ width: `${conf.barPct}%`, background: conf.color }} />
                </div>
              </>
            )}
          </div>
          <div className="predict-body">
            <div style={{ display: 'flex', gap: 6 }}>
              {result.predictedTone && (
                <span className="chip" style={{ background: 'var(--panel)', color: 'var(--text-secondary)' }}>
                  {result.predictedTone}
                </span>
              )}
              {result.predictedLength && (
                <span className="chip" style={{ background: 'var(--panel)', color: 'var(--text-secondary)' }}>
                  {result.predictedLength}
                </span>
              )}
            </div>
            <div className="predicted-reply-box">
              <div className="predicted-reply-label">{t.likelyResponse}</div>
              <div className="predicted-reply-text">{result.likelyResponse}</div>
            </div>
            {result.reasoning && (
              <div>
                <div className="section-label">{t.why}</div>
                <div className="pattern-val">{result.reasoning}</div>
              </div>
            )}
            {Array.isArray(result.suggestions) && result.suggestions.length > 0 && (
              <div>
                <div className="section-label">{t.alternatives}</div>
                {result.suggestions.map((s: { version: string; why: string }, i: number) => (
                  <div key={i} className="suggestion-item">
                    <div className="suggestion-text">{s.version}</div>
                    <div className="suggestion-why">{s.why}</div>
                  </div>
                ))}
              </div>
            )}
            {Array.isArray(result.risks) && result.risks.length > 0 && (
              <div>
                <div className="section-label">{t.risks}</div>
                {result.risks.map((r: string, i: number) => (
                  <div key={i} className="risk-item">
                    {r}
                  </div>
                ))}
              </div>
            )}
            {result.overallAdvice && <div className="advice-box">{result.overallAdvice}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
