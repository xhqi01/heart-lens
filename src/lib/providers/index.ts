import type { LLMProvider, ProviderRuntimeConfig } from './types';
import { AnthropicProvider } from './anthropic';
import { OpenAICompatibleProvider } from './openai-compatible';

export function getProvider(cfg: ProviderRuntimeConfig): LLMProvider {
  if (cfg.provider === 'anthropic') return new AnthropicProvider(cfg);
  return new OpenAICompatibleProvider(cfg);
}

export type { LLMProvider, ProviderRuntimeConfig, CompleteRequest, ProviderImage } from './types';
