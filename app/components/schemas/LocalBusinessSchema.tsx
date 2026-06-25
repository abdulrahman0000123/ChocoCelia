import React from 'react';

export function LocalBusinessSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "ChocoCelia",
    "image": "https://choco-celia.com/logo.png",
    "@id": "https://choco-celia.com/#organization",
    "url": "https://choco-celia.com",
    "telephone": "+201000000000",
    "priceRange": "$$",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Beni Suef Governorate",
      "addressLocality": "Beni Suef",
      "addressRegion": "Beni Suef",
      "addressCountry": "EG"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "29.076",
      "longitude": "31.097"
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      ],
      "opens": "09:00",
      "closes": "23:00"
    },
    "sameAs": [
      "https://www.facebook.com/profile.php?id=61582630209700",
      "https://www.instagram.com/chococelia2025/"
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
