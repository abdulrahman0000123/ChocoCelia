/* Uses a disposable PostgreSQL schema; never changes existing application rows. */
const { PrismaClient } = require('@prisma/client');
const { spawn, execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
require('@next/env').loadEnvConfig(process.cwd());
const schema = `codex_seo_test_${Date.now()}`;
const schemaUrl = new URL(process.env.DATABASE_URL);
// Startup search_path requires a direct connection; Neon poolers reject it.
schemaUrl.hostname = schemaUrl.hostname.replace(/-pooler(?=\.)/, '');
schemaUrl.searchParams.set('schema', schema);
schemaUrl.searchParams.set('options', `${schemaUrl.searchParams.get('options') || ''} -c search_path=${schema}`.trim());
const root = new PrismaClient();
const db = new PrismaClient({datasources: {db: {url: schemaUrl.href}}});
const port = 3197, base = `http://localhost:${port}`;
let server, browser, cookie, tests = 0;
const artifacts = path.resolve('node_modules/.seo-test-artifacts');
fs.mkdirSync(artifacts, {recursive: true});
function check(condition, label) {assert.ok(condition, label); tests++; console.log(`PASS ${label}`);}
async function call(url, body, anonymous = false, method = 'POST') {
  return fetch(`${base}${url}`, {method: body === undefined ? 'GET' : method, redirect: 'manual', headers: {...(!anonymous && cookie ? {cookie} : {}), ...(body === undefined ? {} : {'Content-Type': 'application/json', origin: base, 'x-real-ip': '127.0.0.97'})}, ...(body === undefined ? {} : {body: JSON.stringify(body)})});
}
async function main() {
  await root.$executeRawUnsafe(`CREATE SCHEMA "${schema}"`);
  const searchPath = await db.$queryRawUnsafe('SHOW search_path');
  check(searchPath[0].search_path === schema, 'raw queries use the disposable schema');
  const originalSchema = execFileSync('git', ['show', 'HEAD:prisma/schema.prisma'], {encoding: 'utf8'});
  const baseline = path.join(artifacts, 'baseline.prisma'); fs.writeFileSync(baseline, originalSchema);
  const sql = execFileSync(process.execPath, ['node_modules/prisma/build/index.js', 'migrate', 'diff', '--from-empty', '--to-schema-datamodel', baseline, '--script'], {encoding: 'utf8'});
  const provision = fs.readFileSync('scripts/ensure-seo.sql', 'utf8').replace(/^BEGIN;|^COMMIT;/gm, '');
  await db.$transaction(async tx => {
    await tx.$executeRawUnsafe(`SET LOCAL search_path TO "${schema}"`);
    for (const statement of `${sql}\n${provision}\n${provision}`.split(';').map(s => s.trim()).filter(s => s && !/^--[^\n]*$/.test(s))) await tx.$executeRawUnsafe(statement);
  }, {timeout: 60000});
  check((await db.$queryRawUnsafe(`SELECT table_name FROM information_schema.tables WHERE table_schema = '${schema}' AND table_name = 'SeoRecord'`)).length === 1, 'additive migration can run twice in isolated schema');
  await db.user.create({data: {username: 'seo-test-admin', password: await bcrypt.hash('seo-test-password-123', 10)}});
  const category = await db.category.create({data: {name: 'Test chocolate', nameAr: 'شوكولاتة اختبار'}});
  await db.siteSettings.create({data: {deliveryFeeBeniSuef: 20, deliveryFeeEastNile: 40}});
  if (process.argv.includes('--build')) {
    console.log('Building production bundle against isolated schema...');
    try {const output = execFileSync(process.execPath, ['node_modules/next/dist/bin/next', 'build'], {env: {...process.env, DATABASE_URL: schemaUrl.href, NEXT_PUBLIC_SITE_URL: base, NEXT_TELEMETRY_DISABLED: '1'}, encoding: 'utf8', timeout: 240000}); fs.writeFileSync(path.join(artifacts, 'build.log'), output); check(true, 'production build against isolated database');} catch (e) {fs.writeFileSync(path.join(artifacts, 'build.log'), String(e.stdout || '') + String(e.stderr || '')); throw new Error('Production build failed; inspect node_modules/.seo-test-artifacts/build.log');}
  }
  const log = fs.openSync(path.join(artifacts, 'server.log'), 'w');
  server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'dev', '--port', String(port)], {env: {...process.env, DATABASE_URL: schemaUrl.href, JWT_SECRET: 'seo-test-session-secret-12345678901234567890', SEO_ENCRYPTION_KEY: 'seo-test-encryption-secret-12345678901234567890', NEXT_PUBLIC_SITE_URL: base, NEXT_PUBLIC_GA_MEASUREMENT_ID: '', NEXT_TELEMETRY_DISABLED: '1'}, windowsHide: true, stdio: ['ignore', log, log]});
  for (let i = 0; i < 90; i++) {try {if ((await call('/api/auth/session', undefined, true)).status === 401) break;} catch {} await new Promise(r => setTimeout(r, 1000)); if (i === 89) throw new Error('Test server did not start');}
  check((await call('/api/admin/seo', undefined, true)).status === 401, 'SEO settings require authentication');
  const login = await call('/api/auth/login', {username: 'seo-test-admin', password: 'seo-test-password-123'}, true);
  check(login.status === 200, 'isolated admin login works'); cookie = login.headers.get('set-cookie').split(';')[0];
  const productResponse = await call('/api/products', {name: 'Gift box', nameAr: 'بوكس هدايا', description: 'Chocolate gift box', descriptionAr: 'بوكس شوكولاتة للهدايا', price: 100, image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRuoAAAAASUVORK5CYII=', images: [], categoryId: category.id, slug: 'gift-box', published: true, isAvailable: true, attributes: [{key: 'birthday', type: 'occasion', valueAr: 'عيد ميلاد', valueEn: 'Birthday', aliases: 'birthday present'}]});
  check(productResponse.status === 201, 'product create persists publication slug and local SEO'); const product = await productResponse.json();
  const initialAliasResults = await (await call('/api/products/search?q=birthday%20present', undefined, true)).json(); check(initialAliasResults.some(p => p.id === product.id), 'search matches structured attribute aliases');
  let res = await call('/api/admin/seo', {action: 'settings', values: {titleAr: 'متجر الشوكولاتة', titleEn: 'Chocolate shop', googleVerification: 'test-google-token', ogImage: '/logo.png'}});
  check(res.ok, 'global SEO saves');
  const homeHtml = await (await call('/en', undefined, true)).text(); check(homeHtml.includes('<title>Chocolate shop</title>'), 'global defaults reach the homepage');
  res = await call('/api/admin/seo', {action: 'record', entityType: 'product', entityId: product.id, values: {titleAr: 'عنوان مخصص', titleEn: 'Custom gift title', descriptionAr: 'وصف مخصص', descriptionEn: 'Custom description', ogImage: '/brand/icon-192.png'}}); check(res.ok, 'product SEO override saves');
  let html = await (await call('/en/menu/gift-box', undefined, true)).text();
  check(html.includes('Custom gift title') && html.includes('Custom description') && html.includes('test-google-token'), 'public HTML receives stored metadata and verification');
  fs.writeFileSync(path.join(artifacts, 'product.html'), html);
  check(html.includes(`${base}/en/menu/gift-box`), 'canonical URL is present');
  check(/hreflang="ar"/i.test(html), 'Arabic hreflang is present');
  check(html.includes('application/ld+json'), 'Product schema is present');
  const productRevision = await (await call(`/api/admin/seo?entityType=product&entityId=${product.id}`)).json(); check(productRevision.history.length === 1, 'previous product SEO version is retained');
  res = await call('/api/products/'+product.id, {slug: 'birthday-gift'}, false, 'PUT'); check(res.ok, 'product slug can be updated');
  const redirected = await call('/en/menu/gift-box', undefined, true); check(redirected.status === 308 || redirected.headers.get('location') === '/en/menu/birthday-gift' || (await redirected.text()).includes('NEXT_REDIRECT'), 'old product slug redirects permanently');
  const draftData = {kind: 'ARTICLE', slug: 'chocolate-guide', titleAr: 'دليل الشوكولاتة', titleEn: 'Chocolate guide', summaryAr: 'دليل هدايا', summaryEn: 'Gift guide', bodyAr: 'فقرة أولى\n\nفقرة ثانية', bodyEn: 'First paragraph\n\nSecond paragraph', status: 'DRAFT', image: '/logo.png', imageAltAr: 'بوكس هدايا', imageAltEn: 'Gift box', productIds: [product.id], attributeKeys: []};
  res = await call('/api/admin/content', draftData); check(res.ok, 'draft article saves'); let page = await res.json();
  check((await call('/en/journal/chocolate-guide', undefined, true)).status === 404, 'anonymous draft returns 404');
  html = await (await call('/en/journal/chocolate-guide?preview=1')).text(); check(html.includes('noindex') && html.includes('Chocolate guide'), 'authenticated preview renders server noindex');
  check((await call('/en/journal/chocolate-guide?preview=1', undefined, true)).status === 404, 'preview URL does not grant anonymous access');
  res = await call('/api/admin/content', {...draftData, id: page.id, status: 'PUBLISHED', publishAt: new Date(Date.now()+86400000).toISOString()}); check(res.ok, 'scheduled article saves');
  check((await call('/en/journal/chocolate-guide', undefined, true)).status === 404, 'future scheduled content stays private');
  res = await call('/api/admin/content', {...draftData, id: page.id, status: 'PUBLISHED', publishAt: null}); check(res.ok, 'publish article');
  html = await (await call('/ar/journal/chocolate-guide', undefined, true)).text(); check(html.includes('دليل الشوكولاتة') && html.includes('Article') && html.includes('Related') === false, 'published Arabic article and schema render');
  let sitemap = await (await call('/sitemap.xml', undefined, true)).text(); check(sitemap.includes('/en/menu/birthday-gift') && sitemap.includes('/ar/journal/chocolate-guide'), 'sitemap lists current canonical published URLs');
  res = await call('/api/products/'+product.id, {isAvailable: false}, false, 'PUT'); check(res.ok, 'product can go out of stock without unpublishing');
  sitemap = await (await call('/sitemap.xml', undefined, true)).text(); check(sitemap.includes('/en/menu/birthday-gift'), 'out-of-stock published product remains in sitemap');
  await call('/api/admin/seo', {action: 'record', entityType: 'product', entityId: product.id, values: {indexable: false}});
  sitemap = await (await call('/sitemap.xml', undefined, true)).text(); check(!sitemap.includes('/en/menu/birthday-gift'), 'noindex product is excluded from sitemap');
  const dummyKey = 'sk-test-'+ 'x'.repeat(36);
  res = await call('/api/admin/seo', {action: 'ai', apiKey: dummyKey, model: 'gpt-4o-mini', enabled: false}); check(res.ok, 'admin can save optional encrypted AI key');
  const ai = await db.aiSettings.findUnique({where: {id: 1}}); check(ai.encryptedKey && !ai.encryptedKey.includes(dummyKey), 'database does not store plaintext API key');
  const configText = await (await call('/api/admin/seo')).text(); const publicSettings = await (await call('/api/settings', undefined, true)).text(); check(!configText.includes(dummyKey) && !configText.includes(ai.encryptedKey) && !publicSettings.includes(dummyKey), 'admin and public reads never return API secrets');
  const geminiKey = 'AIza-test-'+'g'.repeat(32);
  res = await call('/api/admin/seo',{action:'ai',provider:'gemini',apiKey:geminiKey,model:'gemini-custom-text-model',enabled:false}); check(res.ok,'Gemini key and arbitrary model save');
  const providers = await db.aiSettings.findUnique({where:{id:1}});
  check(providers.provider==='gemini' && providers.encryptedKey===ai.encryptedKey && providers.providerKeys.gemini && !JSON.stringify(providers.providerKeys).includes(geminiKey),'provider keys are encrypted and OpenAI key is preserved');
  const providerConfigText = await (await call('/api/admin/seo')).text();
  check(!providerConfigText.includes(geminiKey) && !providerConfigText.includes(providers.providerKeys.gemini) && JSON.parse(providerConfigText).ai.configuredProviders.includes('gemini'),'provider status does not disclose keys');
  res = await call('/api/admin/seo',{action:'ai',provider:'openrouter',model:'vendor/new-model:free',enabled:true}); check(res.status===400,'cannot enable a different provider with another provider key');
  res = await call('/api/admin/seo',{action:'ai',provider:'gemini',model:'gemini-custom-text-model',enabled:false,clearKey:true}); check(res.ok && (await db.aiSettings.findUnique({where:{id:1}})).encryptedKey===ai.encryptedKey,'remove Gemini key preserves OpenAI');
  res = await call('/api/admin/seo/generate', {titleAr: 'هدايا', titleEn: 'Gifts', bodyAr: 'شوكولاتة', bodyEn: 'Chocolate', useAi: true}); const generated = await res.json(); check(res.ok && generated.source === 'local', 'AI-disabled generation falls back locally without paid call');
  check((await call('/api/admin/seo/analytics')).status === 409, 'unconfigured Google connection reports setup requirement');
  res = await call('/api/settings', {heroTitle: 'Persistent hero'}); check(res.ok && (await (await call('/api/settings', undefined, true)).json()).heroTitle === 'Persistent hero', 'shared settings persist and reach public reader');
  const csrf = await fetch(`${base}/api/admin/seo`, {method:'POST', headers:{cookie, origin:'https://untrusted.example','Content-Type':'application/json'},body:JSON.stringify({action:'settings',values:{}})}); check(csrf.status === 401, 'cross-origin settings writes are rejected');
  const short = await (await call('/api/admin/seo', {action:'share',entityType:'content',entityId:page.id,locale:'en'})).json();
  const shareResponse = await call(short.path, undefined, true); check(shareResponse.status === 307 && shareResponse.headers.get('location') === `${base}/en/journal/chocolate-guide`, 'short public share link redirects to canonical content');
  const aliasResults = await (await call('/api/products/search?q=birthday%20present', undefined, true)).json(); check(Array.isArray(aliasResults), 'attribute alias search works');
  await call('/api/products/'+product.id, {published:false}, false, 'PUT');
  check((await call('/en/menu/birthday-gift', undefined, true)).status === 404, 'unpublished product is private');
  const draftProductHtml = await (await call('/en/menu/birthday-gift?preview=1')).text(); check(draftProductHtml.includes('noindex') && draftProductHtml.includes('Private preview'), 'admin product preview renders noindex');
  await call('/api/products/'+product.id, {published:true}, false, 'PUT');
  const {chromium} = require('playwright');
  browser = await chromium.launch({channel: 'msedge', headless: true});
  const context = await browser.newContext({viewport: {width: 1440, height: 1000}});
  await context.addCookies([{name:'session', value:cookie.slice('session='.length), domain:'localhost', path:'/'}]);
  const ui = await context.newPage();
  await ui.goto(`${base}/admin/dashboard/seo`); await ui.getByRole('heading', {name:'SEO & visibility / الظهور والبحث'}).waitFor(); await ui.getByText('Enable AI suggestions').waitFor();
  await ui.getByLabel('AI provider / مزوّد الذكاء الاصطناعي').selectOption('gemini');
  await ui.getByLabel('AI model',{exact:true}).fill('gemini-browser-model');
  await ui.getByLabel('AI API key',{exact:true}).fill(geminiKey);
  await ui.getByRole('button',{name:'Save AI settings',exact:true}).click();
  await ui.getByRole('status').filter({hasText:'Saved / تم الحفظ'}).waitFor();
  check((await db.aiSettings.findUnique({where:{id:1}})).model==='gemini-browser-model','browser saves selected Gemini provider and custom model');
  await ui.screenshot({path:path.join(artifacts,'seo-desktop.png'),fullPage:true}); check(await ui.getByLabel('AI API key', {exact:true}).count() === 1, 'admin key field appears in browser');
  check(await ui.getByLabel('AI API key', {exact:true}).inputValue() === '', 'saved key remains masked and never prefilled');
  await ui.locator('section').filter({has:ui.getByRole('heading',{name:'AI generation / توليد اختياري',exact:true})}).screenshot({path:path.join(artifacts,'ai-provider.png')});
  await ui.setViewportSize({width:390,height:844}); await ui.waitForFunction(() => document.querySelector('aside').getBoundingClientRect().right <= 1); await ui.screenshot({path:path.join(artifacts,'seo-mobile.png'),fullPage:true});
  check(await ui.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'SEO settings fit mobile viewport');
  await ui.goto(`${base}/admin/dashboard/content`); await ui.getByRole('heading', {name:'Content & collections / المحتوى والمجموعات'}).waitFor(); await ui.screenshot({path:path.join(artifacts,'content-mobile.png'),fullPage:true}); check(await ui.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'content management fits mobile viewport');
  await ui.getByRole('button', {name:'New page / صفحة جديدة'}).click();
  await ui.getByLabel('URL name / اسم الرابط').fill('browser-guide');
  await ui.getByLabel('عنوان عربي', {exact:true}).fill('دليل من المتصفح');
  await ui.getByLabel('English title', {exact:true}).fill('Browser guide');
  await ui.getByRole('button', {name:'Local suggestions', exact:true}).click();
  await ui.getByText('Suggestions ready. Review and save. / راجع الاقتراحات ثم احفظ.').waitFor();
  await ui.getByRole('button', {name:'Save page',exact:true}).click();
  await ui.getByText('Saved / تم الحفظ', {exact:true}).waitFor();
  check((await db.contentPage.count({where:{slug:'browser-guide',status:'DRAFT'}})) === 1, 'content editor creates draft with local SEO from browser');
  await ui.screenshot({path:path.join(artifacts,'content-editor-mobile.png'),fullPage:true});
  await ui.goto(`${base}/ar/journal/chocolate-guide`); await ui.getByRole('heading', {name:'دليل الشوكولاتة',exact:true}).waitFor(); await ui.locator('.brand-preloader').waitFor({state:'hidden'}); await ui.screenshot({path:path.join(artifacts,'article-mobile.png'),fullPage:true}); check(await ui.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'Arabic article fits mobile viewport');
  console.log(`SEO integration: ${tests} checks passed. Screenshots: node_modules/.seo-test-artifacts`);
}
main().catch(error => {console.error(`SEO integration failed: ${error.message.replace(/postgres(?:ql)?:\/\/\S+/g,'[redacted connection]')}`); process.exitCode = 1;}).finally(async () => {
  if (browser) await browser.close();
  if (server) {server.kill(); await new Promise(r=>setTimeout(r,1000));}
  await db.$disconnect();
  if (/^codex_seo_test_\d+$/.test(schema)) await root.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
  await root.$disconnect();
});
