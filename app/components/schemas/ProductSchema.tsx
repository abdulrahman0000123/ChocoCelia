import React from 'react';

interface SchemaReview {
  id: string;
  rating: number;
  text: string;
  authorName: string;
  authorCity: string;
  createdAt: Date | string;
}

interface ProductSchemaProps {
  product: {
    id: string;
    name: string;
    description: string;
    image: string;
    price: number;
    category?: {
      name: string;
    };
  };
  reviews?: SchemaReview[];
  locale: string;
}

export function ProductSchema({ product, reviews = [], locale }: ProductSchemaProps) {
  const isAr = locale === 'ar';
  const productUrl = `https://choco-celia.com/${locale}/menu/${product.id}`;

  const schema: any = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.image || "https://choco-celia.com/logo.png",
    "description": product.description,
    "sku": product.id,
    "mpn": product.id,
    "offers": {
      "@type": "Offer",
      "url": productUrl,
      "priceCurrency": "EGP",
      "price": product.price,
      "itemCondition": "https://schema.org/NewCondition",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": isAr ? "شوكو سيليا" : "ChocoCelia",
        "url": "https://choco-celia.com"
      }
    }
  };

  if (reviews && reviews.length > 0) {
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    schema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": avgRating.toFixed(1),
      "reviewCount": reviews.length,
      "bestRating": "5",
      "worstRating": "1"
    };
    schema.review = reviews.map(r => ({
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": r.authorName
      },
      "datePublished": new Date(r.createdAt).toISOString().split('T')[0],
      "reviewBody": r.text,
      "reviewRating": {
        "@type": "Rating",
        "bestRating": "5",
        "ratingValue": r.rating.toString(),
        "worstRating": "1"
      }
    }));
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

