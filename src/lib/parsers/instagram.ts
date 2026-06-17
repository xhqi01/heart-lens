import type { Parser, RawMessage } from './types';
import { isMeName } from './util';

// Instagram double-encodes UTF-8 as latin1; restore the real text.
function fixEncoding(s: string): string {
  try {
    return Buffer.from(s, 'latin1').toString('utf8');
  } catch {
    return s;
  }
}

export const instagram: Parser = {
  id: 'instagram',
  detect(raw) {
    try {
      const d = JSON.parse(raw);
      return d && d.participants !== undefined && Array.isArray(d.messages);
    } catch {
      return false;
    }
  },
  parse(raw, { myUsername }): RawMessage[] {
    const d = JSON.parse(raw);
    return (d.messages || [])
      .filter((m: any) => m?.content && m?.sender_name)
      .map((m: any) => {
        // sender_name is latin1-escaped just like message text (e.g. Japanese /
        // Chinese names), so decode it before matching the user-supplied name.
        const senderName = fixEncoding(String(m.sender_name));
        return {
          sender: isMeName(senderName, myUsername) ? 'me' : 'them',
          senderName,
          content: fixEncoding(String(m.content)),
          timestamp: m.timestamp_ms ?? (m.timestamp ? m.timestamp * 1000 : null),
        };
      });
  },
};
