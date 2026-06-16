import React, { useState, useEffect, useCallback } from 'react';
import { getArchives, getSetting, setSetting } from './utils/db';
import { getT } from './utils/i18n';
import Sidebar from './components/Sidebar';
import ArchiveView from './components/ArchiveView';
import Welcome from './components/Welcome';
import SettingsModal from './components/SettingsModal';
import './App.css';

export default function App() {
  const [archives, setArchives] = useState([]);
  const [activeArchiveId, setActiveArchiveId] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [lang, setLang] = useState('en');
  const [showSettings, setShowSettings] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function init() {
      const [arcs, key, savedLang] = await Promise.all([
        getArchives(),
        getSetting('apiKey'),
        getSetting('lang'),
      ]);
      setArchives(arcs.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)));
      if (key) setApiKey(key);
      if (savedLang) setLang(savedLang);
      setLoaded(true);
    }
    init();
  }, []);

  const refreshArchives = useCallback(async () => {
    const arcs = await getArchives();
    setArchives(arcs.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)));
  }, []);

  const handleSaveSettings = async (key, newLang) => {
    await setSetting('apiKey', key);
    await setSetting('lang', newLang);
    setApiKey(key);
    setLang(newLang);
  };

  const t = getT(lang);

  if (!loaded) {
    return (
      <div className="app-loading">
        <div className="loading-pulse">●</div>
      </div>
    );
  }

  return (
    <div className="app" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <Sidebar
        archives={archives}
        activeId={activeArchiveId}
        onSelect={setActiveArchiveId}
        onRefresh={refreshArchives}
        onSettings={() => setShowSettings(true)}
        apiKey={apiKey}
        t={t}
      />
      <main className="app-main">
        {activeArchiveId ? (
          <ArchiveView
            key={activeArchiveId}
            archiveId={activeArchiveId}
            apiKey={apiKey}
            lang={lang}
            onLangChange={async (l) => { setLang(l); await setSetting('lang', l); }}
            t={t}
            onRefresh={refreshArchives}
            onDelete={() => { setActiveArchiveId(null); refreshArchives(); }}
          />
        ) : (
          <Welcome
            apiKey={apiKey}
            t={t}
            onOpenSettings={() => setShowSettings(true)}
          />
        )}
      </main>
      {showSettings && (
        <SettingsModal
          apiKey={apiKey}
          lang={lang}
          onSave={handleSaveSettings}
          onClose={() => setShowSettings(false)}
          t={t}
        />
      )}
    </div>
  );
}
