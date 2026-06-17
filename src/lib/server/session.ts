import { SignJWT, jwtVerify } from 'jose';
import { env } from '@/lib/env';

// Pure JWT session tokens (no next/headers import, so this module is unit-testable).
// Cookie handling lives in auth.ts.

export const SESSION_COOKIE = 'hl_session';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days, seconds
const ALG = 'HS256';

export interface SessionPayload {
  userId: string;
  email: string;
}

function secretKey(secret: string = env.authSecret): Uint8Array {
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(
  payload: SessionPayload,
  secret: string = env.authSecret,
): Promise<string> {
  return new SignJWT({ userId: payload.userId, email: payload.email })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secretKey(secret));
}

export async function verifySessionToken(
  token: string,
  secret: string = env.authSecret,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey(secret));
    if (typeof payload.userId === 'string' && typeof payload.email === 'string') {
      return { userId: payload.userId, email: payload.email };
    }
    return null;
  } catch {
    return null;
  }
}
