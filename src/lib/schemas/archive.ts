import { z } from 'zod';

export const ATTACHMENT_STYLES = ['secure', 'anxious', 'avoidant', 'disorganized', 'unknown'] as const;

export const createArchiveSchema = z.object({
  name: z.string().min(1).max(120),
  theirName: z.string().max(120).optional(),
  context: z.string().max(4000).optional(),
  mbti: z.string().max(20).optional(),
  attachment: z.enum(ATTACHMENT_STYLES).optional(),
  traits: z.string().max(500).optional(),
});

export const updateArchiveSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  theirName: z.string().max(120).optional(),
  context: z.string().max(4000).optional(),
  mbti: z.string().max(20).optional(),
  attachment: z.enum(ATTACHMENT_STYLES).optional(),
  traits: z.string().max(500).optional(),
});

export const addMessageSchema = z.object({
  sender: z.enum(['me', 'them']),
  content: z.string().min(1).max(8000),
  timestamp: z.number().int().positive().optional(),
});

export const updateMessageSchema = z.object({
  content: z.string().min(1).max(8000).optional(),
  sender: z.enum(['me', 'them']).optional(),
});

export const journalSchema = z.object({
  text: z.string().min(1).max(8000),
  tags: z.string().max(500).optional(),
  type: z.enum(['text', 'voice']).optional(),
});

export const importSchema = z.object({
  content: z.string().min(2).max(20_000_000),
  source: z.enum(['instagram', 'whatsapp', 'wechat', 'imessage', 'csv', 'paste']).optional(),
  myUsername: z.string().max(200).optional(),
});

export const analyzeSchema = z.object({ archiveId: z.string().min(1) });

export const predictSchema = z.object({
  archiveId: z.string().min(1),
  draft: z.string().min(1).max(4000),
});

export const imageSchema = z.object({
  archiveId: z.string().min(1).optional(),
  imageBase64: z.string().min(10),
  mediaType: z.string().regex(/^image\//),
});

export type CreateArchiveInput = z.infer<typeof createArchiveSchema>;
export type UpdateArchiveInput = z.infer<typeof updateArchiveSchema>;
export type AddMessageInput = z.infer<typeof addMessageSchema>;
export type JournalInput = z.infer<typeof journalSchema>;
