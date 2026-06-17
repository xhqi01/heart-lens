import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/server/auth';
import { apiErrorResponse } from '@/lib/server/api';
import { exportArchive } from '@/lib/server/archives';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser();
    const data = await exportArchive(user.id, params.id);
    return new NextResponse(JSON.stringify(data, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="heartlens-archive-${params.id}.json"`,
      },
    });
  } catch (e) {
    return apiErrorResponse(e);
  }
}
