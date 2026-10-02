/** @jest-environment node */
import { validateSeo, localSeo, isPublished, validSlug } from '../app/lib/seo-shared';
import { sealSecret, openSecret } from '../app/lib/secret-store';
describe('SEO publication and secret boundaries', () => {
  test('draft and future content cannot be published accidentally', () => {
    const now = new Date('2026-10-02T12:00:00Z');
    expect(isPublished({status: 'DRAFT', publishAt: null}, now)).toBe(false);
    expect(isPublished({status: 'PUBLISHED', publishAt: new Date('2026-10-03')}, now)).toBe(false);
    expect(isPublished({status: 'PUBLISHED', publishAt: null}, now)).toBe(true);
  });
  test('rejects injection into analytics scripts and unsafe share images', () => {
    expect(() => validateSeo({gaMeasurementId: "G-1');alert(1)//"})).toThrow();
    expect(() => validateSeo({ogImage: '//evil.example/image.png'})).toThrow();
    expect(validateSeo({gaMeasurementId: 'G-ABC123', indexable: false}).indexable).toBe(false);
    expect(() => validateSeo({indexable: 'false'})).toThrow();
  });
  test('local fallback cleans HTML and does not pretend to translate missing English', () => {
    const result = localSeo({titleAr: '<b>هدايا</b>', titleEn: '', bodyAr: '<p>شوكولاتة &amp; هدايا</p>', bodyEn: '', image: 'data:image/png;base64,abc'});
    expect(result.titleAr).toBe('هدايا'); expect(result.descriptionAr).toBe('شوكولاتة & هدايا'); expect(result.titleEn).toBe(''); expect(result.ogImage).toBe('');
  });
  test('Arabic slugs work and route separators are rejected', () => {
    expect(validSlug('بوكس-شوكولاتة')).toBe(true); expect(validSlug('../admin')).toBe(false); expect(validSlug('gift?preview=1')).toBe(false);
  });
  test('API credentials are authenticated ciphertext, unique per save and tamper resistant', () => {
    process.env.SEO_ENCRYPTION_KEY = 'test-encryption-secret-not-for-production-123';
    const value = 'test-api-value'; const a = sealSecret(value); const b = sealSecret(value);
    expect(a).not.toContain(value); expect(a).not.toEqual(b); expect(openSecret(a)).toBe(value);
    const parts = a.split('.'); const bytes = Buffer.from(parts[2], 'base64'); bytes[0] ^= 1; parts[2] = bytes.toString('base64');
    expect(() => openSecret(parts.join('.'))).toThrow(); delete process.env.SEO_ENCRYPTION_KEY;
  });
});
