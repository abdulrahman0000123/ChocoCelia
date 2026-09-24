'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

const STORAGE_KEY = 'choco-celia-brand-intro-shown';

export default function ChocolatePreloader() {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const locale = useLocale();
  const t = useTranslations();

  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(STORAGE_KEY)) {
        return;
      }

      window.sessionStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // Keep the intro available when browser storage is disabled.
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const showTimer = window.setTimeout(() => setIsVisible(true), 0);
    const exitTimer = window.setTimeout(() => setIsExiting(true), reducedMotion ? 120 : 620);
    const hideTimer = window.setTimeout(() => setIsVisible(false), reducedMotion ? 300 : 880);

    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(exitTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  if (!isVisible) return null;

  const isArabic = locale === 'ar';

  return (
    <div
      className={`brand-preloader ${isExiting ? 'brand-preloader-exit' : 'brand-preloader-enter'}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="brand-preloader-glow brand-preloader-glow-one" aria-hidden="true" />
      <div className="brand-preloader-glow brand-preloader-glow-two" aria-hidden="true" />

      <div className="brand-preloader-content">
        <span className="brand-preloader-mark brand-mark" aria-hidden="true" />
        <p className="brand-preloader-name brand-wordmark">Choco Celia</p>
        <p className="brand-preloader-caption">
          {isArabic ? 'شوكولاتة مصنوعة يدويًا' : 'HANDMADE CHOCOLATE'}
        </p>

        <div className="brand-preloader-loader" aria-hidden="true">
          <span />
        </div>
        <p className="brand-preloader-message">
          <span className="sr-only">{t('loading')}</span>
          <span aria-hidden="true">
            {isArabic ? 'جرعتك اليومية من السعادة' : 'Your Daily Dose of Happiness'}
          </span>
        </p>
      </div>
    </div>
  );
}
