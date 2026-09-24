import React from 'react';
import { getSiteUrl } from '@/app/lib/productImages';
import { serializeJsonLd } from '@/app/lib/jsonLd';

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
    nameAr?: string | null;
    descriptionAr?: string | null;
    image: string;
    images?: string[];
    price: number;
    isAvailable: boolean;
    category?: {
      name: string;
    };
  };
  reviews?: SchemaReview[];
  locale: string;
}

export function ProductSchema({ product, reviews = [], locale }: ProductSchemaProps) {
  const isAr = locale === 'ar';
  const siteUrl = getSiteUrl();
  const productUrl = `${siteUrl}/${locale}/menu/${product.id}`;
  const imageUrls = [product.image, ...(product.images || [])].map((image) =>
    image.startsWith('/') ? `${siteUrl}${image}` : image,
  ).filter(Boolean);

  const schema: {
    '@context': string;
    '@type': string;
    name: string;
    image: string[];
    description: string;
    sku: string;
    mpn: string;
    offers: Record<string, unknown>;
    aggregateRating?: Record<string, unknown>;
    review?: Record<string, unknown>[];
  } = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": isAr && product.nameAr ? product.nameAr : product.name,
    "image": imageUrls.length ? imageUrls : [`${siteUrl}/logo.png`],
    "description": (isAr && product.descriptionAr ? product.descriptionAr : product.description).slice(0, 5000),
    "sku": product.id,
    "mpn": product.id,
    "offers": {
      "@type": "Offer",
      "url": productUrl,
      "priceCurrency": "EGP",
      "price": product.price,
      "itemCondition": "https://schema.org/NewCondition",
      "availability": product.isAvailable ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": isAr ? "شوكو سيليا" : "Choco Celia",
        "url": siteUrl
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
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }}
    />
  );
}

