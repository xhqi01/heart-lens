import React, { useState } from 'react';
import { predictResponse } from '../utils/ai';
import { CONFIDENCE, getConfLabel } from '../utils/i18n';

export default function PredictView({ apiKey, messages, archiveContext, lang, t, onError }) {
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handlePredict = async () => {
    if (!draft.trim()) return;
    if (!apiKey) { onError('Set your API key in Settings first.'); return; }
    if (messages.length < 5) { onError(t.addMoreMessages); return; }
    setLoading(true);
    setResult(null);
    onError('');
    try {
      const r = await predictResponse(apiKey, messages, draft.trim(), archiveContext, lang);
      setResult(r);
    } catch (e) {
      onError(e.message);
    }
    setLoading(false);
  };

  const confData = result ? (CONFIDENCE[result.confidence] || CONFIDENCE['uncertain']) : null;
  const confLabel = result ? getConfLabel(result.confidence, lang) : '';

  return (
    <div className="predict-panel">
      <div className="card">
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 5 }}>{t.predictTitle}</div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 13 }}>
          {t.predictDesc}
        </div>
        <textarea
          value={draft}
          onChange={e => setDraft(e.target.value)}
          placeholder="Type your message..."
          style={{ width: '100%', minHeight: 68, boxSizing: 'border-box' }}
          onKeyDown={e => e.key === 'Enter' && e.metaKey && handlePredict()}
        />
        <div style={{ marginTop: 10, display: 'flex', justifyContent: 'flex-end' }}>
          <button
            className="btn-primary"
            onClick={handlePredict}
            disabled={loading || !draft.trim()}
          >
            {loading ? t.analyzing : t.predictBtn}
          </button>
        </div>
      </div>

      {result && confData && (
        <div className="predict-result-card">
          <div className="predict-result-header">
            <div className="confidence-dot" style={{ background: confData.color }} />
            <div className="confidence-label" style={{ color: confData.color }}>{confLabel}</div>
            <div className="confidence-bar-wrap">
              <div className="confidence-bar" style={{ width: `${confData.barPct}%`, background: confData.color }} />
            </div>
            <span className="chip" style={{ background: 'var(--border-soft)', color: 'var(--text-muted)' }}>
              {result.predictedTone}
            </span>
            <span className="chip" style={{ background: 'var(--border-soft)', color: 'var(--text-muted)' }}>
              {result.predictedLength}
            </span>
          </div>

          <div className="predict-body">
            {/* Likely reply */}
            <div>
              <div className="section-label">{t.likelyResponse}</div>
              <div className="predicted-reply-box">
                <div className="predicted-reply-label">THEM</div>
                <div className="predicted-reply-text">"{result.likelyResponse}"</div>
              </div>
            </div>

            {/* Reasoning */}
            <div>
              <div className="section-label">{t.why}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.8 }}>{result.reasoning}</div>
            </div>

            {/* Timing */}
            {result.timing && (
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--mono)', background: 'var(--panel)', padding: '8px 12px', borderRadius: 'var(--radius)' }}>
                ⏱ {result.timing}
              </div>
            )}

            {/* Suggestions */}
            {result.suggestions?.length > 0 && (
              <div>
                <div className="section-label">{t.alternatives}</div>
                {result.suggestions.map((s, i) => {
                  const sConf = CONFIDENCE[s.confidence] || CONFIDENCE['likely'];
                  const sLabel = getConfLabel(s.confidence, lang);
                  return (
                    <div key={i} className="suggestion-item">
                      <div className="suggestion-text">"{s.version}"</div>
                      <div className="suggestion-why">{s.why}</div>
                      <span className="chip" style={{ background: 'var(--positive-light)', color: 'var(--positive)' }}>
                        ↑ {sLabel}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Risks */}
            {result.risks?.length > 0 && (
              <div>
                <div className="section-label">{t.risks}</div>
                {result.risks.map((r, i) => (
                  <div key={i} className="risk-item">{r}</div>
                ))}
              </div>
            )}

            {/* Advice */}
            {result.overallAdvice && (
              <div className="advice-box">💡 {result.overallAdvice}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
