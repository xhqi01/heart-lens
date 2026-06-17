import { prisma } from './db';
import { encryptSecret, decryptSecret, maskSecret } from './crypto';
import type { ProviderConfigInput } from '@/lib/schemas/config';

// Defaults that make a fresh config usable immediately.
export const PROVIDER_DEFAULTS = {
  anthropic: { baseUrl: 'https://api.anthropic.com', model: 'claude-sonnet-4-6' },
  openai: { baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o' },
} as const;

export interface PublicConfig {
  provider: string;
  baseUrl: string;
  model: string;
  maskedKey: string | null;
}

export interface DecryptedConfig {
  provider: 'anthropic' | 'openai';
  baseUrl: string;
  model: string;
  apiKey: string;
}

// Safe to return to the browser: never includes the real key.
export async function getPublicConfig(userId: string): Promise<PublicConfig | null> {
  const c = await prisma.providerConfig.findUnique({ where: { userId } });
  if (!c) return null;
  let maskedKey: string | null = null;
  try {
    maskedKey = maskSecret(decryptSecret({ ciphertext: c.apiKeyCiphertext, iv: c.apiKeyIv, tag: c.apiKeyTag }));
  } catch {
    maskedKey = null;
  }
  return { provider: c.provider, baseUrl: c.baseUrl, model: c.model, maskedKey };
}

// Server-only: returns the decrypted key for proxying a request.
export async function getDecryptedConfig(userId: string): Promise<DecryptedConfig | null> {
  const c = await prisma.providerConfig.findUnique({ where: { userId } });
  if (!c) return null;
  return {
    provider: c.provider as 'anthropic' | 'openai',
    baseUrl: c.baseUrl,
    model: c.model,
    apiKey: decryptSecret({ ciphertext: c.apiKeyCiphertext, iv: c.apiKeyIv, tag: c.apiKeyTag }),
  };
}

export async function saveConfig(userId: string, input: ProviderConfigInput): Promise<void> {
  const existing = await prisma.providerConfig.findUnique({ where: { userId } });

  let enc: { ciphertext: string; iv: string; tag: string };
  if (input.apiKey && input.apiKey.trim().length > 0) {
    enc = encryptSecret(input.apiKey.trim());
  } else if (existing) {
    enc = { ciphertext: existing.apiKeyCiphertext, iv: existing.apiKeyIv, tag: existing.apiKeyTag };
  } else {
    throw new Error('An API key is required to save a new provider configuration.');
  }

  const data = {
    provider: input.provider,
    baseUrl: input.baseUrl,
    model: input.model,
    apiKeyCiphertext: enc.ciphertext,
    apiKeyIv: enc.iv,
    apiKeyTag: enc.tag,
  };
  await prisma.providerConfig.upsert({
    where: { userId },
    update: data,
    create: { userId, ...data },
  });
}
