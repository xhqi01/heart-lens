'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getT, TIERS, type TierKey } from '@/lib/i18n';
import { api } from '@/lib/client/api';
import type { ArchiveSummary, ArchiveDetail, PublicConfig, AnyJson } from '@/lib/client/types';
import SettingsModal from './SettingsModal';
import NewArchiveModal from './NewArchiveModal';
import MessagesTab from './MessagesTab';
import JournalTab from './JournalTab';
import AnalysisTab from './AnalysisTab';
import PredictTab from './PredictTab';
import ImageTab from './ImageTab';

type Tab = 'messages' | 'journal' | 'analysis' | 'predict' | 'image';

export default function AppShell({ user }: { user: { email: string; isAdmin: boolean } }) {
  const router = useRouter();
  const [lang, setLangState] = useState('en');
  const t = getT(lang);

  const [archives, setArchives] = useState<ArchiveSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ArchiveDetail | null>(null);
  const [config, setConfig] = useState<PublicConfig | null>(null);
  const [tab, setTab] = useState<Tab>('messages');
  const [showSettings, setShowSettings] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const s = localStorage.getItem('hl_lang');
    if (s) setLangState(s);
  }, []);
  const setLang = (l: string) => {
    setLangState(l);
    localStorage.setItem('hl_lang', l);
  };

  const loadArchives = useCallback(async () => {
    try {
      const { archives } = await api.listArchives();
      setArchives(archives);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load archives');
    }
  }, []);

  const loadDetail = useCallback(async (id: string) => {
    try {
      const { archive } = await api.getArchive(id);
      setDetail(archive);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load archive');
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { config } = await api.getConfig();
        setConfig(config);
      } catch {
        /* ignore */
      }
      loadArchives();
    })();
  }, [loadArchives]);

  function selectArchive(id: string) {
    setSelectedId(id);
    setDetail(null);
    setTab('messages');
    setAnalyzeError('');
    setDrawerOpen(false);
    loadDetail(id);
  }

  async function createArchive(data: {
    name: string;
    context?: string;
    mbti?: string;
    attachment?: string;
    traits?: string;
  }) {
    const { id } = await api.createArchive(data);
    await loadArchives();
    setShowNew(false);
    selectArchive(id);
  }

  async function handleDelete() {
    if (!selectedId || !detail) return;
    if (!confirm(t.deleteConfirm.replace('{name}', detail.name))) return;
    await api.deleteArchive(selectedId);
    setSelectedId(null);
    setDetail(null);
    loadArchives();
  }

  async function addMessage(sender: 'me' | 'them', content: string) {
    if (!selectedId) return;
    await api.addMessage(selectedId, { sender, content });
    await loadDetail(selectedId);
    loadArchives();
  }

  async function editMessage(messageId: string, content: string) {
    if (!selectedId) return;
    await api.updateMessage(selectedId, messageId, { content });
    await loadDetail(selectedId);
  }

  async function removeMessage(messageId: string) {
    if (!selectedId) return;
    await api.deleteMessage(selectedId, messageId);
    await loadDetail(selectedId);
    loadArchives();
  }

  async function clearAllMessages() {
    if (!selectedId || !detail) return;
    if (!confirm(t.clearAllConfirm.replace('{n}', String(detail.messages.length)))) return;
    await api.clearMessages(selectedId);
    await loadDetail(selectedId);
    loadArchives();
  }

  async function importFile(content: string, opts: { source?: string; myUsername?: string }) {
    if (!selectedId) return;
    const { added } = await api.importFile(selectedId, { content, ...opts });
    await loadDetail(selectedId);
    loadArchives();
    if (added === 0) setError('No messages were found in that file.');
  }

  async function addJournal(data: { text: string; tags?: string; type?: 'text' | 'voice' }) {
    if (!selectedId) return;
    await api.addJournal(selectedId, data);
    await loadDetail(selectedId);
  }

  async function deleteJournal(entryId: string) {
    if (!selectedId) return;
    await api.deleteJournal(selectedId, entryId);
    await loadDetail(selectedId);
  }

  async function runAnalyze() {
    if (!selectedId) return;
    setTab('analysis');
    setAnalyzing(true);
    setAnalyzeError('');
    try {
      const { analysis } = await api.analyze({ archiveId: selectedId, lang });
      setDetail((d) => (d ? { ...d, analysis } : d));
      loadArchives();
    } catch (e) {
      setAnalyzeError(e instanceof Error ? e.message : 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  }

  async function runPredict(draft: string): Promise<AnyJson> {
    if (!selectedId) throw new Error('No archive selected');
    const { prediction } = await api.predict({ archiveId: selectedId, draft, lang });
    return prediction;
  }

  async function runImage(base64: string, mediaType: string): Promise<AnyJson> {
    const { analysis } = await api.analyzeImage({
      archiveId: selectedId ?? undefined,
      imageBase64: base64,
      mediaType,
      lang,
    });
    return analysis;
  }

  async function signOut() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace('/login');
    router.refresh();
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'messages', label: t.tabMessages },
    { key: 'journal', label: t.tabJournal },
    { key: 'analysis', label: t.tabAnalysis },
    { key: 'predict', label: t.tabPredict },
    { key: 'image', label: t.tabImage },
  ];

  return (
    <div className="app">
      {/* Mobile top bar */}
      <div className="mobile-topbar">
        <button className="icon-btn" onClick={() => setDrawerOpen(true)} aria-label="Menu">
          ☰
        </button>
        <span className="sidebar-logo-text">
          Heart<span>Lens</span>
        </span>
        <button className="icon-btn" onClick={() => setShowSettings(true)} aria-label="Settings">
          ⚙
        </button>
      </div>

      {drawerOpen && <div className="drawer-backdrop" onClick={() => setDrawerOpen(false)} />}

      <aside className={`sidebar${drawerOpen ? ' open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">◐</div>
            <div className="sidebar-logo-text">
              Heart<span>Lens</span>
            </div>
          </div>
          <button className="btn-new-archive" onClick={() => setShowNew(true)}>
            {t.newArchive}
          </button>
        </div>

        <div className="sidebar-list">
          {archives.map((a) => {
            const tier = a.tier ? TIERS[a.tier as TierKey] : null;
            return (
              <div
                key={a.id}
                className={`archive-item${a.id === selectedId ? ' active' : ''}`}
                onClick={() => selectArchive(a.id)}
              >
                <div className="archive-item-row">
                  <span className="archive-item-name">{a.name}</span>
                  {tier && <span>{tier.dot}</span>}
                </div>
                <div className="archive-item-meta">
                  {a.messageCount} {t.msgs} · {new Date(a.updatedAt).toLocaleDateString()}
                </div>
              </div>
            );
          })}
        </div>

        <div className="sidebar-footer">
          <div className="api-status">
            <span className={`api-dot${config ? ' on' : ''}`} />
            {config ? `${t.apiConnected} · ${config.model}` : t.noApiKey}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn-settings" onClick={() => setShowSettings(true)}>
              {t.settings}
            </button>
            <button className="btn-settings" onClick={signOut} title={user.email}>
              {t.signOut}
            </button>
          </div>
        </div>
      </aside>

      <main className="app-main">
        {!detail ? (
          <Welcome
            t={t}
            hasConfig={!!config}
            hasArchives={archives.length > 0}
            onSettings={() => setShowSettings(true)}
            onNew={() => setShowNew(true)}
          />
        ) : (
          <div className="archive-view">
            <div className="archive-topbar">
              <div>
                <div className="archive-title">{detail.name}</div>
                <div className="archive-subtitle">
                  {detail.messages.length} {t.msgs}
                  {detail.theirName ? ` · ${detail.theirName}` : ''}
                </div>
              </div>
              <div className="topbar-actions">
                <a className="btn-delete" href={`/api/archives/${detail.id}/export`} title={t.exportArchive}>
                  ⬇
                </a>
                <button
                  className="btn-analyze"
                  onClick={runAnalyze}
                  disabled={analyzing || detail.messages.length < 5}
                  title={detail.messages.length < 5 ? t.addMoreMessages : ''}
                >
                  {analyzing ? t.analyzing : t.analyze}
                </button>
                <button className="btn-delete" onClick={handleDelete}>
                  ✕
                </button>
              </div>
            </div>

            <div className="archive-tabs">
              {tabs.map((tb) => (
                <button
                  key={tb.key}
                  className={`tab${tab === tb.key ? ' active' : ''}`}
                  onClick={() => setTab(tb.key)}
                >
                  {tb.label}
                </button>
              ))}
            </div>

            <div className="archive-content">
              {error && <div className="error-banner" style={{ margin: '0 0 14px' }}>{error}</div>}
              {tab === 'messages' && (
                <MessagesTab
                  detail={detail}
                  lang={lang}
                  onAddMessage={addMessage}
                  onImport={importFile}
                  onEditMessage={editMessage}
                  onDeleteMessage={removeMessage}
                  onClearMessages={clearAllMessages}
                />
              )}
              {tab === 'journal' && (
                <JournalTab detail={detail} lang={lang} onAdd={addJournal} onDelete={deleteJournal} />
              )}
              {tab === 'analysis' && (
                <AnalysisTab
                  analysis={detail.analysis}
                  lang={lang}
                  loading={analyzing}
                  error={analyzeError}
                  archiveName={detail.name}
                  theirName={detail.theirName}
                  messageCount={detail.messages.length}
                />
              )}
              {tab === 'predict' && <PredictTab lang={lang} onPredict={runPredict} />}
              {tab === 'image' && <ImageTab lang={lang} onAnalyze={runImage} />}
            </div>

            {/* Mobile bottom nav */}
            <nav className="bottom-nav">
              {tabs.map((tb) => (
                <button
                  key={tb.key}
                  className={`bottom-nav-btn${tab === tb.key ? ' active' : ''}`}
                  onClick={() => setTab(tb.key)}
                >
                  {tb.label.split(' ')[0]}
                </button>
              ))}
            </nav>
          </div>
        )}
      </main>

      {showSettings && (
        <SettingsModal
          lang={lang}
          setLang={setLang}
          config={config}
          onSaved={setConfig}
          onClose={() => setShowSettings(false)}
        />
      )}
      {showNew && <NewArchiveModal lang={lang} onCreate={createArchive} onClose={() => setShowNew(false)} />}
    </div>
  );
}

function Welcome({
  t,
  hasConfig,
  hasArchives,
  onSettings,
  onNew,
}: {
  t: Record<string, string>;
  hasConfig: boolean;
  hasArchives: boolean;
  onSettings: () => void;
  onNew: () => void;
}) {
  return (
    <div className="welcome">
      <div className="welcome-eyebrow">Private · Self-hosted</div>
      <h1 className="welcome-title">
        Read between <em>the lines.</em>
      </h1>
      <p className="welcome-sub">
        Analyze conversation patterns, predict how a message will land, and keep private notes — all on your own
        server.
      </p>
      <div className="welcome-steps">
        <div className="welcome-step">
          <span className="step-num">1</span>
          <span className="step-text">
            <strong>Connect a provider.</strong> Add your Anthropic or OpenAI-compatible key in Settings (encrypted
            server-side).
          </span>
        </div>
        <div className="welcome-step">
          <span className="step-num">2</span>
          <span className="step-text">
            <strong>Create an archive</strong> for a person, then import or add messages.
          </span>
        </div>
        <div className="welcome-step">
          <span className="step-num">3</span>
          <span className="step-text">
            <strong>Analyze & predict.</strong> Get engagement insights and message predictions.
          </span>
        </div>
      </div>
      <div className="welcome-cta">
        {!hasConfig && (
          <button className="btn-primary" onClick={onSettings}>
            {t.settings}
          </button>
        )}
        <button className={hasConfig ? 'btn-primary' : 'btn-secondary'} onClick={onNew}>
          {t.newArchive}
        </button>
      </div>
    </div>
  );
}
