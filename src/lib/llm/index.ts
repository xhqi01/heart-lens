import { scoreToTier, likelihoodToConf } from '@/lib/i18n';
import type { LLMProvider } from '@/lib/providers';
import {
  analyzeSystem,
  analyzePrompt,
  predictSystem,
  predictPrompt,
  imageSystem,
  imagePrompt,
  type SimpleMessage,
  type PersonaTags,
} from './prompts';
import { validateAnalysis, validatePrediction, validateImage } from './validate';

// Strip markdown fences and parse JSON from a model reply.
export function parseJsonResponse(raw: string): Record<string, unknown> {
  try {
    return JSON.parse(raw.replace(/```json|```/g, '').trim());
  } catch {
    throw new Error('The model returned an invalid format. Please try again.');
  }
}

export async function runAnalysis(
  provider: LLMProvider,
  messages: SimpleMessage[],
  archiveContext: string | null,
  lang = 'en',
  tags?: PersonaTags,
): Promise<Record<string, unknown>> {
  const raw = await provider.complete({
    system: analyzeSystem(lang),
    messages: [{ role: 'user', content: analyzePrompt(messages, archiveContext, tags) }],
    maxTokens: 4000,
  });
  const parsed = parseJsonResponse(raw);
  validateAnalysis(parsed);
  parsed.tier = scoreToTier((parsed.overallScore as number) ?? 50);
  return parsed;
}

export async function runPrediction(
  provider: LLMProvider,
  messages: SimpleMessage[],
  draft: string,
  archiveContext: string | null,
  lang = 'en',
): Promise<Record<string, unknown>> {
  const raw = await provider.complete({
    system: predictSystem(lang),
    messages: [{ role: 'user', content: predictPrompt(messages, draft, archiveContext) }],
    maxTokens: 1500,
  });
  const parsed = parseJsonResponse(raw);
  validatePrediction(parsed);
  parsed.confidence = likelihoodToConf((parsed.likelihood as number) ?? 50);
  if (Array.isArray(parsed.suggestions)) {
    parsed.suggestions = (parsed.suggestions as Record<string, unknown>[]).map((s) => ({
      ...s,
      confidence: likelihoodToConf((s.likelihood as number) ?? 50),
    }));
  }
  return parsed;
}

export async function runImageAnalysis(
  provider: LLMProvider,
  base64Image: string,
  mediaType: string,
  archiveContext: string | null,
  lang = 'en',
): Promise<Record<string, unknown>> {
  if (!provider.supportsVision()) {
    throw new Error('The selected model does not support image analysis.');
  }
  const raw = await provider.complete({
    system: imageSystem(lang),
    messages: [{ role: 'user', content: imagePrompt(archiveContext) }],
    images: [{ mediaType, base64: base64Image }],
    maxTokens: 1000,
  });
  const parsed = parseJsonResponse(raw);
  validateImage(parsed);
  return parsed;
}
