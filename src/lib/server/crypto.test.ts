import { describe, it, expect } from 'vitest';
import { encryptSecret, decryptSecret, maskSecret } from './crypto';

// 32-byte key, base64-encoded.
const KEY = Buffer.from('0123456789abcdef0123456789abcdef').toString('base64');

describe('crypto', () => {
  it('round-trips a secret', () => {
    const enc = encryptSecret('sk-ant-secret-12345', KEY);
    expect(enc.ciphertext).toBeTruthy();
    expect(enc.iv).toBeTruthy();
    expect(enc.tag).toBeTruthy();
    expect(enc.ciphertext).not.toContain('sk-ant');
    expect(decryptSecret(enc, KEY)).toBe('sk-ant-secret-12345');
  });

  it('uses a random IV so identical plaintexts produce different ciphertexts', () => {
    const a = encryptSecret('same-value', KEY);
    const b = encryptSecret('same-value', KEY);
    expect(a.iv).not.toBe(b.iv);
    expect(a.ciphertext).not.toBe(b.ciphertext);
  });

  it('throws when the auth tag is tampered with', () => {
    const enc = encryptSecret('secret', KEY);
    const tampered = { ...enc, tag: Buffer.from('0000000000000000').toString('base64') };
    expect(() => decryptSecret(tampered, KEY)).toThrow();
  });

  it('rejects a key that is not 32 bytes', () => {
    const shortKey = Buffer.from('too-short').toString('base64');
    expect(() => encryptSecret('x', shortKey)).toThrow(/32 bytes/);
  });

  it('masks secrets for display', () => {
    expect(maskSecret('sk-ant-abcdef123456')).toBe('sk-••••3456');
    expect(maskSecret('short')).toBe('••••');
    expect(maskSecret('')).toBe('');
  });
});
