export interface ArchiveSummary {
  id: string;
  name: string;
  theirName: string | null;
  context: string | null;
  updatedAt: number;
  messageCount: number;
  tier: string | null;
}

export interface Message {
  id: string;
  sender: string;
  senderName: string | null;
  content: string;
  timestamp: number;
  source: string;
}

export interface JournalEntry {
  id: string;
  text: string;
  tags: string | null;
  type: string;
  createdAt: number;
}

// The analysis/prediction/image objects are model-shaped; kept loose on the client.
export type AnyJson = Record<string, unknown>;

export interface ArchiveDetail {
  id: string;
  name: string;
  theirName: string | null;
  context: string | null;
  mbti: string | null;
  attachment: string | null;
  traits: string | null;
  updatedAt: number;
  messages: Message[];
  journal: JournalEntry[];
  analysis: AnyJson | null;
}

export interface PublicConfig {
  provider: string;
  baseUrl: string;
  model: string;
  maskedKey: string | null;
}
