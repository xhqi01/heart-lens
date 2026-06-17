import { describe, it, expect } from 'vitest';
import { parseImport, parseUploadedJSON, formatMessagesForAI, IMPORT_SOURCES } from './index';

describe('IMPORT_SOURCES', () => {
  it('lists every supported source with a label and hint', () => {
    const ids = IMPORT_SOURCES.map((s) => s.id);
    expect(ids).toEqual(
      expect.arrayContaining(['instagram', 'whatsapp', 'wechat', 'imessage', 'csv', 'paste']),
    );
    for (const s of IMPORT_SOURCES) {
      expect(s.label.length).toBeGreaterThan(0);
      expect(s.hint.length).toBeGreaterThan(0);
    }
  });
});

describe('instagram', () => {
  const raw = JSON.stringify({
    participants: [{ name: 'Me' }, { name: 'Alex' }],
    messages: [
      { sender_name: 'Me', content: 'hi', timestamp_ms: 1000 },
      { sender_name: 'Alex', content: 'yo', timestamp_ms: 2000 },
    ],
  });
  it('maps my username to "me" and parses content', () => {
    const out = parseImport(raw, { source: 'instagram', myUsername: 'Me' });
    expect(out).toHaveLength(2);
    expect(out[0]).toMatchObject({ sender: 'me', content: 'hi', source: 'instagram' });
    expect(out[1]).toMatchObject({ sender: 'them', content: 'yo' });
  });
  it('is auto-detected without an explicit source', () => {
    const out = parseUploadedJSON(raw, 'Me');
    expect(out).toHaveLength(2);
    expect(out[0].sender).toBe('me');
  });
});

describe('whatsapp', () => {
  const raw = JSON.stringify([
    { from: 'Me', body: 'hey', timestamp: 1700000000 },
    { from: 'Alex', body: 'sup', timestamp: 1700000001 },
  ]);
  it('maps sender by username and converts seconds to ms', () => {
    const out = parseImport(raw, { source: 'whatsapp', myUsername: 'Me' });
    expect(out).toHaveLength(2);
    expect(out[0]).toMatchObject({ sender: 'me', content: 'hey', source: 'whatsapp' });
    expect(out[0].timestamp).toBe(1700000000 * 1000);
  });
});

describe('wechat', () => {
  it('parses MemoTrace/PyWxDump-style CSV via IsSender + StrContent', () => {
    const csv = ['IsSender,CreateTime,StrContent,Type', '1,1700000000,你好,1', '0,1700000001,在吗,1'].join('\n');
    const out = parseImport(csv, { source: 'wechat' });
    expect(out).toHaveLength(2);
    expect(out[0]).toMatchObject({ sender: 'me', content: '你好', source: 'wechat' });
    expect(out[1]).toMatchObject({ sender: 'them', content: '在吗' });
    expect(out[0].timestamp).toBe(1700000000 * 1000);
  });
  it('parses a JSON export array', () => {
    const json = JSON.stringify([
      { is_sender: 1, content: 'hi', CreateTime: 1700000000 },
      { is_sender: 0, content: 'yo', CreateTime: 1700000001 },
    ]);
    const out = parseImport(json, { source: 'wechat' });
    expect(out.map((m) => m.sender)).toEqual(['me', 'them']);
    expect(out[0].content).toBe('hi');
  });
  it('parses a [ME]/[THEM] text export and preserves order', () => {
    const txt = '[ME] 在干嘛\n[THEM] 没干嘛\n[ME] 哦';
    const out = parseImport(txt, { source: 'wechat' });
    expect(out.map((m) => m.sender)).toEqual(['me', 'them', 'me']);
    expect(out[2].content).toBe('哦');
    expect(out[0].timestamp).toBeLessThan(out[1].timestamp); // synthetic, increasing
  });
});

describe('imessage', () => {
  it('parses "Name (date): text" lines and maps my name to me', () => {
    const txt = 'Me (2024-01-01 10:00:00): hi\nAlex (2024-01-01 10:01:00): yo';
    const out = parseImport(txt, { source: 'imessage', myUsername: 'Me' });
    expect(out).toHaveLength(2);
    expect(out[0]).toMatchObject({ sender: 'me', content: 'hi', source: 'imessage' });
    expect(out[1]).toMatchObject({ sender: 'them', content: 'yo' });
  });
});

describe('generic csv', () => {
  it('parses sender,timestamp,text with me/them values', () => {
    const csv = 'sender,timestamp,text\nme,2024-01-01,hi\nthem,2024-01-01,yo';
    const out = parseImport(csv, { source: 'csv' });
    expect(out.map((m) => m.sender)).toEqual(['me', 'them']);
    expect(out[0].content).toBe('hi');
    expect(out[0].source).toBe('csv');
  });
  it('maps a named sender to me via myUsername', () => {
    const csv = 'sender,text\nAlex,hi\nKevin,yo';
    const out = parseImport(csv, { source: 'csv', myUsername: 'Kevin' });
    expect(out.map((m) => m.sender)).toEqual(['them', 'me']);
  });
});

describe('paste', () => {
  it('parses Me:/Them: labelled lines and preserves order with synthetic timestamps', () => {
    const txt = 'Me: hi there\nThem: hello\nMe: how are you';
    const out = parseImport(txt, { source: 'paste' });
    expect(out.map((m) => m.sender)).toEqual(['me', 'them', 'me']);
    expect(out[0].content).toBe('hi there');
    expect(out[0].timestamp).toBeLessThan(out[2].timestamp);
    expect(out[0].source).toBe('paste');
  });
});

describe('parseImport errors', () => {
  it('throws on an unknown source', () => {
    // @ts-expect-error testing runtime guard
    expect(() => parseImport('x', { source: 'nope' })).toThrow();
  });
});

describe('formatMessagesForAI', () => {
  it('tags ME/THEM and keeps the last N', () => {
    const msgs = [
      { sender: 'me', content: 'a' },
      { sender: 'them', content: 'b' },
    ];
    expect(formatMessagesForAI(msgs, 10)).toBe('[ME] a\n[THEM] b');
  });
});
