import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { resolveContent } from '@/app/lib/content';
import { pageMetadata } from '@/app/lib/seo';
import { prisma } from '@/app/lib/db';
import { contentPath, publishedWhere } from '@/app/lib/seo-shared';
import { getSiteUrl, toPublicProduct } from '@/app/lib/productImages';
import { serializeJsonLd } from '@/app/lib/jsonLd';
import { ProductCard } from '@/app/components/ProductCard';
import { BreadcrumbSchema } from '@/app/components/schemas/BreadcrumbSchema';
type Props = {params: Promise<{locale: string; section: string; slug: string}>; searchParams: Promise<{preview?: string}>};
export const dynamic = 'force-dynamic';
export async function generateMetadata({params, searchParams}: Props) {
  const {locale, section, slug} = await params;
  const {page, preview} = await resolveContent(locale, section, slug, (await searchParams).preview === '1');
  return pageMetadata({locale, path: contentPath(page), entityType: 'content', entityId: page.id, title: locale === 'ar' ? page.titleAr : page.titleEn, description: locale === 'ar' ? page.summaryAr || page.bodyAr : page.summaryEn || page.bodyEn, image: page.image || undefined, preview, article: page.kind === 'ARTICLE'});
}
export default async function ContentPage({params, searchParams}: Props) {
  const {locale, section, slug} = await params;
  const {page, preview} = await resolveContent(locale, section, slug, (await searchParams).preview === '1');
  const ar = locale === 'ar', title = ar ? page.titleAr : page.titleEn, summary = ar ? page.summaryAr : page.summaryEn, body = ar ? page.bodyAr : page.bodyEn;
  const allProducts = page.productIds.length || page.categoryId || page.attributeKeys.length ? await prisma.product.findMany({where: {published: true, ...(page.productIds.length ? {id: {in: page.productIds}} : page.categoryId ? {categoryId: page.categoryId} : {})}, include: {category: true}}) : [];
  const products = page.attributeKeys.length ? allProducts.filter(p => Array.isArray(p.attributes) && p.attributes.some(a => a && typeof a === 'object' && !Array.isArray(a) && page.attributeKeys.includes(String(a.key)))) : allProducts;
  const related = await prisma.contentPage.findMany({where: {...publishedWhere(), id: {not: page.id}, ...(page.productIds.length ? {productIds: {hasSome: page.productIds}} : {kind: page.kind})}, take: 4, orderBy: {updatedAt: 'desc'}});
  const url = `${getSiteUrl()}/${locale}${contentPath(page)}`;
  const schema = page.kind === 'ARTICLE' ? {'@context': 'https://schema.org', '@type': 'Article', headline: title, description: summary, ...(page.image ? {image: new URL(page.image, getSiteUrl()).href} : {}), datePublished: (page.publishAt || page.createdAt).toISOString(), dateModified: page.updatedAt.toISOString(), author: {'@type': 'Organization', name: 'Choco Celia'}, publisher: {'@type': 'Organization', name: 'Choco Celia', url: getSiteUrl()}, mainEntityOfPage: url, inLanguage: locale} : {'@context': 'https://schema.org', '@type': 'CollectionPage', name: title, url, mainEntity: {'@type': 'ItemList', itemListElement: products.map((p, i) => ({'@type': 'ListItem', position: i + 1, url: `${getSiteUrl()}/${locale}/menu/${p.slug || p.id}`}))}};
  return <main className="max-w-6xl mx-auto px-5 pt-32 pb-16 text-chocolate-900 dark:text-chocolate-100">
    {preview && <p role="status" className="mb-5 p-3 rounded-lg bg-gold-100 text-chocolate-900">{ar ? 'معاينة خاصة، الصفحة غير متاحة للفهرسة.' : 'Private preview. This view is not indexable.'}</p>}
    <BreadcrumbSchema items={[{name: ar ? 'الرئيسية' : 'Home', item: `${getSiteUrl()}/${locale}`}, {name: section, item: `${getSiteUrl()}/${locale}/${section}`}, {name: title, item: url}]}/>
    {!preview && <script type="application/ld+json" dangerouslySetInnerHTML={{__html: serializeJsonLd(schema)}}/>}
    <nav className="text-sm mb-6"><Link href="/">{ar ? 'الرئيسية' : 'Home'}</Link> / <Link href={`/${section}`}>{ar ? 'تصفح المحتوى' : 'Explore'}</Link></nav>
    <article><header className="max-w-3xl"><h1 className="text-4xl md:text-5xl font-semibold leading-tight">{title}</h1>{summary && <p className="text-lg leading-relaxed mt-5">{summary}</p>}{page.kind === 'ARTICLE' && <time className="block text-sm mt-4 text-chocolate-500 dark:text-chocolate-300" dateTime={(page.publishAt || page.createdAt).toISOString()}>{(page.publishAt || page.createdAt).toLocaleDateString(ar ? 'ar-EG' : 'en-GB', {timeZone: 'Africa/Cairo'})}</time>}</header>
      {page.image && <div className="relative aspect-[16/7] my-8"><Image src={page.image} alt={(ar ? page.imageAltAr : page.imageAltEn) || title} fill sizes="(max-width: 768px) 100vw, 1100px" priority className="object-cover rounded-xl"/></div>}
      <div className="max-w-3xl space-y-5 my-8 leading-8 text-lg">{body.split(/\n\s*\n/).filter(Boolean).map((paragraph, i) => <p key={i} className="whitespace-pre-line">{paragraph}</p>)}</div>
    </article>
    {!!products.length && <section className="mt-12"><h2 className="text-2xl font-semibold mb-6">{ar ? 'منتجات مرتبطة' : 'Related products'}</h2><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">{products.map(p => <ProductCard key={p.id} product={toPublicProduct(p)}/>)}</div></section>}
    {!!related.length && <section className="mt-12"><h2 className="text-2xl font-semibold mb-4">{ar ? 'اقرأ أيضًا' : 'Explore more'}</h2><ul className="space-y-3">{related.map(p => <li key={p.id}><Link className="underline text-gold-700 dark:text-gold-300" href={contentPath(p)}>{ar ? p.titleAr : p.titleEn}</Link></li>)}</ul></section>}
  </main>;
}
