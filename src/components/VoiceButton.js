import React, { useState, useRef } from 'react';
import { LANGUAGES } from '../utils/i18n';

export default function VoiceButton({ onTranscript, lang, t }) {
  const [state, setState] = useState('idle'); // idle | recording | processing
  const [secs, setSecs] = useState(0);
  const recRef = useRef(null);
  const timerRef = useRef(null);

  const speechCode = LANGUAGES.find(l => l.code === lang)?.speechCode || 'en-US';
  const supported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const start = () => {
    if (!supported) { alert('Speech recognition not supported. Try Chrome.'); return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const r = new SR();
    r.continuous = true;
    r.interimResults = false;
    r.lang = speechCode;
    let transcript = '';
    r.onresult = (e) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        transcript += e.results[i][0].transcript + ' ';
      }
    };
    r.onend = () => {
      clearInterval(timerRef.current);
      setState('processing');
      setTimeout(() => {
        onTranscript(transcript.trim() || '…');
        setState('idle');
        setSecs(0);
      }, 400);
    };
    r.onerror = () => { clearInterval(timerRef.current); setState('idle'); setSecs(0); };
    recRef.current = r;
    r.start();
    setState('recording');
    setSecs(0);
    timerRef.current = setInterval(() => setSecs(s => s + 1), 1000);
  };

  const stop = () => { recRef.current?.stop(); clearInterval(timerRef.current); };
  const fmt = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  if (state === 'recording') return (
    <button className="voice-btn recording" onClick={stop}>
      <span className="voice-dot" />
      {fmt(secs)} — {t.tapStop}
    </button>
  );
  if (state === 'processing') return (
    <button className="voice-btn processing" disabled>{t.transcribing}</button>
  );
  return (
    <button className="voice-btn" onClick={start}>{t.voiceNote}</button>
  );
}
