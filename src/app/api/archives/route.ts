import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/server/auth';
import { apiErrorResponse } from '@/lib/server/api';
import { listArchives, createArchive } from '@/lib/server/archives';
import { createArchiveSchema } from '@/lib/schemas/archive';

export async function GET() {
  try {
    const user = await requireUser();
    return NextResponse.json({ archives: await listArchives(user.id) });
  } catch (e) {
    return apiErrorResponse(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const input = createArchiveSchema.parse(await req.json());
    return NextResponse.json(await createArchive(user.id, input));
  } catch (e) {
    return apiErrorResponse(e);
  }
}
