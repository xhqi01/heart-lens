import type { Parser, RawMessage } from './types';
import { isMeName, parseTimestamp } from './util';

const LINE = /^(.+?)\s*\((\d{4}-\d\d-\d\d[ T][\d:apmAPM\s]+)\)\s*:\s*(.*)$/;

export const imessage: Parser = {
  id: 'imessage',
  detect(raw) {
    const head = raw.split(/\r?\n/).find((l) => l.trim());
    return !!head && LINE.test(head);
  },
  parse(raw, { myUsername }): RawMessage[] {
    const out: RawMessage[] = [];
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(LINE);
      if (m) {
        const name = m[1].trim();
        out.push({
          sender: isMeName(name, myUsername) ? 'me' : 'them',
          senderName: name,
          content: m[3],
          timestamp: parseTimestamp(m[2]),
        });
      } else if (out.length && line.trim()) {
        out[out.length - 1].content += '\n' + line.trim();
      }
    }
    return out;
  },
};
