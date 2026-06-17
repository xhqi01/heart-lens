import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/server/auth';
import { apiErrorResponse } from '@/lib/server/api';
import { addMessage, clearMessages } from '@/lib/server/archives';
import { addMessageSchema } from '@/lib/schemas/archive';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser();
    const input = addMessageSchema.parse(await req.json());
    return NextResponse.json({ message: await addMessage(user.id, params.id, input) });
  } catch (e) {
    return apiErrorResponse(e);
  }
}

// Clear every message in the archive (e.g. to undo an accidental import).
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser();
    return NextResponse.json(await clearMessages(user.id, params.id));
  } catch (e) {
    return apiErrorResponse(e);
  }
}
