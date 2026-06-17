import type { RawMessage, ParsedSender } from './types';

// Minimal CSV parser that handles quoted fields and escaped quotes.
export function parseDelimited(raw: string): { headers: string[]; rows: string[][] } {
  const lines = raw.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return { headers: [], rows: [] };
  const parseLine = (line: string): string[] => {
    const out: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (inQuotes) {
        if (c === '"') {
          if (line[i + 1] === '"') {
            cur += '"';
            i++;
          } else inQuotes = false;
        } else cur += c;
      } else if (c === '"') inQuotes = true;
      else if (c === ',') {
        out.push(cur);
        cur = '';
      } else cur += c;
    }
    out.push(cur);
    return out.map((s) => s.trim());
  };
  return { headers: parseLine(lines[0]), rows: lines.slice(1).map(parseLine) };
}

export function findCol(headers: string[], aliases: string[]): number {
  const lower = headers.map((h) => h.toLowerCase());
  for (const a of aliases) {
    const i = lower.indexOf(a.toLowerCase());
    if (i >= 0) return i;
  }
  return -1;
}

// Best-effort timestamp → ms since epoch, or null if unparseable.
export function parseTimestamp(v: unknown): number | null {
  if (v == null || v === '') return null;
  if (typeof v === 'number') return v < 1e12 ? Math.round(v * 1000) : Math.round(v);
  const s = String(v).trim();
  if (/^\d+$/.test(s)) {
    const n = Number(s);
    return n < 1e12 ? n * 1000 : n; // seconds vs milliseconds
  }
  const t = Date.parse(s);
  return Number.isNaN(t) ? null : t;
}

// Fill missing timestamps with an increasing sequence so message order survives a
// sort-by-timestamp, even when an export has no usable times.
export function finalizeTimestamps(items: RawMessage[]): void {
  let last = 0;
  for (const item of items) {
    if (item.timestamp == null) {
      last += 1000;
      item.timestamp = last;
    } else {
      last = Math.max(last, item.timestamp);
    }
  }
}

// True when a sender name represents the account owner ("me").
export function isMeName(name: string, myUsername?: string): boolean {
  const n = name.trim().toLowerCase();
  if (myUsername && myUsername.trim()) {
    const mu = myUsername.trim().toLowerCase();
    return n === mu || n.includes(mu) || mu.includes(n);
  }
  return ['me', '我', 'self', 'myself'].includes(n);
}

// True when an "is sender" flag column marks the message as sent by me.
export function isMeFlag(v: unknown): boolean {
  const s = String(v).trim().toLowerCase();
  return s === '1' || s === 'true' || s === 'yes' || s === '是';
}

// Shared line parser for "[ME]/[THEM] text" and "Name: text" formats.
export function parseTextLines(raw: string, myUsername?: string): RawMessage[] {
  const lines = raw.split(/\r?\n/).map((l) => l.trim());
  const out: RawMessage[] = [];
  for (const line of lines) {
    if (!line) continue;
    let m = line.match(/^\[(ME|THEM)\]\s*(.*)$/i);
    if (m) {
      out.push({
        sender: (m[1].toUpperCase() === 'ME' ? 'me' : 'them') as ParsedSender,
        senderName: '',
        content: m[2],
        timestamp: null,
      });
      continue;
    }
    m = line.match(/^([^:：]{1,40})[:：]\s*(.*)$/);
    if (m && m[2]) {
      const name = m[1].trim();
      out.push({
        sender: (isMeName(name, myUsername) ? 'me' : 'them') as ParsedSender,
        senderName: name,
        content: m[2],
        timestamp: null,
      });
      continue;
    }
    if (out.length > 0) out[out.length - 1].content += '\n' + line;
  }
  return out;
}
