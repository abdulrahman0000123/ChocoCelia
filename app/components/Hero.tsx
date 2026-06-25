'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, TrendingUp } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface HeroProps {
  settings: {
    heroTitle?: string;
    heroHighlight?: string;
    heroSubtitle?: string;
    heroSlides?: string[];
    phone?: string | null;
  };
  locale: string;
  activeCampaign?: any;
}

export function Hero({ settings, locale, activeCampaign }: HeroProps) {
  const t = useTranslations();
  const isAr = locale === 'ar';
  
  // Rotating occasion-anchored/seasonal taglines
  const taglines = isAr ? [
    'شوكولاتة فاخرة مصنوعة يدوياً لمناسباتكم السعيدة وذكرياتكم الجميلة 🤎',
    'هدايا استثنائية صُنعت بكل حب وشغف لتناسب كل الأوقات ✨',
    'تذوق اللمعان والقرمشة المثالية في كل قطعة شوكولاتة 벨جيكية 🌿',
  ] : [
    'Premium handmade chocolates for your special occasions & beautiful memories 🤎',
    'Exquisite gifts crafted with passion & love for all times ✨',
    'Taste the perfect shine and snap in every Belgian chocolate piece 🌿',
  ];

  const [currentTaglineIndex, setCurrentTaglineIndex] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = activeCampaign?.heroImage
    ? [activeCampaign.heroImage]
    : (settings.heroSlides && settings.heroSlides.length > 0) 
      ? settings.heroSlides 
      : [
          'https://cdn.pixabay.com/photo/2016/04/06/19/05/chocolate-1312524_960_720.jpg',
          'https://cdn.pixabay.com/photo/2019/09/06/07/59/chocolate-4455840_960_720.jpg',
          'https://cdn.pixabay.com/photo/2020/12/04/19/24/dessert-5804153_960_720.jpg',
        ];

  // Rotate taglines every 4 seconds
  useEffect(() => {
    const taglineTimer = setInterval(() => {
      setCurrentTaglineIndex((prev) => (prev + 1) % taglines.length);
    }, 4000);
    return () => clearInterval(taglineTimer);
  }, [taglines.length]);

  // Rotate slides every 6 seconds
  useEffect(() => {
    if (slides.length > 1) {
      const slideTimer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 6000);
      return () => clearInterval(slideTimer);
    }
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const heroTitle = activeCampaign 
    ? (isAr ? activeCampaign.heroTitleAr : activeCampaign.heroTitleEn)
    : settings.heroTitle || (isAr ? 'شوكو سيليا' : 'ChocoCelia');
  const heroHighlight = activeCampaign
    ? ''
    : settings.heroHighlight || (isAr ? 'جرعة سعادتك اليومية' : 'Your Daily Dose Of Happiness');
  
  return (
    <section className="relative min-h-[95vh] flex items-center justify-center overflow-hidden">
      {/* Image Slider Background */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0"
          >
            <img
              src={slides[currentSlide]}
              alt={`Slide ${currentSlide + 1}`}
              className="w-full h-full object-cover"
            />
            {/* Gradient overlay for text contrast */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Slider Controls */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className={`absolute z-20 p-3 rounded-full bg-white/10 hover:bg-white/25 backdrop-blur-md transition-all text-white active:scale-95 ${
              isAr ? 'right-4 md:right-8' : 'left-4 md:left-8'
            }`}
            aria-label="Previous Slide"
          >
            <ChevronLeft className={`w-6 h-6 transform ${isAr ? 'rotate-180' : ''}`} />
          </button>
          <button
            onClick={nextSlide}
            className={`absolute z-20 p-3 rounded-full bg-white/10 hover:bg-white/25 backdrop-blur-md transition-all text-white active:scale-95 ${
              isAr ? 'left-4 md:left-8' : 'right-4 md:right-8'
            }`}
            aria-label="Next Slide"
          >
            <ChevronRight className={`w-6 h-6 transform ${isAr ? 'rotate-180' : ''}`} />
          </button>
          
          {/* Dots Indicator */}
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  currentSlide === index ? 'bg-gold-500 w-8' : 'bg-white/40 w-2.5'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}

      {/* Hero Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative"
        >
          {/* Order Counter Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gold-600/90 dark:bg-gold-500/95 backdrop-blur-md text-white text-xs sm:text-sm font-semibold rounded-full shadow-lg border border-gold-400/30 mb-8"
          >
            <TrendingUp className="w-4 h-4 animate-bounce" />
            <span>
              {isAr 
                ? '🔥 أكتر من 540 طلب تم شحنهم هذا الأسبوع!' 
                : '🔥 Over 540 orders shipped this week!'}
            </span>
          </motion.div>

          {/* Heading */}
          <h1 
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold font-cairo text-white mb-6 px-4 tracking-tight leading-tight"
            style={{ 
              textShadow: '0 4px 20px rgba(0,0,0,0.6), 0 0 40px rgba(212,175,55,0.2)'
            }}
          >
            {heroTitle}
            {heroHighlight && (
              <>
                <br />
                <span className="inline-block bg-gradient-to-r from-gold-400 via-gold-200 to-gold-500 bg-clip-text text-transparent mt-1">
                  {heroHighlight}
                </span>
              </>
            )}
          </h1>

          {/* Rotating Tagline */}
          <div className="h-16 sm:h-12 relative mb-12 max-w-3xl mx-auto flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={currentTaglineIndex}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.5 }}
                className="absolute text-base sm:text-lg md:text-2xl text-chocolate-100 dark:text-chocolate-100 leading-relaxed px-6 font-medium font-cairo"
                style={{ textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}
              >
                {taglines[currentTaglineIndex]}
              </motion.p>
            </AnimatePresence>
          </div>
          
          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mt-8 px-4 max-w-md sm:max-w-2xl mx-auto">
            <Link 
              href={activeCampaign?.heroCtaLink || "/menu"}
              className="group relative px-8 sm:px-12 py-4 sm:py-5 overflow-hidden rounded-full font-bold text-base sm:text-lg w-full sm:w-auto min-h-[44px] flex items-center justify-center"
            >
              {/* Premium Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-gold-500 via-amber-500 to-gold-600 transition-all duration-500 group-hover:scale-110" />
              
              {/* Shine animation */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </div>
              
              {/* Glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-gold-400 to-amber-500 rounded-full blur-lg opacity-40 group-hover:opacity-70 transition-opacity duration-500 -z-10" />
              
              <span className="relative z-10 flex items-center justify-center gap-3 text-white drop-shadow-md font-cairo">
                {activeCampaign
                  ? (isAr ? activeCampaign.heroCtaAr : activeCampaign.heroCtaEn)
                  : (isAr ? 'اختار هديتك 🎁' : 'Choose your gift 🎁')}
                <motion.svg
                  animate={{ x: isAr ? [0, -5, 0] : [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d={isAr ? "M7 16l-4-4m0 0l4-4m-4 4h18" : "M17 8l4 4m0 0l-4 4m4-4H3"} 
                  />
                </motion.svg>
              </span>
            </Link>
            
            <Link 
              href="/about"
              className="group relative px-8 sm:px-12 py-4 sm:py-5 overflow-hidden rounded-full font-bold text-base sm:text-lg w-full sm:w-auto min-h-[44px] flex items-center justify-center"
            >
              {/* Premium Glassmorphism */}
              <div className="absolute inset-0 bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-full transition-all duration-500 group-hover:bg-white/20 group-hover:border-white/40" />
              
              <span className="relative z-10 flex items-center justify-center gap-3 text-white drop-shadow-lg font-cairo">
                <Sparkles className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12 text-gold-400" />
                {isAr ? 'قصتنا 🤎' : 'Our Story 🤎'}
              </span>
            </Link>
          </div>

          {/* Trust Line */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="mt-6 text-sm sm:text-base text-chocolate-200/90 font-medium font-cairo"
            style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}
          >
            {isAr 
              ? 'حالياً نحن في محافظة بني سويف، ولكن قريباً في جميع المحافظات' 
              : 'Currently in Beni Suef Governorate, but coming soon to all governorates'}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
