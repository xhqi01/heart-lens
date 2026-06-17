import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/server/auth';
import { apiErrorResponse } from '@/lib/server/api';
import { ConfigMissingError } from '@/lib/server/errors';
import { getDecryptedConfig } from '@/lib/server/config';
import { getProvider } from '@/lib/providers';
import { getAnalysisInput } from '@/lib/server/archives';
import { runPrediction } from '@/lib/llm';
import { predictSchema } from '@/lib/schemas/archive';

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const { archiveId, draft } = predictSchema.parse(body);
    const lang = typeof body.lang === 'string' ? body.lang : 'en';

    const cfg = await getDecryptedConfig(user.id);
    if (!cfg) throw new ConfigMissingError();

    const { messages, context } = await getAnalysisInput(user.id, archiveId);
    const prediction = await runPrediction(getProvider(cfg), messages, draft, context, lang);
    return NextResponse.json({ prediction });
  } catch (e) {
    return apiErrorResponse(e);
  }
}
