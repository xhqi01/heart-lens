import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/server/db';
import { verifyPassword } from '@/lib/server/password';
import { startSession } from '@/lib/server/auth';
import { credentialsSchema } from '@/lib/schemas/auth';
import { apiErrorResponse } from '@/lib/server/api';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = credentialsSchema.parse(await req.json());
    const user = await prisma.user.findUnique({ where: { email } });
    // Always run a hash comparison (against a fixed valid hash when the user is
    // absent) to avoid leaking which emails exist via response timing.
    const DUMMY_HASH = '$2a$12$m7ICcKfPQMsg1XtrihrzLeJ.Z/2GVDUTJwgiyvBzv/cnN4obF3V62';
    const ok = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);
    if (!user || !ok) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }
    await startSession({ userId: user.id, email: user.email });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiErrorResponse(e);
  }
}
