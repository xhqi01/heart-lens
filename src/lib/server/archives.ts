import { prisma } from './db';
import { NotFoundError } from './errors';
import type { ParsedMessage } from '@/lib/parsers';
import type {
  CreateArchiveInput,
  UpdateArchiveInput,
  AddMessageInput,
  JournalInput,
} from '@/lib/schemas/archive';

// All functions take `userId` and enforce ownership, so a user can never reach
// another user's rows even with a guessed id.

function tierFromAnalysisJson(json?: string): string | null {
  if (!json) return null;
  try {
    return (JSON.parse(json).tier as string) ?? null;
  } catch {
    return null;
  }
}

function safeParse(s: string | null | undefined): unknown {
  if (!s) return null;
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

type MessageRow = { id: string; sender: string; senderName: string | null; content: string; timestamp: Date; source: string };
function serializeMessage(m: MessageRow) {
  return {
    id: m.id,
    sender: m.sender,
    senderName: m.senderName,
    content: m.content,
    timestamp: m.timestamp.getTime(),
    source: m.source,
  };
}

type JournalRow = { id: string; text: string; tags: string | null; type: string; createdAt: Date };
function serializeJournal(j: JournalRow) {
  return { id: j.id, text: j.text, tags: j.tags, type: j.type, createdAt: j.createdAt.getTime() };
}

async function ownedArchive(userId: string, id: string) {
  const archive = await prisma.archive.findFirst({ where: { id, userId } });
  if (!archive) throw new NotFoundError('Archive not found');
  return archive;
}

async function touch(id: string) {
  await prisma.archive.update({ where: { id }, data: { updatedAt: new Date() } });
}

export async function listArchives(userId: string) {
  const rows = await prisma.archive.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    include: {
      _count: { select: { messages: true } },
      analyses: { orderBy: { createdAt: 'desc' }, take: 1, select: { json: true } },
    },
  });
  return rows.map((a) => ({
    id: a.id,
    name: a.name,
    theirName: a.theirName,
    context: a.context,
    updatedAt: a.updatedAt.getTime(),
    messageCount: a._count.messages,
    tier: tierFromAnalysisJson(a.analyses[0]?.json),
  }));
}

export async function createArchive(userId: string, input: CreateArchiveInput) {
  const a = await prisma.archive.create({
    data: {
      userId,
      name: input.name,
      theirName: input.theirName ?? null,
      context: input.context ?? null,
      mbti: input.mbti ?? null,
      attachment: input.attachment ?? null,
      traits: input.traits ?? null,
    },
  });
  return { id: a.id };
}

export async function getArchiveDetail(userId: string, id: string) {
  const a = await ownedArchive(userId, id);
  const [messages, journal, analysis] = await Promise.all([
    prisma.message.findMany({ where: { archiveId: id }, orderBy: { timestamp: 'asc' } }),
    prisma.journalEntry.findMany({ where: { archiveId: id }, orderBy: { createdAt: 'desc' } }),
    prisma.analysis.findFirst({ where: { archiveId: id }, orderBy: { createdAt: 'desc' } }),
  ]);
  return {
    id: a.id,
    name: a.name,
    theirName: a.theirName,
    context: a.context,
    mbti: a.mbti,
    attachment: a.attachment,
    traits: a.traits,
    updatedAt: a.updatedAt.getTime(),
    messages: messages.map(serializeMessage),
    journal: journal.map(serializeJournal),
    analysis: analysis ? safeParse(analysis.json) : null,
  };
}

export async function updateArchive(userId: string, id: string, input: UpdateArchiveInput) {
  await ownedArchive(userId, id);
  await prisma.archive.update({
    where: { id },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.theirName !== undefined ? { theirName: input.theirName } : {}),
      ...(input.context !== undefined ? { context: input.context } : {}),
      ...(input.mbti !== undefined ? { mbti: input.mbti } : {}),
      ...(input.attachment !== undefined ? { attachment: input.attachment } : {}),
      ...(input.traits !== undefined ? { traits: input.traits } : {}),
    },
  });
}

export async function deleteArchive(userId: string, id: string) {
  await ownedArchive(userId, id);
  await prisma.archive.delete({ where: { id } });
}

export async function addMessage(userId: string, id: string, input: AddMessageInput) {
  await ownedArchive(userId, id);
  const m = await prisma.message.create({
    data: {
      archiveId: id,
      sender: input.sender,
      content: input.content,
      timestamp: new Date(input.timestamp ?? Date.now()),
      source: 'manual',
    },
  });
  await touch(id);
  return serializeMessage(m);
}

export async function importMessages(userId: string, id: string, parsed: ParsedMessage[]) {
  await ownedArchive(userId, id);
  if (parsed.length === 0) return { added: 0 };
  await prisma.message.createMany({
    data: parsed.map((p) => ({
      archiveId: id,
      sender: p.sender,
      senderName: p.senderName,
      content: p.content,
      timestamp: new Date(p.timestamp),
      source: p.source,
    })),
  });
  await touch(id);
  return { added: parsed.length };
}

export async function deleteMessage(userId: string, archiveId: string, messageId: string) {
  await ownedArchive(userId, archiveId);
  await prisma.message.deleteMany({ where: { id: messageId, archiveId } });
  await touch(archiveId);
}

export async function updateMessage(
  userId: string,
  archiveId: string,
  messageId: string,
  input: { content?: string; sender?: 'me' | 'them' },
) {
  await ownedArchive(userId, archiveId);
  await prisma.message.updateMany({
    where: { id: messageId, archiveId },
    data: {
      ...(input.content !== undefined ? { content: input.content } : {}),
      ...(input.sender !== undefined ? { sender: input.sender } : {}),
    },
  });
  await touch(archiveId);
  const updated = await prisma.message.findFirst({ where: { id: messageId, archiveId } });
  return updated ? serializeMessage(updated) : null;
}

export async function clearMessages(userId: string, archiveId: string) {
  await ownedArchive(userId, archiveId);
  const result = await prisma.message.deleteMany({ where: { archiveId } });
  await touch(archiveId);
  return { deleted: result.count };
}

// Combined input for the analyze/predict proxy: messages + merged context (archive note + journal).
export async function getAnalysisInput(userId: string, id: string) {
  const a = await ownedArchive(userId, id);
  const [messages, journal] = await Promise.all([
    prisma.message.findMany({
      where: { archiveId: id },
      orderBy: { timestamp: 'asc' },
      select: { sender: true, content: true },
    }),
    prisma.journalEntry.findMany({
      where: { archiveId: id },
      orderBy: { createdAt: 'asc' },
      select: { text: true, tags: true },
    }),
  ]);
  const journalCtx = journal.length
    ? '\n\nJournal notes:\n' + journal.map((e) => `- ${e.text}${e.tags ? ` [${e.tags}]` : ''}`).join('\n')
    : '';
  return {
    messages,
    context: `${a.context || ''}${journalCtx}`.trim() || null,
    messageCount: messages.length,
    tags: { mbti: a.mbti, attachment: a.attachment, traits: a.traits },
  };
}

export async function addJournal(userId: string, id: string, input: JournalInput) {
  await ownedArchive(userId, id);
  const j = await prisma.journalEntry.create({
    data: { archiveId: id, text: input.text, tags: input.tags ?? null, type: input.type ?? 'text' },
  });
  await touch(id);
  return serializeJournal(j);
}

export async function deleteJournal(userId: string, id: string, entryId: string) {
  await ownedArchive(userId, id);
  await prisma.journalEntry.deleteMany({ where: { id: entryId, archiveId: id } });
}

export async function saveAnalysis(userId: string, id: string, analysis: unknown) {
  await ownedArchive(userId, id);
  await prisma.analysis.deleteMany({ where: { archiveId: id } });
  await prisma.analysis.create({ data: { archiveId: id, json: JSON.stringify(analysis) } });
}

export async function exportArchive(userId: string, id: string) {
  const detail = await getArchiveDetail(userId, id);
  return { version: 2, exportedAt: new Date().toISOString(), archive: detail };
}
