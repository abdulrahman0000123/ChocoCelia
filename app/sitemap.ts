import type { MetadataRoute } from 'next';
import { prisma } from '@/app/lib/db';
import { getSiteUrl } from '@/app/lib/productImages';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const publicPages = ['/', '/menu', '/about', '/contact'];
  const pages: MetadataRoute.Sitemap = publicPages.flatMap((path) =>
    (['en', 'ar'] as const).map((locale) => ({
      url: `${siteUrl}/${locale}${path === '/' ? '' : path}`,
      changeFrequency: path === '/' ? 'weekly' as const : 'monthly' as const,
      priority: path === '/' ? 1 : path === '/menu' ? 0.9 : 0.6,
      alternates: {
        languages: {
          en: `${siteUrl}/en${path === '/' ? '' : path}`,
          ar: `${siteUrl}/ar${path === '/' ? '' : path}`,
          'x-default': `${siteUrl}/en${path === '/' ? '' : path}`,
        },
      },
    })),
  );

  const products = await prisma.product.findMany({
    where: { isAvailable: true },
    select: { id: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' },
  });

  return pages.concat(products.flatMap(({ id, updatedAt }) =>
    (['en', 'ar'] as const).map((locale) => ({
      url: `${siteUrl}/${locale}/menu/${id}`,
      lastModified: updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
      alternates: {
        languages: {
          en: `${siteUrl}/en/menu/${id}`,
          ar: `${siteUrl}/ar/menu/${id}`,
          'x-default': `${siteUrl}/en/menu/${id}`,
        },
      },
    })),
  ));
}
