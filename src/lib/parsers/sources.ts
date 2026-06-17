import type { ParsedSource } from './types';

// Client-safe import-source metadata (imports only a type, so it can be bundled
// into client components without pulling in the server-side parser code).
export interface ImportSourceMeta {
  id: ParsedSource;
  label: string;
  hint: string;
  fileBased: boolean;
  accept?: string;
}

export const IMPORT_SOURCES: ImportSourceMeta[] = [
  {
    id: 'instagram',
    label: 'Instagram',
    hint: 'Instagram → Settings → Your activity → Download your information (JSON). Upload message_1.json.',
    fileBased: true,
    accept: '.json,application/json',
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    hint: 'WhatsApp → open chat → ⋮ → More → Export chat, converted to a JSON array.',
    fileBased: true,
    accept: '.json,.txt',
  },
  {
    id: 'wechat',
    label: 'WeChat',
    hint: 'Export with MemoTrace (留痕) or PyWxDump as CSV / TXT / JSON, then upload the file.',
    fileBased: true,
    accept: '.csv,.txt,.json',
  },
  {
    id: 'imessage',
    label: 'iMessage',
    hint: 'Export a thread on macOS (e.g. imessage-exporter) as TXT, then upload it. Set "your name" to map senders.',
    fileBased: true,
    accept: '.txt,.csv',
  },
  {
    id: 'csv',
    label: 'CSV',
    hint: 'A CSV with columns like sender, timestamp, text. Sender can be "me"/"them" or names (set "your name").',
    fileBased: true,
    accept: '.csv,.txt',
  },
  {
    id: 'paste',
    label: 'Paste text',
    hint: 'Paste a conversation. Use lines like "Me: ..." / "Them: ...", or "Name: ...".',
    fileBased: false,
  },
];
