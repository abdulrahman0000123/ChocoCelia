import { NextResponse } from 'next/server';
import { createSign } from 'node:crypto';
import { prisma } from '@/app/lib/db';
import { getSiteUrl } from '@/app/lib/productImages';
import { requireAdmin, readBody, apiError } from '@/app/lib/seo-admin';
import { sealSecret, openSecret } from '@/app/lib/secret-store';
import type { SeoValues } from '@/app/lib/seo-shared';
import { contentPath, publishedWhere } from '@/app/lib/seo-shared';
type Credentials = {client_email: string; private_key: string};
function parseCredentials(raw: string): Credentials {
  const data = JSON.parse(raw);
  if (typeof data.client_email !== 'string' || !/^[^\s@]+@[^\s@]+\.gserviceaccount\.com$/.test(data.client_email) || typeof data.private_key !== 'string' || !data.private_key.includes('BEGIN PRIVATE KEY')) throw new Error('Invalid Google credentials');
  return {client_email: data.client_email, private_key: data.private_key};
}
async function token(credentials: Credentials) {
  const now = Math.floor(Date.now() / 1000);
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const payload = `${encode({alg: 'RS256', typ: 'JWT'})}.${encode({iss: credentials.client_email, scope: 'https://www.googleapis.com/auth/analytics.readonly https://www.googleapis.com/auth/webmasters.readonly', aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600})}`;
  const signature = createSign('RSA-SHA256').update(payload).sign(credentials.private_key, 'base64url');
  const res = await fetch('https://oauth2.googleapis.com/token', {method: 'POST', signal: AbortSignal.timeout(10000), body: new URLSearchParams({grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${payload}.${signature}`})});
  if (!res.ok) throw new Error('Connection failed');
  const data = await res.json();
  if (!data.access_token) throw new Error('Connection failed');
  return data.access_token as string;
}
export async function POST(request: Request) {
  if (!await requireAdmin(request)) return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  try {
    const body = await readBody(request);
    if (body.action === 'syncKeywords') {
      const response = await GET();
      if (!response.ok) return response;
      const report = await response.json();
      const [products, pages] = await Promise.all([prisma.product.findMany({where: {published: true}, select: {id: true, slug: true}}), prisma.contentPage.findMany({where: publishedWhere()})]);
      const targets = new Map<string, {entityType: string; entityId: string; locale: string}>();
      for (const locale of ['ar', 'en']) {
        for (const product of products) targets.set(`/${locale}/menu/${product.slug || product.id}`, {entityType: 'product', entityId: product.id, locale});
        for (const page of pages) targets.set(`/${locale}${contentPath(page)}`, {entityType: 'content', entityId: page.id, locale});
        for (const id of ['home', 'menu', 'about', 'contact', 'journal', 'collections', 'occasions', 'campaigns', 'categories', 'pages']) targets.set(`/${locale}${id === 'home' ? '' : '/'+id}`, {entityType: 'page', entityId: id, locale});
      }
      let synced = 0;
      for (const row of report.queries) {
        const url = new URL(row.url);
        if (url.origin !== new URL(getSiteUrl()).origin) continue;
        const target = targets.get(decodeURIComponent(url.pathname).replace(/\/$/, ''));
        if (!target || !row.term || row.term.length > 200) continue;
        const unique = {term: row.term, ...target};
        const metrics = {clicks: row.clicks, impressions: row.impressions, position: row.position, source: 'Search Console'};
        await prisma.targetKeyword.upsert({where: {term_locale_entityType_entityId: unique}, create: {...unique, ...metrics}, update: metrics});
        synced++;
      }
      return NextResponse.json({ok: true, synced, startDate: report.startDate, endDate: report.endDate});
    }
    if (body.remove === true) {await prisma.aiSettings.updateMany({where: {id: 1}, data: {encryptedGoogle: null}}); return NextResponse.json({ok: true});}
    if (typeof body.credentials !== 'string' || body.credentials.length > 15000) throw new Error('Invalid Google credentials');
    const encryptedGoogle = sealSecret(JSON.stringify(parseCredentials(body.credentials)));
    await prisma.aiSettings.upsert({where: {id: 1}, create: {id: 1, encryptedGoogle}, update: {encryptedGoogle}});
    return NextResponse.json({ok: true});
  } catch(error) {return apiError(error);}
}
export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  try {
    const config = await prisma.aiSettings.findUnique({where: {id: 1}});
    if (!config?.encryptedGoogle) return NextResponse.json({error: 'Connect a Google service account first.'}, {status: 409});
    const values = (await prisma.seoSettings.findUnique({where: {id: 1}}))?.values as SeoValues || {};
    const accessToken = await token(parseCredentials(openSecret(config.encryptedGoogle)));
    const end = new Date(Date.now() - 3 * 86400000), start = new Date(end.getTime() - 27 * 86400000);
    const startDate = start.toISOString().slice(0, 10), endDate = end.toISOString().slice(0, 10);
    const headers = {Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json'};
    const requestGoogle = async (url: string, body: unknown) => {const res = await fetch(url, {method: 'POST', headers, signal: AbortSignal.timeout(15000), body: JSON.stringify(body)}); if (!res.ok) return null; return res.json();};
    const [ga, search] = await Promise.all([
      values.gaPropertyId && /^\d+$/.test(values.gaPropertyId) ? requestGoogle(`https://analyticsdata.googleapis.com/v1beta/properties/${values.gaPropertyId}:runReport`, {dateRanges: [{startDate, endDate}], dimensions: [{name: 'pagePath'}, {name: 'sessionDefaultChannelGroup'}], metrics: [{name: 'screenPageViews'}, {name: 'sessions'}, {name: 'keyEvents'}, {name: 'engagementRate'}], limit: 100}) : null,
      requestGoogle(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(values.searchConsoleSite || `${getSiteUrl()}/`)}/searchAnalytics/query`, {startDate, endDate, dimensions: ['page', 'query'], rowLimit: 1000}),
    ]);
    const traffic = (ga?.rows || []).map((r: {dimensionValues: {value: string}[]; metricValues: {value: string}[]}) => ({path: r.dimensionValues[0].value, channel: r.dimensionValues[1].value, views: Number(r.metricValues[0].value), sessions: Number(r.metricValues[1].value), conversions: Number(r.metricValues[2].value), engagement: Number(r.metricValues[3].value)}));
    const queries = (search?.rows || []).map((r: {keys: string[]; clicks: number; impressions: number; ctr: number; position: number}) => ({url: r.keys[0], term: r.keys[1], clicks: r.clicks, impressions: r.impressions, ctr: r.ctr, position: r.position}));
    return NextResponse.json({startDate, endDate, traffic, queries, notices: [!ga && 'GA4 unavailable: check property ID and access.', !search && 'Search Console unavailable: check site property and access.'].filter(Boolean)});
  } catch {return NextResponse.json({error: 'Google connection failed. Check the saved account and property access.'}, {status: 502});}
}
