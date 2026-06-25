import React from 'react';
import { AboutClient } from '../../components/AboutClient';
import { getSettings } from '@/app/lib/products';

interface AboutPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;
  const settings = await getSettings();

  return <AboutClient settings={settings} locale={locale} />;
}
