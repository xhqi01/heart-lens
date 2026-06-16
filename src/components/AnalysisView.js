import React from 'react';
import { TIERS, getTierLabel, scoreToTier } from '../utils/i18n';

function topicDots(score) {
  if (score >= 60) return '●●●';
  if (score >= 20) return '●●○';
  return '●○○';
}

function topicColor(score) {
  if (score >= 60) return 'var(--positive)';
  if (score >= 0) return 'var(--warning)';
  return 'var(--accent)';
}

function topicBarPct(score) {
  return Math.round(((score + 100) / 200) * 100);
}

export default function AnalysisView({ analysis, analyzing, messageCount, onAnalyze, lang, t }) {
  if (analyzing) {
    return (
      <div className="analysis-loading">
        <div style={{ fontSize: 28, marginBottom: 12 }}>◈</div>
        <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{t.analyzing}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
          {messageCount} {t.msgs}
        </div>
        <div className="loading-bar" />
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="empty-state">
        <div style={{ fontSize: 28, marginBottom: 14 }}>◈</div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
          {messageCount < 5 ? t.addMoreMessages : t.noAnalysisYet}
        </div>
        {messageCount >= 5 && (
          <button className="btn-primary" onClick={onAnalyze}>{t.runAnalysis}</button>
        )}
      </div>
    );
  }

  const {
    summary, tier, patterns, topicReactions, positiveSignals,
    warningSignals, communicationStyle, keyInsights, messageStats,
  } = analysis;

  const tierData = TIERS[tier] || TIERS['moderate'];
  const tierLabel = getTierLabel(tier, lang);

  return (
    <div className="analysis-panel">
      {/* Score hero */}
      <div className="card score-hero">
        <div className="tier-circle" style={{ borderColor: tierData.color, background: tierData.bg }}>
          <div className="tier-dot">{tierData.dot}</div>
          <div className="tier-label" style={{ color: tierData.color }}>{tierLabel}</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{t.engScore}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 10 }}>
            {summary}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {communicationStyle?.attachment && communicationStyle.attachment !== 'unknown' && (
              <span className="chip attachment-chip"
                style={{
                  background: communicationStyle.attachment === 'secure' ? 'var(--positive-light)' : 'var(--warning-light)',
                  color: communicationStyle.attachment === 'secure' ? 'var(--positive)' : 'var(--warning)',
                }}>
                {communicationStyle.attachment} attachment
              </span>
            )}
            {communicationStyle?.label && (
              <span className="chip" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                {communicationStyle.label}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      {messageStats && (
        <div className="card">
          <div className="section-label">{t.stats}</div>
          <div className="stats-row">
            {[
              [messageStats.totalMessages, t.total],
              [messageStats.meCount, t.fromYou],
              [messageStats.themCount, t.fromThem],
              [messageStats.avgThemLength, t.avgWords],
            ].map(([v, k], i) => (
              <div key={k} className="stat-item">
                <div className="stat-value" style={{ color: i === 1 ? 'var(--positive)' : i === 2 ? 'var(--accent)' : 'var(--text-primary)' }}>{v}</div>
                <div className="stat-key">{k}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Flags */}
      <div className="analysis-2col">
        <div className="card">
          <div className="section-label">{t.greenFlags}</div>
          {(positiveSignals || []).map((s, i) => (
            <div key={i} className="signal-item signal-positive">{s}</div>
          ))}
          {(!positiveSignals || positiveSignals.length === 0) && (
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>—</div>
          )}
        </div>
        <div className="card">
          <div className="section-label">{t.watchOut}</div>
          {(warningSignals || []).map((s, i) => (
            <div key={i} className="signal-item signal-warning">{s}</div>
          ))}
          {(!warningSignals || warningSignals.length === 0) && (
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>None detected.</div>
          )}
        </div>
      </div>

      {/* Topic reactions */}
      {topicReactions?.length > 0 && (
        <div className="card">
          <div className="section-label">{t.topicReactions}</div>
          {topicReactions.map((tp, i) => (
            <div key={i} className="topic-row">
              <div className="topic-name">{tp.topic}</div>
              <div className="topic-bar-wrap">
                <div className="topic-bar" style={{ width: `${topicBarPct(tp.score)}%`, background: topicColor(tp.score) }} />
              </div>
              <div className="topic-dots">{topicDots(tp.score)}</div>
            </div>
          ))}
        </div>
      )}

      {/* Style + Patterns */}
      <div className="analysis-2col">
        {communicationStyle && (
          <div className="card">
            <div className="section-label">{t.commStyle}</div>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 7 }}>{communicationStyle.label}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{communicationStyle.description}</div>
          </div>
        )}
        {patterns && (
          <div className="card">
            <div className="section-label">{t.patterns}</div>
            <div className="patterns-grid">
              {Object.entries(patterns).map(([k, v]) => (
                <div key={k} className="pattern-item">
                  <div className="pattern-key">{k.replace(/([A-Z])/g, ' $1').toLowerCase()}</div>
                  <div className="pattern-val">{v}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Insights */}
      {keyInsights?.length > 0 && (
        <div className="card">
          <div className="section-label">{t.keyInsights}</div>
          {keyInsights.map((ins, i) => (
            <div key={i} className="insight-item">{ins}</div>
          ))}
        </div>
      )}
    </div>
  );
}
