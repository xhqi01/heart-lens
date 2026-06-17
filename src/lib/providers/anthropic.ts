import type { LLMProvider, CompleteRequest, ProviderRuntimeConfig } from './types';
import { extractProviderError } from './util';

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

    const text = await res.text();
    if (!res.ok) {
      throw new Error(extractProviderError(text, res.status));
    }
    let data: { content?: { text?: string }[] };
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error('The provider returned a non-JSON response.');
    }
    const content = data?.content?.[0]?.text ?? '';
    if (!content) {
      throw new Error('The provider returned an empty response — check the model name and base URL.');
    }
    return content;
  }
}
