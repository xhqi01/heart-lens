import { describe, it, expect } from 'vitest';
import { runAnalysis, runPrediction, runImageAnalysis, parseJsonResponse } from './index';
import type { LLMProvider, CompleteRequest } from '@/lib/providers';

function fakeProvider(reply: string, vision = true): LLMProvider {
  return {
    supportsVision: () => vision,
    complete: async (_req: CompleteRequest) => reply,
  };
}

function capturingProvider(reply: string) {
  const calls: CompleteRequest[] = [];
  const provider: LLMProvider = {
    supportsVision: () => true,
    complete: async (req: CompleteRequest) => {
      calls.push(req);
      return reply;
    },
  };
  return { provider, calls };
}

const analysisReply = JSON.stringify({
  summary: 's',
  overallScore: 82,
  patterns: { responseTime: 'fast' },
  communicationStyle: { label: 'warm', description: 'd', attachment: 'secure' },
  persona: {
    coreRules: ['when you reply slowly, they send "..." and wait'],
    expressionStyle: {
      catchphrases: ['lol'],
      signatureEmoji: [{ emoji: '😊', context: 'polite, not always happy' }],
      replyRhythm: 'fast when relaxed',
    },
    emotionalPatterns: { showsCare: { how: 'acts of service' } },
    conflictChain: { triggers: ['being rushed'] },
    relationshipRole: { initiation: 'rarely initiates' },
  },
});

const predictionReply = JSON.stringify({
  likelihood: 70,
  predictedTone: 'warm',
  likelyResponse: 'sure!',
  reasoning: 'because',
  suggestions: [{ version: 'v1', why: 'w', likelihood: 80 }],
});

describe('llm orchestration', () => {
  it('runAnalysis parses, validates and derives a tier', async () => {
    const out = await runAnalysis(fakeProvider(analysisReply), [{ sender: 'me', content: 'hi' }], null);
    expect(out.summary).toBe('s');
    expect(out.tier).toBe('vhigh'); // 82 -> vhigh
    expect(out.persona).toBeTruthy();
  });

  it('strips markdown fences before parsing', async () => {
    const fenced = '```json\n' + analysisReply + '\n```';
    const out = await runAnalysis(fakeProvider(fenced), [{ sender: 'me', content: 'hi' }], null);
    expect(out.overallScore).toBe(82);
  });

  it('forwards manual personality tags into the prompt', async () => {
    const { provider, calls } = capturingProvider(analysisReply);
    await runAnalysis(provider, [{ sender: 'me', content: 'hi' }], null, 'en', {
      mbti: 'ISFP',
      attachment: 'avoidant',
      traits: 'guarded, witty',
    });
    const prompt = calls[0].messages[0].content;
    expect(prompt).toContain('ISFP');
    expect(prompt).toContain('avoidant');
    expect(prompt).toContain('guarded, witty');
  });

  it('throws when the analysis is missing the persona block', async () => {
    const noPersona = JSON.stringify({
      summary: 's',
      overallScore: 80,
      patterns: { x: 'y' },
      communicationStyle: { label: 'a', description: 'b', attachment: 'secure' },
    });
    await expect(runAnalysis(fakeProvider(noPersona), [], null)).rejects.toThrow(/validation/);
  });

  it('runPrediction derives confidence on the result and suggestions', async () => {
    const out = await runPrediction(fakeProvider(predictionReply), [], 'draft', null);
    expect(out.confidence).toBe('likely'); // 70 -> likely
    expect((out.suggestions as { confidence: string }[])[0].confidence).toBe('vlikely'); // 80
  });

  it('throws on invalid JSON', async () => {
    await expect(runAnalysis(fakeProvider('not json'), [], null)).rejects.toThrow(/invalid format/);
  });

  it('throws when the analysis is missing required fields', async () => {
    await expect(runAnalysis(fakeProvider('{"summary":"x"}'), [], null)).rejects.toThrow(/validation/);
  });

  it('runImageAnalysis rejects when vision is unsupported', async () => {
    const reply = JSON.stringify({ summary: 's', overallRead: 'r' });
    await expect(runImageAnalysis(fakeProvider(reply, false), 'AAAA', 'image/png', null)).rejects.toThrow(
      /does not support image/,
    );
  });

  it('parseJsonResponse handles plain objects', () => {
    expect(parseJsonResponse('{"a":1}')).toEqual({ a: 1 });
  });
});
