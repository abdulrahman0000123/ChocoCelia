import type { MetadataRoute } from 'next';
import { prisma } from '@/app/lib/db';
import { getSiteUrl } from '@/app/lib/productImages';
import { contentPath, publishedWhere, type SeoValues } from '@/app/lib/seo-shared';
export const dynamic = 'force-dynamic';
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const [products, content, records, settings] = await Promise.all([
    prisma.product.findMany({where: {published: true}, select: {id: true, slug: true, updatedAt: true}}),
    prisma.contentPage.findMany({where: publishedWhere()}), prisma.seoRecord.findMany(), prisma.seoSettings.findUnique({where: {id: 1}}),
  ]);
  if ((settings?.values as SeoValues)?.indexable === false) return [];
  const blocked = new Set(records.filter(r => (r.values as SeoValues).indexable === false).map(r => `${r.entityType}:${r.entityId}`));
  const publicPaths = ['', '/menu', '/about', '/contact'].filter(path => !blocked.has(`page:${path.slice(1) || 'home'}`));
  for (const section of new Set(content.map(p => contentPath(p).split('/')[1]))) if (!blocked.has(`page:${section}`)) publicPaths.push(`/${section}`);
  const entries = [...publicPaths.map(path => ({path})), ...products.filter(p => !blocked.has(`product:${p.id}`)).map(p => ({path: `/menu/${p.slug || p.id}`, updatedAt: p.updatedAt})), ...content.filter(p => !blocked.has(`content:${p.id}`)).map(p => ({path: contentPath(p), updatedAt: p.updatedAt}))];
  return entries.flatMap(entry => ['ar', 'en'].map(locale => ({url: `${siteUrl}/${locale}${entry.path}`, ...('updatedAt' in entry ? {lastModified: entry.updatedAt as Date} : {}), alternates: {languages: {ar: `${siteUrl}/ar${entry.path}`, en: `${siteUrl}/en${entry.path}`, 'x-default': `${siteUrl}/en${entry.path}`}}})));
}
