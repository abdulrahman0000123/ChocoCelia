import { notFound } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { prisma } from '@/app/lib/db';
import { pageMetadata } from '@/app/lib/seo';
import { contentSections, contentPath, publishedWhere } from '@/app/lib/seo-shared';
const labels: Record<string, [string, string]> = {journal: ['دليل الشوكولاتة', 'Chocolate journal'], collections: ['مجموعات الشوكولاتة', 'Chocolate collections'], occasions: ['هدايا المناسبات', 'Occasion gifts'], campaigns: ['الحملات', 'Campaigns'], categories: ['تصنيفات الشوكولاتة', 'Chocolate categories'], pages: ['المعلومات', 'Information']};
type Props = {params: Promise<{locale: string; section: string}>};
export const dynamic = 'force-dynamic';
export async function generateMetadata({params}: Props) {const {locale, section} = await params; if (!labels[section]) notFound(); return pageMetadata({locale, path: `/${section}`, entityType: 'page', entityId: section, title: labels[section][locale === 'ar' ? 0 : 1], description: ''});}
export default async function ContentList({params}: Props) {
  const {locale, section} = await params;
  if (!labels[section]) notFound();
  const kind = Object.keys(contentSections).find(k => contentSections[k] === section)!;
  const pages = await prisma.contentPage.findMany({where: {...publishedWhere(), kind}, orderBy: {publishAt: 'desc'}});
  return <main className="max-w-5xl mx-auto px-5 pt-32 pb-20 text-chocolate-900 dark:text-chocolate-100"><h1 className="text-4xl font-semibold mb-10">{labels[section][locale === 'ar' ? 0 : 1]}</h1>{pages.map(p => <article key={p.id} className="py-6 border-t border-chocolate-200 dark:border-chocolate-800"><h2 className="text-2xl font-semibold"><Link href={contentPath(p)}>{locale === 'ar' ? p.titleAr : p.titleEn}</Link></h2><p className="mt-3 max-w-3xl leading-relaxed">{locale === 'ar' ? p.summaryAr : p.summaryEn}</p><Link className="inline-block mt-3 underline text-gold-700 dark:text-gold-300" href={contentPath(p)}>{locale === 'ar' ? 'اقرأ المزيد' : 'Explore'}</Link></article>)}{!pages.length && <p>{locale === 'ar' ? 'المحتوى قيد التجهيز. يمكنك تصفح المنتجات الآن.' : 'Content is being prepared. Explore our products in the meantime.'}</p>}<Link href="/menu" className="inline-block mt-8 underline">{locale === 'ar' ? 'تصفح الشوكولاتة' : 'Browse chocolates'}</Link></main>;
}
