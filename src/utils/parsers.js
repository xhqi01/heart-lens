import { v4 as uuid } from 'uuid';

// Parse Instagram exported JSON (messages_1.json format)
export function parseInstagramJSON(raw, archiveId, myUsername) {
  try {
    const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
    const messages = data.messages || [];
    return messages
      .filter(m => m.content && m.sender_name)
      .map(m => ({
        id: uuid(),
        archiveId,
        sender: m.sender_name === myUsername ? 'me' : 'them',
        senderName: m.sender_name,
        content: decodeURIComponent(escape(m.content)), // fix Instagram's UTF-8 encoding
        timestamp: m.timestamp_ms || m.timestamp * 1000,
        source: 'instagram',
      }));
  } catch (e) {
    throw new Error('Invalid Instagram JSON format: ' + e.message);
  }
}

// Parse WhatsApp exported JSON (_chat.json or similar)
export function parseWhatsAppJSON(raw, archiveId, myUsername) {
  try {
    const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
    const messages = Array.isArray(data) ? data : data.messages || [];
    return messages
      .filter(m => m.body || m.message || m.content)
      .map(m => {
        const sender = m.from || m.author || m.sender || '';
        const isMe = myUsername
          ? sender.includes(myUsername)
          : m.fromMe === true;
        return {
          id: uuid(),
          archiveId,
          sender: isMe ? 'me' : 'them',
          senderName: sender,
          content: m.body || m.message || m.content || '',
          timestamp: m.timestamp
            ? (typeof m.timestamp === 'number' ? m.timestamp * 1000 : new Date(m.timestamp).getTime())
            : Date.now(),
          source: 'whatsapp',
        };
      });
  } catch (e) {
    throw new Error('Invalid WhatsApp JSON format: ' + e.message);
  }
}

// Auto-detect format
export function parseUploadedJSON(raw, archiveId, myUsername) {
  try {
    const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
    // Instagram has "participants" and "messages" array with "sender_name"
    if (data.participants !== undefined && Array.isArray(data.messages)) {
      return parseInstagramJSON(data, archiveId, myUsername);
    }
    // WhatsApp typically is an array or has fromMe fields
    return parseWhatsAppJSON(data, archiveId, myUsername);
  } catch (e) {
    throw new Error('Could not parse file: ' + e.message);
  }
}

// Format message list for AI analysis (truncate to last N for context window)
export function formatMessagesForAI(messages, limit = 200) {
  const recent = messages.slice(-limit);
  return recent
    .map(m => `[${m.sender === 'me' ? 'ME' : 'THEM'}] ${m.content}`)
    .join('\n');
}
