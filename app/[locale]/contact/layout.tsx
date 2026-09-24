import type { Metadata } from 'next';
import { getSiteUrl } from '@/app/lib/productImages';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const siteUrl = getSiteUrl();
  const title = locale === 'ar' ? 'تواصل معنا | شوكو سيليا' : 'Contact Choco Celia';
  const description = locale === 'ar' ? 'تواصل مع فريق شوكو سيليا لطلب الشوكولاتة اليدوية أو الاستفسار عن التوصيل.' : 'Contact Choco Celia to order handcrafted chocolate or ask about delivery.';
  return {
    title,
    description,
    alternates: { canonical: `${siteUrl}/${locale}/contact`, languages: { en: `${siteUrl}/en/contact`, ar: `${siteUrl}/ar/contact`, 'x-default': `${siteUrl}/en/contact` } },
    openGraph: { title, description, url: `${siteUrl}/${locale}/contact`, type: 'website' },
  };
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
