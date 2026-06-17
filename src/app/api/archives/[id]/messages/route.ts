import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/server/auth';
import { apiErrorResponse } from '@/lib/server/api';
import { addMessage } from '@/lib/server/archives';
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
