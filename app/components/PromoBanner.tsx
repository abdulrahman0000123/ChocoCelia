'use client';

import React, { useState, useEffect } from 'react';
import { X, Megaphone } from 'lucide-react';
import { Link } from '@/i18n/routing';

interface PromoBannerProps {
  activeBanner: {
    id: string;
    textAr: string;
    textEn: string;
    ctaAr?: string | null;
    ctaEn?: string | null;
    link?: string | null;
  } | null;
  locale: string;
}

export function PromoBanner({ activeBanner, locale }: PromoBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const isAr = locale === 'ar';

  useEffect(() => {
    if (activeBanner) {
      setIsVisible(true);
    }
  }, [activeBanner]);

  useEffect(() => {
    if (isVisible) {
      document.documentElement.style.setProperty('--promo-banner-height', '40px');
    } else {
      document.documentElement.style.setProperty('--promo-banner-height', '0px');
    }
    return () => {
      document.documentElement.style.setProperty('--promo-banner-height', '0px');
    };
  }, [isVisible]);

  if (!activeBanner || !isVisible) return null;

  const text = isAr ? activeBanner.textAr : activeBanner.textEn;
  const cta = isAr ? activeBanner.ctaAr : activeBanner.ctaEn;
  const link = activeBanner.link;

  return (
    <div className="h-10 bg-gradient-to-r from-chocolate-800 via-amber-800 to-chocolate-800 text-white flex items-center justify-between px-4 text-xs sm:text-sm font-semibold select-none z-[60] fixed top-0 left-0 right-0 border-b border-amber-600/30">
      <div className="flex-1 flex justify-center items-center gap-2">
        <Megaphone className="w-4 h-4 text-gold-400 animate-pulse flex-shrink-0" />
        <span className="truncate">{text}</span>
        {link && cta && (
          <Link
            href={link}
            className="underline hover:text-gold-300 ml-2 transition-colors inline-flex items-center gap-0.5 text-gold-400 font-bold"
          >
            {cta}
          </Link>
        )}
      </div>
      <button
        onClick={() => setIsVisible(false)}
        className="p-1 hover:bg-white/10 rounded-full transition-colors flex-shrink-0 text-white"
        aria-label="Close Announcement Banner"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
