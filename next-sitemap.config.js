/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://choco-celia.com',
  generateRobotsTxt: true,
  alternateRefs: [
    { href: 'https://choco-celia.com/en', hreflang: 'en' },
    { href: 'https://choco-celia.com/ar', hreflang: 'ar-EG' },
  ],
  // Exclude admin and api routes from the sitemap
  exclude: ['/admin*', '/api*'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api'],
      },
    ],
  },
  additionalPaths: async (config) => {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    try {
      const products = await prisma.product.findMany({
        where: { isAvailable: true }
      });
      const paths = [];
      for (const product of products) {
        const locales = ['en', 'ar'];
        for (const locale of locales) {
          paths.push({
            loc: `/${locale}/menu/${product.id}`,
            images: [
              {
                loc: product.image,
                title: product.name,
                caption: product.description.slice(0, 100),
              }
            ],
            changefreq: 'weekly',
            priority: 0.7,
            lastmod: product.updatedAt.toISOString(),
          });
        }
      }
      return paths;
    } catch (e) {
      console.error('Error generating additional sitemap paths:', e);
      return [];
    } finally {
      await prisma.$disconnect();
    }
  }
};
