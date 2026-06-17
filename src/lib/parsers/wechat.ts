import type { Parser, RawMessage } from './types';
import { parseDelimited, findCol, parseTimestamp, isMeFlag, isMeName, parseTextLines } from './util';

function parseJson(raw: string): RawMessage[] {
  const d = JSON.parse(raw);
  const arr: any[] = Array.isArray(d) ? d : d.messages || [];
  return arr
    .filter((m) => (m?.StrContent ?? m?.content ?? m?.msg) != null && String(m?.Type ?? m?.type ?? 1) === '1')
    .map((m) => ({
      sender: (isMeFlag(m.IsSender ?? m.is_sender) ? 'me' : 'them') as RawMessage['sender'],
      senderName: String(m.NickName ?? m.talker ?? ''),
      content: String(m.StrContent ?? m.content ?? m.msg ?? ''),
      timestamp: parseTimestamp(m.CreateTime ?? m.createTime ?? m.timestamp),
    }));
}

function parseCsv(raw: string, myUsername?: string): RawMessage[] {
  const { headers, rows } = parseDelimited(raw);
  const c = {
    isSender: findCol(headers, ['IsSender', 'is_sender', '是否发送', 'isSend']),
    content: findCol(headers, ['StrContent', 'content', '内容', '消息', 'msg', 'message']),
    time: findCol(headers, ['CreateTime', 'createTime', '时间', 'timestamp', 'StrTime', 'time']),
    type: findCol(headers, ['Type', 'type', '类型']),
    sender: findCol(headers, ['Sender', '发送方', 'talker', 'NickName', '昵称', 'from']),
  };
  return rows
    .filter((r) => c.content >= 0 && r[c.content] && (c.type < 0 || r[c.type] === '' || String(r[c.type]) === '1'))
    .map((r) => {
      const isMe = c.isSender >= 0 ? isMeFlag(r[c.isSender]) : c.sender >= 0 ? isMeName(r[c.sender], myUsername) : false;
      return {
        sender: (isMe ? 'me' : 'them') as RawMessage['sender'],
        senderName: c.sender >= 0 ? String(r[c.sender]) : '',
        content: String(r[c.content]),
        timestamp: c.time >= 0 ? parseTimestamp(r[c.time]) : null,
      };
    });
}

export const wechat: Parser = {
  id: 'wechat',
  detect(raw) {
    const t = raw.trimStart();
    if (t.startsWith('[') || t.startsWith('{')) {
      try {
        const d = JSON.parse(raw);
        const arr = Array.isArray(d) ? d : d.messages;
        return (
          Array.isArray(arr) &&
          arr.some((m: any) => m && (m.StrContent !== undefined || m.is_sender !== undefined || m.IsSender !== undefined))
        );
      } catch {
        return false;
      }
    }
    const head = (raw.split(/\r?\n/)[0] || '').toLowerCase();
    return /strcontent|issender|内容|发送方/.test(head);
  },
  parse(raw, { myUsername }): RawMessage[] {
    const t = raw.trimStart();
    if (t.startsWith('[') || t.startsWith('{')) {
      try {
        return parseJson(raw);
      } catch {
        /* not JSON (e.g. "[ME] ...") — fall through to CSV/TXT */
      }
    }
    const firstLine = raw.split(/\r?\n/)[0] || '';
    if (firstLine.includes(',') && /strcontent|issender|内容|发送方|createtime|时间/i.test(firstLine)) {
      return parseCsv(raw, myUsername);
    }
    return parseTextLines(raw, myUsername);
  },
};
