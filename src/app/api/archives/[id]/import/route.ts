import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/server/auth';
import { apiErrorResponse } from '@/lib/server/api';
import { importMessages } from '@/lib/server/archives';
import { parseUploadedJSON } from '@/lib/parsers';
import { importSchema } from '@/lib/schemas/archive';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser();
    const { content, myUsername } = importSchema.parse(await req.json());
    const parsed = parseUploadedJSON(content, myUsername);
    return NextResponse.json(await importMessages(user.id, params.id, parsed));
  } catch (e) {
    return apiErrorResponse(e);
  }
}
