import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/server/auth';
import { apiErrorResponse } from '@/lib/server/api';
import { deleteMessage, updateMessage } from '@/lib/server/archives';
import { updateMessageSchema } from '@/lib/schemas/archive';

type Ctx = { params: { id: string; messageId: string } };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    const user = await requireUser();
    const input = updateMessageSchema.parse(await req.json());
    const message = await updateMessage(user.id, params.id, params.messageId, input);
    return NextResponse.json({ message });
  } catch (e) {
    return apiErrorResponse(e);
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    const user = await requireUser();
    await deleteMessage(user.id, params.id, params.messageId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiErrorResponse(e);
  }
}
