import type { LLMProvider, CompleteRequest, ProviderRuntimeConfig } from './types';

// Anthropic Messages API adapter. Runs server-side, so the dangerous
// browser-access header is intentionally absent.
export class AnthropicProvider implements LLMProvider {
  constructor(private readonly cfg: ProviderRuntimeConfig) {}

  supportsVision(): boolean {
    return true;
  }

  async complete(req: CompleteRequest): Promise<string> {
    const base = this.cfg.baseUrl.replace(/\/+$/, '');
    const messages = req.messages.map((m, i) => {
      const isLast = i === req.messages.length - 1;
      if (isLast && m.role === 'user' && req.images && req.images.length > 0) {
        return {
          role: m.role,
          content: [
            ...req.images.map((img) => ({
              type: 'image',
              source: { type: 'base64', media_type: img.mediaType, data: img.base64 },
            })),
            { type: 'text', text: m.content },
          ],
        };
      }
      return { role: m.role, content: m.content };
    });

    const res = await fetch(`${base}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.cfg.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.cfg.model,
        max_tokens: req.maxTokens,
        system: req.system,
        messages,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}) as Record<string, unknown>);
      const message = (err as { error?: { message?: string } })?.error?.message;
      throw new Error(message || `Anthropic API error ${res.status}`);
    }
    const data = (await res.json()) as { content?: { text?: string }[] };
    return data?.content?.[0]?.text ?? '';
  }
}
