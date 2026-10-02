import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
function key() {
  const secret = process.env.SEO_ENCRYPTION_KEY || process.env.JWT_SECRET || process.env.DATABASE_URL;
  if (!secret || secret.length < 32) throw new Error('Server encryption is not configured');
  return createHash('sha256').update(`choco-celia:seo-secret:v1:${secret}`).digest();
}
export function sealSecret(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key(), iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  return [iv, cipher.getAuthTag(), encrypted].map(x => x.toString('base64')).join('.');
}
export function openSecret(value: string) {
  const [iv, tag, encrypted] = value.split('.').map(x => Buffer.from(x, 'base64'));
  const cipher = createDecipheriv('aes-256-gcm', key(), iv);
  cipher.setAuthTag(tag);
  return Buffer.concat([cipher.update(encrypted), cipher.final()]).toString('utf8');
}
