import crypto from 'node:crypto';
import { env } from '@/lib/env';

// AES-256-GCM encryption for API keys at rest. The master key comes from
// APP_ENCRYPTION_KEY (base64, 32 bytes). Ciphertext, IV and auth tag are stored
// separately and only ever decrypted server-side at call time.

export interface EncryptedSecret {
  ciphertext: string; // base64
  iv: string; // base64
  tag: string; // base64
}

function keyBuffer(base64Key: string): Buffer {
  const buf = Buffer.from(base64Key, 'base64');
  if (buf.length !== 32) {
    throw new Error('APP_ENCRYPTION_KEY must decode to exactly 32 bytes (base64).');
  }
  return buf;
}

export function encryptSecret(plaintext: string, base64Key: string = env.encryptionKey): EncryptedSecret {
  const key = keyBuffer(base64Key);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    ciphertext: ciphertext.toString('base64'),
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
  };
}

export function decryptSecret(enc: EncryptedSecret, base64Key: string = env.encryptionKey): string {
  const key = keyBuffer(base64Key);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(enc.iv, 'base64'));
  decipher.setAuthTag(Buffer.from(enc.tag, 'base64'));
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(enc.ciphertext, 'base64')),
    decipher.final(),
  ]);
  return plaintext.toString('utf8');
}

// For display only — never returns the full secret.
export function maskSecret(secret: string): string {
  if (!secret) return '';
  if (secret.length <= 8) return '••••';
  return `${secret.slice(0, 3)}••••${secret.slice(-4)}`;
}
