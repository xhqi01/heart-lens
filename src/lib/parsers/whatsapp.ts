import type { Parser, RawMessage } from './types';

export const whatsapp: Parser = {
  id: 'whatsapp',
  detect(raw) {
    try {
      const d = JSON.parse(raw);
      const arr = Array.isArray(d) ? d : d?.messages;
      return (
        Array.isArray(arr) &&
        arr.length > 0 &&
        (arr[0].body !== undefined || arr[0].fromMe !== undefined || arr[0].author !== undefined)
      );
    } catch {
      return false;
    }
  },
  parse(raw, { myUsername }): RawMessage[] {
    const d = JSON.parse(raw);
    const arr = Array.isArray(d) ? d : d.messages || [];
    return arr
      .filter((m: any) => m?.body || m?.message || m?.content)
      .map((m: any) => {
        const sender = m.from || m.author || m.sender || '';
        const isMe = myUsername ? String(sender).includes(myUsername) : m.fromMe === true;
        let timestamp: number | null = null;
        if (m.timestamp != null) {
          timestamp =
            typeof m.timestamp === 'number' ? m.timestamp * 1000 : Date.parse(String(m.timestamp)) || null;
        }
        return {
          sender: isMe ? 'me' : 'them',
          senderName: String(sender),
          content: String(m.body || m.message || m.content || ''),
          timestamp,
        };
      });
  },
};
