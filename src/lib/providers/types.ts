export interface ProviderImage {
  mediaType: string;
  base64: string;
}

export interface CompleteRequest {
  system: string;
  messages: { role: 'user' | 'assistant'; content: string }[];
  // Attached to the final user message (used for screenshot analysis).
  images?: ProviderImage[];
  maxTokens: number;
}

export interface LLMProvider {
  // Returns the raw text content of the model's reply.
  complete(req: CompleteRequest): Promise<string>;
  supportsVision(): boolean;
}

export interface ProviderRuntimeConfig {
  provider: 'anthropic' | 'openai';
  baseUrl: string;
  model: string;
  apiKey: string;
}
