import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AnthropicProvider } from './anthropic';
import { OpenAICompatibleProvider } from './openai-compatible';

function mockFetch(responseBody: unknown, ok = true, status = 200) {
  const text = typeof responseBody === 'string' ? responseBody : JSON.stringify(responseBody);
  const fn = vi.fn(async () => ({
    ok,
    status,
    json: async () => responseBody,
    text: async () => text,
  }));
  vi.stubGlobal('fetch', fn);
  return fn;
}

afterEach(() => vi.unstubAllGlobals());

describe('AnthropicProvider', () => {
  const cfg = { provider: 'anthropic' as const, baseUrl: 'https://api.anthropic.com/', model: 'claude-x', apiKey: 'sk-ant-1' };

  it('posts to /v1/messages with the api key and returns the text', async () => {
    const fetchFn = mockFetch({ content: [{ text: 'HELLO' }] });
    const out = await new AnthropicProvider(cfg).complete({
      system: 'sys',
      messages: [{ role: 'user', content: 'hi' }],
      maxTokens: 100,
    });
    expect(out).toBe('HELLO');
    const [url, init] = fetchFn.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.anthropic.com/v1/messages'); // trailing slash trimmed
    expect((init.headers as Record<string, string>)['x-api-key']).toBe('sk-ant-1');
    const body = JSON.parse(init.body as string);
    expect(body.model).toBe('claude-x');
    expect(body.system).toBe('sys');
  });

  it('attaches an image block to the final user message', async () => {
    const fetchFn = mockFetch({ content: [{ text: 'OK' }] });
    await new AnthropicProvider(cfg).complete({
      system: 'sys',
      messages: [{ role: 'user', content: 'look' }],
      images: [{ mediaType: 'image/png', base64: 'AAAA' }],
      maxTokens: 100,
    });
    const body = JSON.parse((fetchFn.mock.calls[0] as [string, RequestInit])[1].body as string);
    expect(body.messages[0].content[0].type).toBe('image');
    expect(body.messages[0].content[0].source.data).toBe('AAAA');
  });

  it('throws on a non-ok response', async () => {
    mockFetch({ error: { message: 'bad key' } }, false, 401);
    await expect(
      new AnthropicProvider(cfg).complete({ system: 's', messages: [{ role: 'user', content: 'x' }], maxTokens: 10 }),
    ).rejects.toThrow('bad key');
  });
});

describe('OpenAICompatibleProvider', () => {
  const cfg = { provider: 'openai' as const, baseUrl: 'https://api.openai.com/v1', model: 'gpt-x', apiKey: 'sk-oa-1' };

  it('posts to /chat/completions with a bearer token and system message', async () => {
    const fetchFn = mockFetch({ choices: [{ message: { content: 'WORLD' } }] });
    const out = await new OpenAICompatibleProvider(cfg).complete({
      system: 'sys',
      messages: [{ role: 'user', content: 'hi' }],
      maxTokens: 50,
    });
    expect(out).toBe('WORLD');
    const [url, init] = fetchFn.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.openai.com/v1/chat/completions');
    expect((init.headers as Record<string, string>)['Authorization']).toBe('Bearer sk-oa-1');
    const body = JSON.parse(init.body as string);
    expect(body.messages[0]).toEqual({ role: 'system', content: 'sys' });
    expect(body.messages[1]).toEqual({ role: 'user', content: 'hi' });
  });

  it('encodes images as data-url image_url parts', async () => {
    const fetchFn = mockFetch({ choices: [{ message: { content: 'OK' } }] });
    await new OpenAICompatibleProvider(cfg).complete({
      system: 'sys',
      messages: [{ role: 'user', content: 'look' }],
      images: [{ mediaType: 'image/jpeg', base64: 'BBBB' }],
      maxTokens: 50,
    });
    const body = JSON.parse((fetchFn.mock.calls[0] as [string, RequestInit])[1].body as string);
    const parts = body.messages[1].content;
    expect(parts[1].image_url.url).toBe('data:image/jpeg;base64,BBBB');
  });

  it('does not force response_format (kept off for cross-provider compatibility)', async () => {
    const fetchFn = mockFetch({ choices: [{ message: { content: '{"ok":1}' } }] });
    await new OpenAICompatibleProvider(cfg).complete({ system: 's', messages: [{ role: 'user', content: 'hi' }], maxTokens: 50 });
    const body = JSON.parse((fetchFn.mock.calls[0] as [string, RequestInit])[1].body as string);
    expect(body.response_format).toBeUndefined();
  });

  it('surfaces a provider error from a { message } shape', async () => {
    mockFetch({ message: 'Model Not Exist' }, false, 400);
    await expect(
      new OpenAICompatibleProvider(cfg).complete({ system: 's', messages: [{ role: 'user', content: 'x' }], maxTokens: 10 }),
    ).rejects.toThrow('Model Not Exist');
  });

  it('throws a clear error when the provider returns empty content', async () => {
    mockFetch({ choices: [{ message: { content: '' } }] });
    await expect(
      new OpenAICompatibleProvider(cfg).complete({ system: 's', messages: [{ role: 'user', content: 'x' }], maxTokens: 10 }),
    ).rejects.toThrow(/empty/i);
  });
});
