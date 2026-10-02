import { getSiteUrl } from '@/app/lib/productImages';
import React from 'react';
import { serializeJsonLd } from '@/app/lib/jsonLd';

interface OrganizationSchemaProps {
  locale: string;
  facebook?: string;
  instagram?: string;
}

export function OrganizationSchema({
  locale,
  facebook = 'https://www.facebook.com/profile.php?id=61582630209700',
  instagram = 'https://www.instagram.com/chococelia2025/',
}: OrganizationSchemaProps) {
  const isAr = locale === 'ar';

  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": isAr ? "شوكو سيليا" : "Choco Celia",
    "url": getSiteUrl(),
    "logo": `${(getSiteUrl()).replace(/\/$/, '')}/logo.png`,
    "sameAs": [
      facebook,
      instagram
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }}
    />
  );
}
export default OrganizationSchema;
