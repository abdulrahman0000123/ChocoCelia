'use client';

import React from 'react';
import { GA4Provider } from './GA4Provider';
import { ClarityProvider } from './ClarityProvider';
import { MetaPixelProvider } from './MetaPixelProvider';
import { TikTokPixelProvider } from './TikTokPixelProvider';

export function AnalyticsProvider({measurementId}: {measurementId?: string} = {}) {
  return (
    <>
      <GA4Provider measurementId={measurementId} />
      <ClarityProvider />
      <MetaPixelProvider />
      <TikTokPixelProvider />
    </>
  );
}
export default AnalyticsProvider;
