import { describe, it, expect } from 'vitest';
import { runAnalysis, runPrediction, runImageAnalysis, parseJsonResponse } from './index';
import type { LLMProvider, CompleteRequest } from '@/lib/providers';

function fakeProvider(reply: string, vision = true): LLMProvider {
  return {
    supportsVision: () => vision,
    complete: async (_req: CompleteRequest) => reply,
  };
}

const analysisReply = JSON.stringify({
  summary: 's',
  overallScore: 82,
  patterns: { responseTime: 'fast' },
  communicationStyle: { label: 'warm', description: 'd', attachment: 'secure' },
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
  });

  it('strips markdown fences before parsing', async () => {
    const fenced = '```json\n' + analysisReply + '\n```';
    const out = await runAnalysis(fakeProvider(fenced), [{ sender: 'me', content: 'hi' }], null);
    expect(out.overallScore).toBe(82);
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
