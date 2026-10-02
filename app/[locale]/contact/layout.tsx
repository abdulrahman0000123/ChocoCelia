import { pageMetadata } from '@/app/lib/seo';
import type { Metadata } from 'next';
import { getSiteUrl } from '@/app/lib/productImages';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const siteUrl = getSiteUrl();
  const title = locale === 'ar' ? 'تواصل معنا | شوكو سيليا' : 'Contact Choco Celia';
  const description = locale === 'ar' ? 'تواصل مع فريق شوكو سيليا لطلب الشوكولاتة اليدوية أو الاستفسار عن التوصيل.' : 'Contact Choco Celia to order handcrafted chocolate or ask about delivery.';
  return pageMetadata({locale, path: '/contact', entityType: 'page', entityId: 'contact', title, description});
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
