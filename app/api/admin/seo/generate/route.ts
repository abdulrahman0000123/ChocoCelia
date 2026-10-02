import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';
import { requireAdmin, readBody, apiError } from '@/app/lib/seo-admin';
import { localSeo } from '@/app/lib/seo-shared';
import { openSecret } from '@/app/lib/secret-store';
import {isAiProvider, providerKey} from '@/app/lib/ai-providers';
import {generateAiSeo} from '@/app/lib/ai-generation';
export async function POST(request: Request) {
  const session = await requireAdmin(request);
  if (!session) return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  try {
    const body = await readBody(request);
    const input = {titleAr: String(body.titleAr || '').slice(0, 500), titleEn: String(body.titleEn || '').slice(0, 500), bodyAr: String(body.bodyAr || '').slice(0, 8000), bodyEn: String(body.bodyEn || '').slice(0, 8000), image: typeof body.image === 'string' ? body.image : ''};
    const fallback = localSeo(input);
    if (body.useAi !== true) return NextResponse.json({values: fallback, source: 'local'});
    const settings = await prisma.aiSettings.findUnique({where: {id: 1}});
    const provider = settings && isAiProvider(settings.provider) ? settings.provider : 'openai';
    const encryptedKey = settings ? providerKey(settings, provider) : undefined;
    if (!settings?.enabled || !encryptedKey) return NextResponse.json({values: fallback, source: 'local', notice: 'AI is not configured; local suggestions are ready.'});
    // A persistent per-admin cooldown protects against accidental repeated paid requests.
    const key = `seo-ai:${session.user!.id}`;
    const claimed = await prisma.$executeRaw`INSERT INTO "LoginAttempt" ("key", "count", "windowStart", "updatedAt") VALUES (${key}, 1, NOW(), NOW()) ON CONFLICT ("key") DO UPDATE SET "windowStart" = NOW(), "updatedAt" = NOW() WHERE "LoginAttempt"."windowStart" < NOW() - INTERVAL '10 seconds'`;
    if (!claimed) return NextResponse.json({error: 'Wait 10 seconds before generating again.'}, {status: 429});
    try {
      const generated = await generateAiSeo(provider, settings.model, openSecret(encryptedKey), input);
      return NextResponse.json({values: {...fallback, ...generated, source: 'ai'}, source: 'ai', provider});
    } catch { return NextResponse.json({values: fallback, source: 'local', notice: 'AI could not complete this request; local suggestions are ready.'}); }
  } catch (error) { return apiError(error); }
}
