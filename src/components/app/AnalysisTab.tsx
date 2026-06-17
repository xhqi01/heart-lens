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

      {a.persona && <PersonaSection persona={a.persona as Record<string, any>} t={t} />}
    </div>
  );
}

const chipStyle = { background: 'var(--accent-light)', color: 'var(--accent)' };
const warnChip = { background: 'var(--warning-light)', color: 'var(--warning)' };

function Row({ label, children }: { label: string; children: any }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div className="pattern-key" style={{ marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>{children}</div>
    </div>
  );
}

function Pattern({ k, v }: { k: string; v: string }) {
  return (
    <div className="pattern-item">
      <div className="pattern-key">{k}</div>
      <div className="pattern-val">{v}</div>
    </div>
  );
}

function PersonaSection({ persona, t }: { persona: Record<string, any>; t: Record<string, string> }) {
  const ex = persona.expressionStyle || {};
  const em = persona.emotionalPatterns || {};
  const cc = persona.conflictChain || {};
  const rr = persona.relationshipRole || {};
  const arr = (v: any): any[] => (Array.isArray(v) ? v : []);

  return (
    <>
      {arr(persona.coreRules).length > 0 && (
        <div className="card">
          <div className="section-label">
            {t.personaTitle} · {t.coreRules}
          </div>
          {persona.coreRules.map((r: string, i: number) => (
            <div key={i} className="insight-item">
              {r}
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <div className="section-label">{t.expressionStyle}</div>
        {arr(ex.catchphrases).length > 0 && (
          <Row label={t.catchphrases}>
            {ex.catchphrases.map((c: string, i: number) => (
              <span key={i} className="chip" style={chipStyle}>
                {c}
              </span>
            ))}
          </Row>
        )}
        {arr(ex.highFrequencyWords).length > 0 && (
          <Row label={t.highFrequencyWords}>
            {ex.highFrequencyWords.map((c: string, i: number) => (
              <span key={i} className="chip" style={chipStyle}>
                {c}
              </span>
            ))}
          </Row>
        )}
        {arr(ex.signatureEmoji).length > 0 && (
          <Row label={t.signatureEmoji}>
            {ex.signatureEmoji.map((e: any, i: number) => (
              <span key={i} className="chip" style={chipStyle}>
                {typeof e === 'object' ? `${e.emoji} ${e.context || ''}` : e}
              </span>
            ))}
          </Row>
        )}
        <div className="patterns-grid" style={{ marginTop: 8 }}>
          {ex.replyRhythm && <Pattern k={t.replyRhythm} v={ex.replyRhythm} />}
          {ex.sentenceStyle && <Pattern k={t.sentenceStyle} v={ex.sentenceStyle} />}
          {ex.disengagementSignals && <Pattern k={t.disengagementSignals} v={ex.disengagementSignals} />}
        </div>
      </div>

      {Object.keys(em).length > 0 && (
        <div className="card">
          <div className="section-label">{t.emotionalPatterns}</div>
          <div className="patterns-grid">
            {(['showsCare', 'showsDispleasure', 'apology', 'affection'] as const).map((k) =>
              em[k] ? (
                <div key={k} className="pattern-item">
                  <div className="pattern-key">{k}</div>
                  <div className="pattern-val">
                    {em[k].how || String(em[k])}
                    {em[k].quote ? (
                      <em style={{ display: 'block', color: 'var(--text-muted)', marginTop: 3 }}>“{em[k].quote}”</em>
                    ) : null}
                  </div>
                </div>
              ) : null,
            )}
          </div>
        </div>
      )}

      {(arr(cc.triggers).length > 0 || cc.firstReaction) && (
        <div className="card">
          <div className="section-label">{t.conflictPattern}</div>
          {arr(cc.triggers).length > 0 && (
            <Row label="triggers">
              {cc.triggers.map((c: string, i: number) => (
                <span key={i} className="chip" style={warnChip}>
                  {c}
                </span>
              ))}
            </Row>
          )}
          <div className="patterns-grid" style={{ marginTop: 8 }}>
            {cc.firstReaction && <Pattern k="first reaction" v={cc.firstReaction} />}
            {cc.escalation && <Pattern k="escalation" v={cc.escalation} />}
            {cc.coldWar && <Pattern k="cold war" v={cc.coldWar} />}
            {cc.reconciliation && <Pattern k="reconciliation" v={cc.reconciliation} />}
          </div>
        </div>
      )}

      {Object.keys(rr).length > 0 && (
        <div className="card">
          <div className="section-label">{t.relationshipRole}</div>
          <div className="patterns-grid">
            {rr.initiation && <Pattern k="initiation" v={rr.initiation} />}
            {rr.disappearingSigns && <Pattern k="disappearing signs" v={rr.disappearingSigns} />}
            {rr.reappearing && <Pattern k="reappearing" v={rr.reappearing} />}
          </div>
          {arr(rr.boundaryTopics).length > 0 && (
            <Row label="boundary topics">
              {rr.boundaryTopics.map((c: string, i: number) => (
                <span key={i} className="chip" style={chipStyle}>
                  {c}
                </span>
              ))}
            </Row>
          )}
        </div>
      )}
    </>
  );
}
