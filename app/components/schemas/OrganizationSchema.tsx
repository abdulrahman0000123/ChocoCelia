import React from 'react';

interface OrganizationSchemaProps {
  locale: string;
  phone?: string;
  facebook?: string;
  instagram?: string;
}

export function OrganizationSchema({
  locale,
  phone = '201000000000',
  facebook = 'https://www.facebook.com/profile.php?id=61582630209700',
  instagram = 'https://www.instagram.com/chococelia2025/',
}: OrganizationSchemaProps) {
  const isAr = locale === 'ar';

  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": isAr ? "شوكو سيليا" : "ChocoCelia",
    "url": "https://choco-celia.com",
    "logo": "https://choco-celia.com/logo.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": `+${phone}`,
      "contactType": "customer service",
      "areaServed": "EG",
      "availableLanguage": ["Arabic", "English"]
    },
    "sameAs": [
      facebook,
      instagram
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
export default OrganizationSchema;
