// Extracts a human-readable error message from a provider's error response,
// tolerating the various JSON shapes different OpenAI-compatible providers use.
export function extractProviderError(body: string, status: number): string {
  try {
    const j = JSON.parse(body);
    const msg = j?.error?.message ?? j?.error ?? j?.message ?? j?.detail;
    if (typeof msg === 'string' && msg.trim()) return msg;
  } catch {
    /* not JSON */
  }
  const snippet = body.trim().slice(0, 300);
  return snippet ? `Provider error ${status}: ${snippet}` : `Provider error ${status}`;
}
