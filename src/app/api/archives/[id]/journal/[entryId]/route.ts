import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/server/auth';
import { apiErrorResponse } from '@/lib/server/api';
import { deleteJournal } from '@/lib/server/archives';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string; entryId: string } },
) {
  try {
    const user = await requireUser();
    await deleteJournal(user.id, params.id, params.entryId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiErrorResponse(e);
  }
}
