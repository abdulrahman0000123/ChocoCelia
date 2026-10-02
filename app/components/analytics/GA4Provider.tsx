'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';

function GA4Tracker({ measurementId }: { measurementId: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
      (window as any).gtag('event', 'page_view', {
        page_location: window.location.origin + url,
        page_path: url,
      });
    }
  }, [pathname, searchParams, measurementId]);

  return null;
}

export function GA4Provider({measurementId: configuredId}: {measurementId?: string} = {}) {
  const measurementId = configuredId || process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const [ready, setReady] = useState(false);

  if (!measurementId) return null;

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
      />
      <Script
        id="google-analytics"
        onReady={() => setReady(true)}
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${measurementId}', {
              send_page_view: false,
            });
          `,
        }}
      />
      {ready && <Suspense fallback={null}>
        <GA4Tracker measurementId={measurementId} />
      </Suspense>}
    </>
  );
}
