import { cache } from 'react';
import type { Metadata } from 'next';
import { prisma } from './db';
import { getSiteUrl } from './productImages';
import { cleanText, type SeoValues } from './seo-shared';

export const getSeoSettings = cache(async (): Promise<SeoValues> => (await prisma.seoSettings.findUnique({where: {id: 1}}))?.values as SeoValues || {});
export const getSeoRecord = cache(async (entityType: string, entityId: string): Promise<SeoValues> => (await prisma.seoRecord.findUnique({where: {entityType_entityId: {entityType, entityId}}}))?.values as SeoValues || {});
export async function pageMetadata(input: {locale: string; path: string; entityType?: string; entityId?: string; title: string; description: string; image?: string; preview?: boolean; article?: boolean}): Promise<Metadata> {
  const [settings, custom] = await Promise.all([getSeoSettings(), input.entityType && input.entityId ? getSeoRecord(input.entityType, input.entityId) : Promise.resolve({} as SeoValues)]);
  const language = input.locale === 'ar' ? 'Ar' : 'En';
  const home = input.entityType === 'page' && input.entityId === 'home';
  const title = custom[`title${language}`] || (home ? settings[`title${language}`] : '') || cleanText(input.title) || settings[`title${language}`] || 'Choco Celia';
  const description = custom[`description${language}`] || (home ? settings[`description${language}`] : '') || cleanText(input.description).slice(0, 170) || settings[`description${language}`] || '';
  const image = custom.ogImage || input.image || settings.ogImage || '/logo.png';
  const url = `${getSiteUrl()}/${input.locale}${input.path}`;
  return {
    title, description,
    alternates: {canonical: url, languages: {ar: `${getSiteUrl()}/ar${input.path}`, en: `${getSiteUrl()}/en${input.path}`, 'x-default': `${getSiteUrl()}/en${input.path}`}},
    robots: {index: !input.preview && settings.indexable !== false && custom.indexable !== false, follow: !input.preview && settings.followable !== false && custom.followable !== false},
    openGraph: {title: custom[`ogTitle${language}`] || title, description: custom[`ogDescription${language}`] || description, url, siteName: 'Choco Celia', images: [{url: image}], locale: input.locale === 'ar' ? 'ar_EG' : 'en_US', type: input.article ? 'article' : 'website'},
    twitter: {card: 'summary_large_image', title: custom[`ogTitle${language}`] || title, description: custom[`ogDescription${language}`] || description, images: [image]},
  };
}
export async function saveSeo(entityType: string, entityId: string, values: SeoValues, actor: string) {
  const where = {entityType_entityId: {entityType, entityId}};
  // Update history and values together; retain the last 20 versions.
  return prisma.$transaction(async tx => {
    const existing = await tx.seoRecord.findUnique({where});
    const stable = (value: object) => JSON.stringify(Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b))));
    if (existing && stable(existing.values as object) === stable(values)) return existing;
    const history = Array.isArray(existing?.history) ? existing.history : [];
    if (existing) history.push({values: existing.values, at: existing.updatedAt.toISOString(), actor});
    return tx.seoRecord.upsert({where, create: {entityType, entityId, values: {...values}, history: []}, update: {values: {...values}, history: history.slice(-20)}});
  });
}
