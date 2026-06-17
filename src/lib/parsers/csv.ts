import type { Parser, RawMessage } from './types';
import { parseDelimited, findCol, parseTimestamp, isMeName } from './util';

export const csv: Parser = {
  id: 'csv',
  detect(raw) {
    const head = (raw.split(/\r?\n/)[0] || '').toLowerCase();
    return head.includes(',') && /sender|from|text|message|content|time|date/.test(head);
  },
  parse(raw, { myUsername }): RawMessage[] {
    const { headers, rows } = parseDelimited(raw);
    const c = {
      sender: findCol(headers, ['sender', 'from', 'author', 'name', '发送方']),
      content: findCol(headers, ['text', 'message', 'content', 'msg', '内容']),
      time: findCol(headers, ['timestamp', 'time', 'date', 'created', '时间']),
    };
    if (c.content < 0 && headers.length >= 2) c.content = headers.length - 1;
    return rows
      .filter((r) => c.content >= 0 && r[c.content])
      .map((r) => {
        const senderVal = c.sender >= 0 ? String(r[c.sender]) : '';
        return {
          sender: (isMeName(senderVal, myUsername) ? 'me' : 'them') as RawMessage['sender'],
          senderName: senderVal,
          content: String(r[c.content]),
          timestamp: c.time >= 0 ? parseTimestamp(r[c.time]) : null,
        };
      });
  },
};
