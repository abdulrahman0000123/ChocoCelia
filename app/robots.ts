import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/app/lib/productImages';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();
  return {
    rules: [{ userAgent: '*', allow: ['/', '/api/products/*/image'], disallow: ['/admin/', '/api/'] }],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
