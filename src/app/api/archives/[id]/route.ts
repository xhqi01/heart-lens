import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/server/auth';
import { apiErrorResponse } from '@/lib/server/api';
import { getArchiveDetail, updateArchive, deleteArchive } from '@/lib/server/archives';
import { updateArchiveSchema } from '@/lib/schemas/archive';

type Ctx = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    const user = await requireUser();
    return NextResponse.json({ archive: await getArchiveDetail(user.id, params.id) });
  } catch (e) {
    return apiErrorResponse(e);
  }
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    const user = await requireUser();
    const input = updateArchiveSchema.parse(await req.json());
    await updateArchive(user.id, params.id, input);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiErrorResponse(e);
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    const user = await requireUser();
    await deleteArchive(user.id, params.id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiErrorResponse(e);
  }
}
