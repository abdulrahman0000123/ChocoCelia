import { cache } from 'react';
import { notFound, permanentRedirect } from 'next/navigation';
import { prisma } from './db';
import { getSession } from './auth';
import { contentSections, isPublished } from './seo-shared';
export const resolveContent = cache(async (locale: string, section: string, slug: string, preview: boolean) => {
  if (!['ar', 'en'].includes(locale) || !Object.values(contentSections).includes(section)) notFound();
  const page = await prisma.contentPage.findUnique({where: {slug}});
  if (!page || contentSections[page.kind] !== section) {
    const redirect = await prisma.urlRedirect.findUnique({where: {fromPath: `/${locale}/${section}/${slug}`}});
    if (redirect) permanentRedirect(redirect.toPath);
    notFound();
  }
  const authorizedPreview = preview && !!await getSession();
  if (!isPublished(page) && !authorizedPreview) notFound();
  return {page, preview: authorizedPreview};
});
