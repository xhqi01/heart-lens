import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/server/auth';
import { apiErrorResponse } from '@/lib/server/api';
import { ConfigMissingError } from '@/lib/server/errors';
import { getDecryptedConfig } from '@/lib/server/config';
import { getProvider } from '@/lib/providers';
import { getAnalysisInput, saveAnalysis } from '@/lib/server/archives';
import { runAnalysis } from '@/lib/llm';
import { analyzeSchema } from '@/lib/schemas/archive';

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const { archiveId } = analyzeSchema.parse(body);
    const lang = typeof body.lang === 'string' ? body.lang : 'en';

    const cfg = await getDecryptedConfig(user.id);
    if (!cfg) throw new ConfigMissingError();

    const { messages, context, messageCount, tags } = await getAnalysisInput(user.id, archiveId);
    if (messageCount < 5) {
      return NextResponse.json({ error: 'Add at least 5 messages before analyzing.' }, { status: 400 });
    }

    const analysis = await runAnalysis(getProvider(cfg), messages, context, lang, tags);
    await saveAnalysis(user.id, archiveId, analysis);
    return NextResponse.json({ analysis });
  } catch (e) {
    return apiErrorResponse(e);
  }
}
