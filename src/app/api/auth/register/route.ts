import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/server/db';
import { hashPassword } from '@/lib/server/password';
import { startSession } from '@/lib/server/auth';
import { credentialsSchema } from '@/lib/schemas/auth';
import { env } from '@/lib/env';
import { apiErrorResponse } from '@/lib/server/api';

export async function POST(req: NextRequest) {
  try {
    if (env.registrationMode !== 'open') {
      return NextResponse.json({ error: 'Registration is disabled on this instance' }, { status: 403 });
    }
    const { email, password } = credentialsSchema.parse(await req.json());
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'An account with that email already exists' }, { status: 409 });
    }
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({ data: { email, passwordHash } });
    await startSession({ userId: user.id, email: user.email });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiErrorResponse(e);
  }
}
