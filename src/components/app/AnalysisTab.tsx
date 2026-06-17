'use client';

import { getT, getTierLabel, TIERS, type TierKey } from '@/lib/i18n';
import type { AnyJson } from '@/lib/client/types';

export default function AnalysisTab({
  analysis,
  lang,
  loading,
  error,
}: {
  analysis: AnyJson | null;
  lang: string;
  loading: boolean;
  error: string;
}) {
  const t = getT(lang);

  if (loading)
    return (
      <div className="analysis-loading">
        {t.analyzing}
        <div className="loading-bar" />
      </div>
    );
  if (error) return <div className="error-banner" style={{ margin: 0 }}>{error}</div>;
  if (!analysis) return <div className="empty-state">{t.noAnalysisYet}</div>;

  const a = analysis as Record<string, any>;
  const tierKey = (a.tier || 'moderate') as TierKey;
  const tier = TIERS[tierKey] ?? TIERS.moderate;
  const stats = a.messageStats || {};

  return (
    <div className="analysis-panel">
      <div className="card">
        <div className="score-hero">
          <div className="tier-circle" style={{ borderColor: tier.color, background: tier.bg }}>
            <span className="tier-dot">{tier.dot}</span>
            <span className="tier-label" style={{ color: tier.color }}>
              {getTierLabel(tierKey, lang)}
            </span>
          </div>
          <div>
            <div className="section-label">{t.engScore}</div>
            <div style={{ fontSize: 13, lineHeight: 1.7 }}>{a.summary}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="section-label">{t.stats}</div>
        <div className="stats-row">
          <div className="stat-item">
            <div className="stat-value">{stats.totalMessages ?? '—'}</div>
            <div className="stat-key">{t.total}</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{stats.meCount ?? '—'}</div>
            <div className="stat-key">{t.fromYou}</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{stats.themCount ?? '—'}</div>
            <div className="stat-key">{t.fromThem}</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{stats.avgThemLength ?? '—'}</div>
            <div className="stat-key">{t.avgWords}</div>
          </div>
        </div>
      </div>

      <div className="analysis-2col">
        <div className="card">
          <div className="section-label">{t.greenFlags}</div>
          {(a.positiveSignals || []).map((s: string, i: number) => (
            <div key={i} className="signal-item signal-positive">
              {s}
            </div>
          ))}
        </div>
        <div className="card">
          <div className="section-label">{t.watchOut}</div>
          {(a.warningSignals || []).map((s: string, i: number) => (
            <div key={i} className="signal-item signal-warning">
              {s}
            </div>
          ))}
        </div>
      </div>

      {Array.isArray(a.topicReactions) && a.topicReactions.length > 0 && (
        <div className="card">
          <div className="section-label">{t.topicReactions}</div>
          {a.topicReactions.map((tr: { topic: string; score: number }, i: number) => {
            const score = Number(tr.score) || 0;
            const color = score >= 0 ? 'var(--positive)' : 'var(--accent)';
            return (
              <div key={i} className="topic-row">
                <span className="topic-name">{tr.topic}</span>
                <div className="topic-bar-wrap">
                  <div className="topic-bar" style={{ width: `${Math.abs(score)}%`, background: color }} />
                </div>
                <span className="topic-dots">{score > 0 ? `+${score}` : score}</span>
              </div>
            );
          })}
        </div>
      )}

      {a.communicationStyle && (
        <div className="card">
          <div className="section-label">{t.commStyle}</div>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{a.communicationStyle.label}</div>
          <div className="pattern-val">{a.communicationStyle.description}</div>
          {a.communicationStyle.attachment && (
            <span className="chip attachment-chip" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
              {a.communicationStyle.attachment}
            </span>
          )}
        </div>
      )}

      {a.patterns && (
        <div className="card">
          <div className="section-label">{t.patterns}</div>
          <div className="patterns-grid">
            {Object.entries(a.patterns).map(([k, v]) => (
              <div key={k} className="pattern-item">
                <div className="pattern-key">{k}</div>
                <div className="pattern-val">{String(v)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {Array.isArray(a.keyInsights) && a.keyInsights.length > 0 && (
        <div className="card">
          <div className="section-label">{t.keyInsights}</div>
          {a.keyInsights.map((s: string, i: number) => (
            <div key={i} className="insight-item">
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
