import type { LLMProvider, CompleteRequest, ProviderRuntimeConfig } from './types';

// Adapter for any OpenAI-compatible /chat/completions endpoint
// (OpenAI, OpenRouter, LiteLLM, local servers, ...).
export class OpenAICompatibleProvider implements LLMProvider {
  constructor(private readonly cfg: ProviderRuntimeConfig) {}

  supportsVision(): boolean {
    // Vision support depends on the chosen model; assume capable and surface
    // any provider error to the caller if it is not.
    return true;
  }

  async complete(req: CompleteRequest): Promise<string> {
    const base = this.cfg.baseUrl.replace(/\/+$/, '');
    const messages: unknown[] = [{ role: 'system', content: req.system }];

    req.messages.forEach((m, i) => {
      const isLast = i === req.messages.length - 1;
      if (isLast && m.role === 'user' && req.images && req.images.length > 0) {
        messages.push({
          role: 'user',
          content: [
            { type: 'text', text: m.content },
            ...req.images.map((img) => ({
              type: 'image_url',
              image_url: { url: `data:${img.mediaType};base64,${img.base64}` },
            })),
          ],
        });
      } else {
        messages.push({ role: m.role, content: m.content });
      }
    });

    const res = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.cfg.apiKey}`,
      },
      body: JSON.stringify({
        model: this.cfg.model,
        max_tokens: req.maxTokens,
        messages,
        response_format: { type: 'json_object' },
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}) as Record<string, unknown>);
      const message = (err as { error?: { message?: string } })?.error?.message;
      throw new Error(message || `OpenAI API error ${res.status}`);
    }
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    return data?.choices?.[0]?.message?.content ?? '';
  }
}
