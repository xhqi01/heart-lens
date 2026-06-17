import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/server/auth';
import { apiErrorResponse } from '@/lib/server/api';
import { ConfigMissingError } from '@/lib/server/errors';
import { getDecryptedConfig } from '@/lib/server/config';
import { getProvider } from '@/lib/providers';
import { getAnalysisInput } from '@/lib/server/archives';
import { runImageAnalysis } from '@/lib/llm';
import { imageSchema } from '@/lib/schemas/archive';

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const { archiveId, imageBase64, mediaType } = imageSchema.parse(body);
    const lang = typeof body.lang === 'string' ? body.lang : 'en';

    const cfg = await getDecryptedConfig(user.id);
    if (!cfg) throw new ConfigMissingError();

    // Accept either a raw base64 string or a data URL.
    const base64 = imageBase64.replace(/^data:[^;]+;base64,/, '');

    let context: string | null = null;
    if (archiveId) {
      context = (await getAnalysisInput(user.id, archiveId)).context;
    }

    const analysis = await runImageAnalysis(getProvider(cfg), base64, mediaType, context, lang);
    return NextResponse.json({ analysis });
  } catch (e) {
    return apiErrorResponse(e);
  }
}
