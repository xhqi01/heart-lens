import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/server/auth';
import { apiErrorResponse } from '@/lib/server/api';
import { getPublicConfig, saveConfig } from '@/lib/server/config';
import { providerConfigSchema } from '@/lib/schemas/config';

export async function GET() {
  try {
    const user = await requireUser();
    return NextResponse.json({ config: await getPublicConfig(user.id) });
  } catch (e) {
    return apiErrorResponse(e);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await requireUser();
    const input = providerConfigSchema.parse(await req.json());
    await saveConfig(user.id, input);
    return NextResponse.json({ ok: true, config: await getPublicConfig(user.id) });
  } catch (e) {
    return apiErrorResponse(e);
  }
}
