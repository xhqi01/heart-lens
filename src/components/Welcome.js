import React from 'react';

export default function Welcome({ apiKey, t, onOpenSettings }) {
  return (
    <div className="welcome">
      <div className="welcome-eyebrow">HeartLens v1.0</div>
      <h1 className="welcome-title">Read between<br />the <em>lines.</em></h1>
      <p className="welcome-sub">
        AI-powered conversation analysis. Understand patterns, predict responses,
        and make smarter decisions — all running locally in your browser.
        Your data never leaves your device.
      </p>
      <div className="welcome-steps">
        <div className="welcome-step">
          <div className="step-num">01</div>
          <div className="step-text"><strong>Connect your API key.</strong> HeartLens uses Claude AI for analysis. Your key is stored locally and calls are made directly from your browser.</div>
        </div>
        <div className="welcome-step">
          <div className="step-num">02</div>
          <div className="step-text"><strong>Create an archive</strong> for the person you want to analyze. Each archive is isolated — different people, different insights.</div>
        </div>
        <div className="welcome-step">
          <div className="step-num">03</div>
          <div className="step-text"><strong>Import chats or add messages manually.</strong> Supports Instagram & WhatsApp JSON exports, screenshot analysis, or manual entry.</div>
        </div>
        <div className="welcome-step">
          <div className="step-num">04</div>
          <div className="step-text"><strong>Write journal entries</strong> about what happened in person — gut feelings, context. These feed into analysis.</div>
        </div>
        <div className="welcome-step">
          <div className="step-num">05</div>
          <div className="step-text"><strong>Analyze & predict.</strong> Get pattern breakdowns, engagement level, and response predictions for messages you're drafting.</div>
        </div>
      </div>
      <div className="welcome-cta">
        {!apiKey && (
          <button className="btn-primary" onClick={onOpenSettings}>
            {t.saveKey} API Key →
          </button>
        )}
        {!apiKey && (
          <div style={{ marginTop: 16, fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--mono)', lineHeight: 1.7 }}>
            Get your key at console.anthropic.com<br />
            ~$0.003–0.008 per analysis
          </div>
        )}
      </div>
    </div>
  );
}
