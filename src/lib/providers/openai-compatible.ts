import type { LLMProvider, CompleteRequest, ProviderRuntimeConfig } from './types';
import { extractProviderError } from './util';

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
      // No response_format: many OpenAI-compatible providers reject it (or return
      // empty content). The prompts already require JSON and parsing is tolerant.
      body: JSON.stringify({
        model: this.cfg.model,
        max_tokens: req.maxTokens,
        messages,
      }),
    });

    const text = await res.text();
    if (!res.ok) {
      throw new Error(extractProviderError(text, res.status));
    }
    let data: { choices?: { message?: { content?: string } }[] };
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error('The provider returned a non-JSON response.');
    }
    const content = data?.choices?.[0]?.message?.content ?? '';
    if (!content) {
      throw new Error(
        'The provider returned an empty response — check the model name and that the base URL is OpenAI-compatible.',
      );
    }
    return content;
  }
}
