export interface SeoValues {
  titleAr?: string; titleEn?: string; descriptionAr?: string; descriptionEn?: string;
  ogTitleAr?: string; ogTitleEn?: string; ogDescriptionAr?: string; ogDescriptionEn?: string;
  ogImage?: string; indexable?: boolean; followable?: boolean;
  keywordsAr?: string; keywordsEn?: string; source?: string;
  googleVerification?: string; bingVerification?: string; gaPropertyId?: string; gaMeasurementId?: string; searchConsoleSite?: string;
}
export const seoTextFields = ['titleAr', 'titleEn', 'descriptionAr', 'descriptionEn', 'ogTitleAr', 'ogTitleEn', 'ogDescriptionAr', 'ogDescriptionEn', 'ogImage', 'keywordsAr', 'keywordsEn', 'source', 'googleVerification', 'bingVerification', 'gaPropertyId', 'gaMeasurementId', 'searchConsoleSite'] as const;
export function cleanText(value: string) {
  return value.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
}
export function validateSeo(input: unknown): SeoValues {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Invalid SEO fields');
  const data = input as Record<string, unknown>;
  const result: SeoValues = {};
  for (const key of seoTextFields) {
    if (data[key] === undefined) continue;
    if (typeof data[key] !== 'string' || data[key].length > (key.startsWith('description') || key.startsWith('ogDescription') ? 1000 : 500)) throw new Error(`Invalid ${key}`);
    result[key] = data[key].trim();
  }
  for (const key of ['indexable', 'followable'] as const) {
    if (data[key] !== undefined) {
      if (typeof data[key] !== 'boolean') throw new Error(`Invalid ${key}`);
      result[key] = data[key];
    }
  }
  if (result.ogImage && !/^https:\/\//.test(result.ogImage) && !/^\/(?!\/)/.test(result.ogImage)) throw new Error('Image must be an HTTPS URL or a local path');
  if (result.gaMeasurementId && !/^G-[A-Z0-9]+$/.test(result.gaMeasurementId)) throw new Error('Invalid GA measurement ID');
  if (result.gaPropertyId && !/^\d+$/.test(result.gaPropertyId)) throw new Error('Invalid GA property ID');
  if (result.searchConsoleSite && !/^https:\/\/[^\s]+\/$/.test(result.searchConsoleSite) && !/^sc-domain:[a-zA-Z0-9.-]+$/.test(result.searchConsoleSite)) throw new Error('Invalid Search Console property');
  return result;
}
export function localSeo(input: {titleAr: string; titleEn: string; bodyAr: string; bodyEn: string; image?: string}): SeoValues {
  return {titleAr: cleanText(input.titleAr).slice(0, 70), titleEn: cleanText(input.titleEn).slice(0, 70), descriptionAr: cleanText(input.bodyAr || input.titleAr).slice(0, 160), descriptionEn: cleanText(input.bodyEn || input.titleEn).slice(0, 160), ogImage: input.image && !input.image.startsWith('data:') ? input.image : '', source: 'local'};
}
export function seoAudit(values: SeoValues) {
  const issues: string[] = [];
  for (const lang of ['Ar', 'En'] as const) {
    const title = values[`title${lang}`] || '';
    const description = values[`description${lang}`] || '';
    if (!title) issues.push(`Missing title (${lang})`);
    else if (title.length > 70) issues.push(`Long title (${lang})`);
    if (!description) issues.push(`Missing description (${lang})`);
    else if (description.length > 170) issues.push(`Long description (${lang})`);
  }
  if (!values.ogImage) issues.push('Missing share image');
  return {score: Math.max(0, 100 - issues.length * 20), issues};
}
export const contentSections: Record<string, string> = {ARTICLE: 'journal', COLLECTION: 'collections', OCCASION: 'occasions', CAMPAIGN: 'campaigns', CATEGORY: 'categories', PAGE: 'pages'};
export function contentPath(page: {kind: string; slug: string}) { return `/${contentSections[page.kind] || 'pages'}/${page.slug}`; }
export function validSlug(value: string) { return /^[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*$/u.test(value) && value.length <= 140; }
export function publishedWhere(now = new Date()) { return {status: 'PUBLISHED', OR: [{publishAt: null}, {publishAt: {lte: now}}]}; }
export function isPublished(page: {status: string; publishAt: Date | null}, now = new Date()) { return page.status === 'PUBLISHED' && (!page.publishAt || page.publishAt <= now); }
