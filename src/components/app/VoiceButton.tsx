'use client';

import { useRef, useState } from 'react';
import { LANGUAGES, getT } from '@/lib/i18n';

// Speech-to-text via the Web Speech API (Chromium browsers). Streams the
// running transcript to the parent.
export default function VoiceButton({
  lang,
  onTranscript,
}: {
  lang: string;
  onTranscript: (text: string) => void;
}) {
  const t = getT(lang);
  const [recording, setRecording] = useState(false);
  const recRef = useRef<{ stop: () => void } | null>(null);
  const speechCode = LANGUAGES.find((l) => l.code === lang)?.speechCode || 'en-US';

  function toggle() {
    const SR =
      (window as unknown as { SpeechRecognition?: new () => any; webkitSpeechRecognition?: new () => any })
        .SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => any }).webkitSpeechRecognition;
    if (!SR) {
      alert('Voice input is not supported in this browser.');
      return;
    }
    if (recording) {
      recRef.current?.stop();
      return;
    }
    const rec = new SR();
    rec.lang = speechCode;
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => {
      let text = '';
      for (let i = 0; i < e.results.length; i++) text += e.results[i][0].transcript;
      onTranscript(text);
    };
    rec.onend = () => setRecording(false);
    rec.onerror = () => setRecording(false);
    recRef.current = rec;
    rec.start();
    setRecording(true);
  }

  return (
    <button type="button" className={`voice-btn${recording ? ' recording' : ''}`} onClick={toggle}>
      {recording && <span className="voice-dot" />}
      {recording ? t.tapStop : t.voiceNote}
    </button>
  );
}
