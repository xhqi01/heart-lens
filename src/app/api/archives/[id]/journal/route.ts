import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/server/auth';
import { apiErrorResponse } from '@/lib/server/api';
import { addJournal } from '@/lib/server/archives';
import { journalSchema } from '@/lib/schemas/archive';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser();
    const input = journalSchema.parse(await req.json());
    return NextResponse.json({ entry: await addJournal(user.id, params.id, input) });
  } catch (e) {
    return apiErrorResponse(e);
  }
}
