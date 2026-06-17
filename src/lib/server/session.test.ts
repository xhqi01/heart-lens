import { describe, it, expect } from 'vitest';
import { createSessionToken, verifySessionToken } from './session';

const SECRET = 'unit-test-secret-which-is-sufficiently-long-1234567890';

describe('session tokens', () => {
  it('signs and verifies a payload', async () => {
    const token = await createSessionToken({ userId: 'u1', email: 'a@b.com' }, SECRET);
    expect(token.split('.')).toHaveLength(3);
    const payload = await verifySessionToken(token, SECRET);
    expect(payload).toEqual({ userId: 'u1', email: 'a@b.com' });
  });

  it('rejects a token signed with a different secret', async () => {
    const token = await createSessionToken({ userId: 'u1', email: 'a@b.com' }, SECRET);
    expect(await verifySessionToken(token, 'a-different-secret-entirely-000000000')).toBeNull();
  });

  it('rejects a garbage token', async () => {
    expect(await verifySessionToken('not-a-jwt', SECRET)).toBeNull();
  });
});
