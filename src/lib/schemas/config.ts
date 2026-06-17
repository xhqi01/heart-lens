import { z } from 'zod';

export const providerConfigSchema = z.object({
  provider: z.enum(['anthropic', 'openai']),
  baseUrl: z.string().url().max(500),
  model: z.string().min(1).max(200),
  // Optional on update: blank means "keep the existing key".
  apiKey: z.string().max(500).optional(),
});

export type ProviderConfigInput = z.infer<typeof providerConfigSchema>;
