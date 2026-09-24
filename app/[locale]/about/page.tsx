import React from 'react';
import { AboutClient } from '../../components/AboutClient';
import { getSettings } from '@/app/lib/products';
import type { Metadata } from 'next';
import { getSiteUrl } from '@/app/lib/productImages';

interface AboutPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: AboutPageProps): Promise<Metadata> {
  const { locale } = await params;
  const siteUrl = getSiteUrl();
  const title = locale === 'ar' ? 'قصتنا | شوكو سيليا' : 'Our Story | Choco Celia';
  const description = locale === 'ar'
    ? 'تعرف على شوكو سيليا وشغفنا بصناعة الشوكولاتة اليدوية والهدايا المميزة.'
    : 'Learn about Choco Celia and our passion for handcrafted chocolates and thoughtful gifts.';
  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/${locale}/about`,
      languages: { en: `${siteUrl}/en/about`, ar: `${siteUrl}/ar/about`, 'x-default': `${siteUrl}/en/about` },
    },
    openGraph: { title, description, url: `${siteUrl}/${locale}/about`, type: 'website' },
  };
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;
  const settings = await getSettings();

  return <AboutClient settings={settings} locale={locale} />;
}
