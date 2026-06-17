// Chat-export parsers (Instagram / WhatsApp JSON) + AI transcript formatting.
// Ported from the original heart-lens/src/utils/parsers.js. Server-side: IDs are
// assigned by Prisma on insert, so parsers return message *data* without id/archiveId.

export type ParsedSender = 'me' | 'them';
export type ParsedSource = 'instagram' | 'whatsapp';

export interface ParsedMessage {
  sender: ParsedSender;
  senderName: string;
  content: string;
  timestamp: number; // ms since epoch
  source: ParsedSource;
}

// Instagram exports double-encode UTF-8 as latin1. This restores the real text.
function fixInstagramEncoding(s: string): string {
  try {
    return Buffer.from(s, 'latin1').toString('utf8');
  } catch {
    return s;
  }
}

export function parseInstagramJSON(raw: string | object, myUsername?: string): ParsedMessage[] {
  let data: any;
  try {
    data = typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch (e: any) {
    throw new Error('Invalid Instagram JSON format: ' + e.message);
  }
  const messages: any[] = data?.messages || [];
  return messages
    .filter((m) => m?.content && m?.sender_name)
    .map((m) => ({
      sender: (m.sender_name === myUsername ? 'me' : 'them') as ParsedSender,
      senderName: String(m.sender_name),
      content: fixInstagramEncoding(String(m.content)),
      timestamp: m.timestamp_ms ?? (m.timestamp ? m.timestamp * 1000 : Date.now()),
      source: 'instagram' as const,
    }));
}

export function parseWhatsAppJSON(raw: string | object, myUsername?: string): ParsedMessage[] {
  let data: any;
  try {
    data = typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch (e: any) {
    throw new Error('Invalid WhatsApp JSON format: ' + e.message);
  }
  const messages: any[] = Array.isArray(data) ? data : data?.messages || [];
  return messages
    .filter((m) => m?.body || m?.message || m?.content)
    .map((m) => {
      const sender: string = m.from || m.author || m.sender || '';
      const isMe = myUsername ? sender.includes(myUsername) : m.fromMe === true;
      let timestamp = Date.now();
      if (m.timestamp != null) {
        timestamp =
          typeof m.timestamp === 'number' ? m.timestamp * 1000 : new Date(m.timestamp).getTime();
      }
      return {
        sender: (isMe ? 'me' : 'them') as ParsedSender,
        senderName: sender,
        content: String(m.body || m.message || m.content || ''),
        timestamp,
        source: 'whatsapp' as const,
      };
    });
}

// Auto-detect Instagram vs WhatsApp from structure.
export function parseUploadedJSON(raw: string | object, myUsername?: string): ParsedMessage[] {
  let data: any;
  try {
    data = typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch (e: any) {
    throw new Error('Could not parse file: ' + e.message);
  }
  if (data?.participants !== undefined && Array.isArray(data?.messages)) {
    return parseInstagramJSON(data, myUsername);
  }
  return parseWhatsAppJSON(data, myUsername);
}

// Format a transcript for the model, keeping only the last `limit` messages.
export function formatMessagesForAI(
  messages: { sender: string; content: string }[],
  limit = 200,
): string {
  return messages
    .slice(-limit)
    .map((m) => `[${m.sender === 'me' ? 'ME' : 'THEM'}] ${m.content}`)
    .join('\n');
}
