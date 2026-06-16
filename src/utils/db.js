// IndexedDB wrapper — all data stays local, zero uploads
const DB_NAME = 'heartlens';
const DB_VERSION = 2;

const STORES = {
  ARCHIVES: 'archives',
  MESSAGES: 'messages',
  ANALYSES: 'analyses',
  SETTINGS: 'settings',
};

let db = null;

export function openDB() {
  return new Promise((resolve, reject) => {
    if (db) return resolve(db);
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const d = e.target.result;
      if (!d.objectStoreNames.contains(STORES.ARCHIVES)) {
        const s = d.createObjectStore(STORES.ARCHIVES, { keyPath: 'id' });
        s.createIndex('updatedAt', 'updatedAt');
      }
      if (!d.objectStoreNames.contains(STORES.MESSAGES)) {
        const s = d.createObjectStore(STORES.MESSAGES, { keyPath: 'id' });
        s.createIndex('archiveId', 'archiveId');
        s.createIndex('timestamp', 'timestamp');
      }
      if (!d.objectStoreNames.contains(STORES.ANALYSES)) {
        const s = d.createObjectStore(STORES.ANALYSES, { keyPath: 'id' });
        s.createIndex('archiveId', 'archiveId');
      }
      if (!d.objectStoreNames.contains(STORES.SETTINGS)) {
        d.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
      }
    };
    req.onsuccess = (e) => { db = e.target.result; resolve(db); };
    req.onerror = () => reject(req.error);
  });
}

async function tx(storeName, mode, fn) {
  const d = await openDB();
  return new Promise((resolve, reject) => {
    const t = d.transaction(storeName, mode);
    const s = t.objectStore(storeName);
    const req = fn(s);
    if (req && req.onsuccess !== undefined) {
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    } else {
      t.oncomplete = () => resolve(req ? req.result : undefined);
      t.onerror = () => reject(t.error);
    }
  });
}

// Archives
export const getArchives = () => tx(STORES.ARCHIVES, 'readonly', s => s.getAll());
export const getArchive = (id) => tx(STORES.ARCHIVES, 'readonly', s => s.get(id));
export const saveArchive = (archive) => tx(STORES.ARCHIVES, 'readwrite', s => s.put(archive));
export const deleteArchive = (id) => tx(STORES.ARCHIVES, 'readwrite', s => s.delete(id));

// Messages
export const getMessages = async (archiveId) => {
  const d = await openDB();
  return new Promise((resolve, reject) => {
    const t = d.transaction(STORES.MESSAGES, 'readonly');
    const s = t.objectStore(STORES.MESSAGES);
    const idx = s.index('archiveId');
    const req = idx.getAll(archiveId);
    req.onsuccess = () => resolve(req.result.sort((a, b) => a.timestamp - b.timestamp));
    req.onerror = () => reject(req.error);
  });
};
export const saveMessage = (msg) => tx(STORES.MESSAGES, 'readwrite', s => s.put(msg));
export const deleteMessagesByArchive = async (archiveId) => {
  const msgs = await getMessages(archiveId);
  const d = await openDB();
  return new Promise((resolve, reject) => {
    const t = d.transaction(STORES.MESSAGES, 'readwrite');
    const s = t.objectStore(STORES.MESSAGES);
    msgs.forEach(m => s.delete(m.id));
    t.oncomplete = () => resolve();
    t.onerror = () => reject(t.error);
  });
};

// Analyses
export const getAnalyses = async (archiveId) => {
  const d = await openDB();
  return new Promise((resolve, reject) => {
    const t = d.transaction(STORES.ANALYSES, 'readonly');
    const s = t.objectStore(STORES.ANALYSES);
    const idx = s.index('archiveId');
    const req = idx.getAll(archiveId);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
};
export const saveAnalysis = (a) => tx(STORES.ANALYSES, 'readwrite', s => s.put(a));

// Settings
export const getSetting = async (key) => {
  const r = await tx(STORES.SETTINGS, 'readonly', s => s.get(key));
  return r ? r.value : null;
};
export const setSetting = (key, value) =>
  tx(STORES.SETTINGS, 'readwrite', s => s.put({ key, value }));
