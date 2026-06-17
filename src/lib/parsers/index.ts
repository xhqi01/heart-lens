import type { Parser, ParsedMessage, ParseOptions, ParsedSource } from './types';
import { finalizeTimestamps } from './util';
import { instagram } from './instagram';
import { whatsapp } from './whatsapp';
import { wechat } from './wechat';
import { imessage } from './imessage';
import { csv } from './csv';
import { paste } from './paste';

export type { ParsedMessage, ParsedSource, ParsedSender, RawMessage } from './types';

const REGISTRY: Parser[] = [instagram, whatsapp, wechat, imessage, csv, paste];
const BY_ID = new Map<ParsedSource, Parser>(REGISTRY.map((p) => [p.id, p]));

// Lightweight metadata for the import UI (client-safe; defined in ./sources).
export { IMPORT_SOURCES, type ImportSourceMeta } from './sources';

export function parseImport(
  raw: string,
  opts: { source?: ParsedSource } & ParseOptions = {},
): ParsedMessage[] {
  const { source, myUsername } = opts;
  let parser: Parser | undefined;
  if (source) {
    parser = BY_ID.get(source);
    if (!parser) throw new Error(`Unknown import source: ${source}`);
  } else {
    // Auto-detect (paste is explicit-only, so it is excluded here).
    parser = REGISTRY.find((p) => p.id !== 'paste' && p.detect(raw));
    if (!parser) throw new Error('Could not detect the chat format. Pick a source and try again.');
  }
  const messages = parser.parse(raw, { myUsername });
  finalizeTimestamps(messages);
  return messages.map((m) => ({
    sender: m.sender,
    senderName: m.senderName,
    content: m.content,
    timestamp: m.timestamp as number,
    source: parser!.id,
  }));
}

// Back-compat: auto-detecting entry point used by the import route.
export function parseUploadedJSON(raw: string | object, myUsername?: string): ParsedMessage[] {
  const text = typeof raw === 'string' ? raw : JSON.stringify(raw);
  return parseImport(text, { myUsername });
}

export function formatMessagesForAI(
  messages: { sender: string; content: string }[],
  limit = 200,
): string {
  return messages
    .slice(-limit)
    .map((m) => `[${m.sender === 'me' ? 'ME' : 'THEM'}] ${m.content}`)
    .join('\n');
}
