'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

const MIN_VISIBLE_MS = 2400;
const MAX_WAIT_MS = 3500;
const EXIT_ANIMATION_MS = 500;

export default function ChocolatePreloader() {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const locale = useLocale();
  const t = useTranslations();

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const minVisibleMs = reducedMotion ? 120 : MIN_VISIBLE_MS;
    const exitAnimationMs = reducedMotion ? 1 : EXIT_ANIMATION_MS;
    const startedAt = window.performance.now();
    let hasFinished = false;
    let exitTimer = 0;
    let hideTimer = 0;

    const finishLoading = () => {
      if (hasFinished) return;
      hasFinished = true;
      window.clearTimeout(fallbackTimer);

      const remainingVisibleMs = Math.max(0, minVisibleMs - (window.performance.now() - startedAt));
      exitTimer = window.setTimeout(() => {
        setIsExiting(true);
        hideTimer = window.setTimeout(() => setIsVisible(false), exitAnimationMs);
      }, remainingVisibleMs);
    };

    const fallbackTimer = window.setTimeout(finishLoading, MAX_WAIT_MS);

    if (document.readyState === 'complete') {
      finishLoading();
    } else {
      window.addEventListener('load', finishLoading, { once: true });
    }

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(hideTimer);
      window.clearTimeout(fallbackTimer);
      window.removeEventListener('load', finishLoading);
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
        <div className="brand-preloader-emblem" aria-hidden="true">
          <svg className="brand-preloader-orbit" viewBox="0 0 144 144" fill="none">
            <circle className="brand-preloader-orbit-track" cx="72" cy="72" r="67" />
            <circle className="brand-preloader-orbit-arc" cx="72" cy="72" r="67" pathLength="100" />
            <circle className="brand-preloader-orbit-inner" cx="72" cy="72" r="58" pathLength="100" />
          </svg>
          <span className="brand-preloader-mark brand-mark" />
        </div>
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
