import React, { useState, useRef } from 'react';
import { analyzeImage } from '../utils/ai';

export default function ImageAnalysisView({ apiKey, archiveContext, lang, t, onError }) {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const fileRef = useRef();

  const handleFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      const [header, base64] = dataUrl.split(',');
      const mediaType = header.match(/:(.*?);/)[1];
      setImage({ base64, mediaType, url: dataUrl });
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) handleFile(file);
  };

  const handleAnalyze = async () => {
    if (!image) return;
    if (!apiKey) { onError('Set your API key in Settings first.'); return; }
    setLoading(true);
    setResult(null);
    onError('');
    try {
      const r = await analyzeImage(apiKey, image.base64, image.mediaType, archiveContext, lang);
      setResult(r);
    } catch (e) {
      onError(e.message);
    }
    setLoading(false);
  };

  return (
    <div className="image-panel">
      <div
        className="image-drop"
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => !image && fileRef.current.click()}
      >
        {image ? (
          <div>
            <img src={image.url} alt="Screenshot"
              style={{ maxWidth: 400, maxHeight: 280, margin: '0 auto', display: 'block', borderRadius: 8 }} />
            <div style={{ marginTop: 14, display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button className="btn-secondary" onClick={e => { e.stopPropagation(); setImage(null); setResult(null); }}>
                Clear
              </button>
              <button className="btn-primary" onClick={e => { e.stopPropagation(); handleAnalyze(); }} disabled={loading}>
                {loading ? t.analyzing : '◈ Analyze Screenshot'}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 32, marginBottom: 9 }}>🖼</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 5 }}>{t.dropScreenshot}</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-muted)', marginBottom: 14 }}>
              PNG, JPG, WEBP
            </div>
            <button className="btn-secondary" onClick={e => { e.stopPropagation(); fileRef.current.click(); }}>
              {t.chooseFile}
            </button>
          </>
        )}
      </div>

      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
        onChange={e => handleFile(e.target.files[0])} />

      {loading && (
        <div className="analysis-loading">
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{t.analyzing}</div>
          <div className="loading-bar" />
        </div>
      )}

      {result && (
        <div className="card image-result">
          {result.summary && (
            <div>
              <div className="section-label">Summary</div>
              <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.8, marginBottom: 14 }}>
                {result.summary}
              </div>
            </div>
          )}

          {result.senderMood && (
            <div style={{ marginBottom: 14 }}>
              <div className="section-label">Their Mood</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{result.senderMood}</div>
            </div>
          )}

          <div className="flag-2col" style={{ marginBottom: 14 }}>
            <div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--positive)', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '.06em' }}>✓ Green Flags</div>
              {(result.greenFlags || []).length > 0
                ? result.greenFlags.map((f, i) => <div key={i} className="signal-item signal-positive">{f}</div>)
                : <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>None detected</div>
              }
            </div>
            <div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--accent)', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '.06em' }}>⚠ Red Flags</div>
              {(result.redFlags || []).length > 0
                ? result.redFlags.map((f, i) => <div key={i} className="signal-item signal-warning">{f}</div>)
                : <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>None detected</div>
              }
            </div>
          </div>

          {result.suggestedReply && (
            <div style={{ marginBottom: 14 }}>
              <div className="section-label">Suggested Reply</div>
              <div className="predicted-reply-box">
                <div className="predicted-reply-text">"{result.suggestedReply}"</div>
              </div>
            </div>
          )}

          {result.overallRead && (
            <div className="advice-box">💡 {result.overallRead}</div>
          )}
        </div>
      )}
    </div>
  );
}
