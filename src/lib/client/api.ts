import type {
  ArchiveSummary,
  ArchiveDetail,
  Message,
  JournalEntry,
  PublicConfig,
  AnyJson,
} from './types';

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || `Request failed (${res.status})`);
  }
  return data as T;
}

export const api = {
  getConfig: () => req<{ config: PublicConfig | null }>('/api/config'),
  saveConfig: (body: { provider: string; baseUrl: string; model: string; apiKey?: string }) =>
    req<{ ok: true; config: PublicConfig }>('/api/config', { method: 'PUT', body: JSON.stringify(body) }),

  listArchives: () => req<{ archives: ArchiveSummary[] }>('/api/archives'),
  createArchive: (body: {
    name: string;
    theirName?: string;
    context?: string;
    mbti?: string;
    attachment?: string;
    traits?: string;
  }) => req<{ id: string }>('/api/archives', { method: 'POST', body: JSON.stringify(body) }),
  getArchive: (id: string) => req<{ archive: ArchiveDetail }>(`/api/archives/${id}`),
  updateArchive: (id: string, body: { name?: string; theirName?: string; context?: string }) =>
    req<{ ok: true }>(`/api/archives/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteArchive: (id: string) => req<{ ok: true }>(`/api/archives/${id}`, { method: 'DELETE' }),

  addMessage: (id: string, body: { sender: 'me' | 'them'; content: string }) =>
    req<{ message: Message }>(`/api/archives/${id}/messages`, { method: 'POST', body: JSON.stringify(body) }),
  updateMessage: (id: string, messageId: string, body: { content?: string; sender?: 'me' | 'them' }) =>
    req<{ message: Message }>(`/api/archives/${id}/messages/${messageId}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  deleteMessage: (id: string, messageId: string) =>
    req<{ ok: true }>(`/api/archives/${id}/messages/${messageId}`, { method: 'DELETE' }),
  clearMessages: (id: string) =>
    req<{ deleted: number }>(`/api/archives/${id}/messages`, { method: 'DELETE' }),
  importFile: (id: string, body: { content: string; source?: string; myUsername?: string }) =>
    req<{ added: number }>(`/api/archives/${id}/import`, { method: 'POST', body: JSON.stringify(body) }),

  addJournal: (id: string, body: { text: string; tags?: string; type?: 'text' | 'voice' }) =>
    req<{ entry: JournalEntry }>(`/api/archives/${id}/journal`, { method: 'POST', body: JSON.stringify(body) }),
  deleteJournal: (id: string, entryId: string) =>
    req<{ ok: true }>(`/api/archives/${id}/journal/${entryId}`, { method: 'DELETE' }),

  analyze: (body: { archiveId: string; lang?: string }) =>
    req<{ analysis: AnyJson }>('/api/llm/analyze', { method: 'POST', body: JSON.stringify(body) }),
  predict: (body: { archiveId: string; draft: string; lang?: string }) =>
    req<{ prediction: AnyJson }>('/api/llm/predict', { method: 'POST', body: JSON.stringify(body) }),
  analyzeImage: (body: { archiveId?: string; imageBase64: string; mediaType: string; lang?: string }) =>
    req<{ analysis: AnyJson }>('/api/llm/image', { method: 'POST', body: JSON.stringify(body) }),
};
