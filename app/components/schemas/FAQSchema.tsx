import React from 'react';

interface FAQItem {
  id: string;
  questionAr: string;
  questionEn: string;
  answerAr: string;
  answerEn: string;
}

interface FAQSchemaProps {
  items: FAQItem[];
  locale: string;
}

export function FAQSchema({ items, locale }: FAQSchemaProps) {
  const isAr = locale === 'ar';

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": items.map((item) => ({
      "@type": "Question",
      "name": isAr ? item.questionAr : item.questionEn,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": isAr ? item.answerAr : item.answerEn,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
