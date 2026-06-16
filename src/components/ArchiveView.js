import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  getArchive, getMessages, saveMessage, saveArchive,
  deleteArchive, deleteMessagesByArchive, getAnalyses, saveAnalysis,
} from '../utils/db';
import { parseUploadedJSON } from '../utils/parsers';
import { analyzeConversation } from '../utils/ai';
import { v4 as uuid } from 'uuid';
import LangPicker from './LangPicker';
import AnalysisView from './AnalysisView';
import PredictView from './PredictView';
import ImageAnalysisView from './ImageAnalysisView';
import JournalTab from './JournalTab';

export default function ArchiveView({ archiveId, apiKey, lang, onLangChange, t, onRefresh, onDelete }) {
  const [archive, setArchive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [journal, setJournal] = useState([]);
  const [tab, setTab] = useState('messages');
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [manualSender, setManualSender] = useState('them');
  const [manualContent, setManualContent] = useState('');
  const fileInputRef = useRef();
  const messagesEndRef = useRef();

  useEffect(() => {
    async function load() {
      const [arc, msgs] = await Promise.all([getArchive(archiveId), getMessages(archiveId)]);
      setArchive(arc);
      setMessages(msgs);
      const analyses = await getAnalyses(archiveId);
      if (analyses.length > 0) {
        const latest = analyses.sort((a, b) => b.createdAt - a.createdAt)[0];
        setAnalysis(latest.data);
      }
    }
    load();
  }, [archiveId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleAddManual = async () => {
    if (!manualContent.trim()) return;
    const msg = {
      id: uuid(), archiveId,
      sender: manualSender,
      content: manualContent.trim(),
      timestamp: Date.now(),
      source: 'manual',
    };
    await saveMessage(msg);
    const updated = { ...archive, messageCount: (archive.messageCount || 0) + 1, updatedAt: Date.now() };
    await saveArchive(updated);
    setArchive(updated);
    setMessages(prev => [...prev, msg]);
    setManualContent('');
    onRefresh();
  };

  const handleFileImport = async (file) => {
    try {
      const text = await file.text();
      const parsed = parseUploadedJSON(text, archiveId, archive?.myName);
      if (parsed.length === 0) throw new Error('No messages found in file');
      for (const msg of parsed) await saveMessage(msg);
      const updated = { ...archive, messageCount: (archive.messageCount || 0) + parsed.length, updatedAt: Date.now() };
      await saveArchive(updated);
      setArchive(updated);
      setMessages(prev => [...prev, ...parsed].sort((a, b) => a.timestamp - b.timestamp));
      onRefresh();
      setError('');
    } catch (e) {
      setError(e.message);
    }
  };

  const handleAnalyze = async () => {
    if (!apiKey) { setError('Please set your Anthropic API key in Settings first.'); return; }
    if (messages.length < 5) { setError(t.addMoreMessages); return; }
    setAnalyzing(true);
    setError('');
    setTab('analysis');
    try {
      const journalContext = journal.map(j => j.text).join('\n\n');
      const context = [archive?.note, journalContext].filter(Boolean).join('\n\n');
      const result = await analyzeConversation(apiKey, messages, context, lang);
      // Save tier on archive for sidebar dot
      const updated = { ...archive, tier: result.tier, updatedAt: Date.now() };
      await saveArchive(updated);
      setArchive(updated);
      const rec = { id: uuid(), archiveId, createdAt: Date.now(), data: result };
      await saveAnalysis(rec);
      setAnalysis(result);
      onRefresh();
    } catch (e) {
      setError(e.message);
    }
    setAnalyzing(false);
  };

  const handleDelete = async () => {
    if (!window.confirm((t.deleteConfirm || 'Delete archive?').replace('{name}', archive?.name))) return;
    await deleteMessagesByArchive(archiveId);
    await deleteArchive(archiveId);
    onDelete();
  };

  const handleAddJournal = (entry) => setJournal(prev => [entry, ...prev]);
  const handleDeleteJournal = (id) => setJournal(prev => prev.filter(e => e.id !== id));

  const TABS = [
    ['messages', t.tabMessages],
    ['journal', t.tabJournal],
    ['analysis', t.tabAnalysis],
    ['predict', t.tabPredict],
    ['image', t.tabImage],
  ];

  if (!archive) return <div className="empty-state">Loading...</div>;

  return (
    <div className="archive-view">
      <div className="archive-topbar">
        <div>
          <div className="archive-title">{archive.name}</div>
          <div className="archive-subtitle">
            {messages.length} {t.msgs} · {new Date(archive.createdAt).toLocaleDateString()}
            {journal.length > 0 && ` · ${journal.length} journal entries`}
            {archive.note && ` · ${archive.note}`}
          </div>
        </div>
        <div className="topbar-actions">
          <LangPicker lang={lang} onChange={onLangChange} />
          <button className="btn-analyze" onClick={handleAnalyze} disabled={analyzing || messages.length < 5}>
            {analyzing ? t.analyzing : t.analyze}
          </button>
          <button className="btn-delete" onClick={handleDelete} title="Delete archive">✕</button>
        </div>
      </div>

      {error && <div className="error-banner">⚠ {error}</div>}

      <div className="archive-tabs">
        {TABS.map(([id, label]) => (
          <button key={id} className={`tab ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </div>

      <div className="archive-content">
        {tab === 'messages' && (
          <div className="messages-panel">
            <div className="import-card">
              <div className="section-label">{t.importTitle}</div>
              <div className="import-grid">
                {[
                  ['📱', 'Instagram JSON', 'messages_1.json'],
                  ['💚', 'WhatsApp JSON', '_chat.json'],
                ].map(([icon, title, sub]) => (
                  <button key={title} className="import-btn"
                    onClick={() => { fileInputRef.current.accept = '.json'; fileInputRef.current.click(); }}>
                    <span className="import-btn-icon">{icon}</span>
                    <div>
                      <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{title}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>{sub}</div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="import-hint">{t.importHint}</div>
              <input ref={fileInputRef} type="file" style={{ display: 'none' }}
                onChange={e => { if (e.target.files[0]) handleFileImport(e.target.files[0]); e.target.value = ''; }} />
            </div>

            {messages.length > 0 ? (
              <div className="messages-list-card">
                <div className="messages-list-header">
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-muted)' }}>
                    {messages.length} {t.msgs}
                  </span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-muted)' }}>
                    {messages.filter(m => m.sender === 'them').length} {t.fromThem} · {messages.filter(m => m.sender === 'me').length} {t.fromYou}
                  </span>
                </div>
                <div className="messages-scroll">
                  {messages.slice(-100).map(msg => (
                    <div key={msg.id} className={`msg-row ${msg.sender}`}>
                      <span className={`msg-tag ${msg.sender}`}>
                        {msg.sender === 'me' ? t.me : t.them}
                      </span>
                      <div className={`msg-bubble ${msg.sender}`}>{msg.content}</div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                {messages.length > 100 && (
                  <div style={{ padding: '7px 14px', fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--mono)', textAlign: 'center', borderTop: '1px solid var(--border-soft)' }}>
                    {(t.showingLast || 'Showing last 100 of {n}').replace('{n}', messages.length)}
                  </div>
                )}
                <div className="messages-list-footer">
                  <div className="sender-toggle">
                    <button className={`sender-btn me ${manualSender === 'me' ? 'active' : ''}`} onClick={() => setManualSender('me')}>{t.me}</button>
                    <button className={`sender-btn them ${manualSender === 'them' ? 'active' : ''}`} onClick={() => setManualSender('them')}>{t.them}</button>
                  </div>
                  <input type="text" value={manualContent} onChange={e => setManualContent(e.target.value)}
                    placeholder={t.addMessage} style={{ flex: 1 }}
                    onKeyDown={e => e.key === 'Enter' && handleAddManual()} />
                  <button className="btn-primary" onClick={handleAddManual} style={{ padding: '7px 13px', fontSize: 12 }}>{t.add}</button>
                </div>
              </div>
            ) : (
              <div className="empty-state">{t.noMessages}</div>
            )}
          </div>
        )}

        {tab === 'journal' && (
          <JournalTab entries={journal} onAdd={handleAddJournal} onDelete={handleDeleteJournal} lang={lang} t={t} />
        )}

        {tab === 'analysis' && (
          <AnalysisView analysis={analysis} analyzing={analyzing} messageCount={messages.length} onAnalyze={handleAnalyze} lang={lang} t={t} />
        )}

        {tab === 'predict' && (
          <PredictView apiKey={apiKey} messages={messages} archiveContext={archive?.note || ''} lang={lang} t={t} onError={setError} />
        )}

        {tab === 'image' && (
          <ImageAnalysisView apiKey={apiKey} archiveContext={archive?.note || ''} lang={lang} t={t} onError={setError} />
        )}
      </div>
    </div>
  );
}
