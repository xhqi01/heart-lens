export type ParsedSender = 'me' | 'them';
export type ParsedSource = 'instagram' | 'whatsapp' | 'wechat' | 'imessage' | 'csv' | 'paste';

// Parsers return raw messages (timestamp may be unknown); parseImport() fills in
// order-preserving synthetic timestamps and attaches the source.
export interface RawMessage {
  sender: ParsedSender;
  senderName: string;
  content: string;
  timestamp: number | null;
}

export interface ParsedMessage {
  sender: ParsedSender;
  senderName: string;
  content: string;
  timestamp: number; // ms since epoch
  source: ParsedSource;
}

export interface ParseOptions {
  myUsername?: string;
}

export interface Parser {
  id: ParsedSource;
  detect(raw: string): boolean;
  parse(raw: string, opts: ParseOptions): RawMessage[];
}
