'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Default values (used if API fails or returns empty)
const DEFAULT_HERO_SLIDES = [
  'https://cdn.pixabay.com/photo/2016/04/06/19/05/chocolate-1312524_960_720.jpg',
  'https://cdn.pixabay.com/photo/2019/09/06/07/59/chocolate-4455840_960_720.jpg',
  'https://cdn.pixabay.com/photo/2020/12/04/19/24/dessert-5804153_960_720.jpg',
];
const DEFAULT_HERO_TITLE = 'ChocoCelia';
const DEFAULT_HERO_HIGHLIGHT = 'Your Daily Dose Of Happiness';
const DEFAULT_HERO_SUBTITLE = 'Experience the finest handmade chocolates, crafted with passion and premium ingredients.';

export function Hero() {
  const [settings, setSettings] = useState({
    heroTitle: DEFAULT_HERO_TITLE,
    heroHighlight: DEFAULT_HERO_HIGHLIGHT,
    heroSubtitle: DEFAULT_HERO_SUBTITLE,
    heroSlides: DEFAULT_HERO_SLIDES,
  });
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (settings.heroSlides.length > 1) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % settings.heroSlides.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [settings.heroSlides.length]);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings({
          heroTitle: data.heroTitle || DEFAULT_HERO_TITLE,
          heroHighlight: data.heroHighlight || DEFAULT_HERO_HIGHLIGHT,
          heroSubtitle: data.heroSubtitle || DEFAULT_HERO_SUBTITLE,
          heroSlides: (Array.isArray(data.heroSlides) && data.heroSlides.length > 0) ? data.heroSlides : DEFAULT_HERO_SLIDES,
        });
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % settings.heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + settings.heroSlides.length) % settings.heroSlides.length);
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Image Slider Background */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 z-0"
        >
          <img
            src={settings.heroSlides[currentSlide]}
            alt={`Slide ${currentSlide + 1}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
        </motion.div>
      </AnimatePresence>

      {/* Gradient Overlay Elements - Hidden since we have slides */}
      {settings.heroSlides.length === 0 && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.1, scale: 1 }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
            className="absolute -top-20 -right-20 w-96 h-96 bg-chocolate-400 rounded-full blur-3xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.1, scale: 1 }}
            transition={{ duration: 3, repeat: Infinity, repeatType: "reverse", delay: 1 }}
            className="absolute -bottom-20 -left-20 w-96 h-96 bg-gold-500 rounded-full blur-3xl"
          />
        </div>
      )}

      {/* Slider Controls */}
      {settings.heroSlides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 z-20 p-3 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all text-white"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 z-20 p-3 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all text-white"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          
          {/* Dots Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
            {settings.heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  currentSlide === index ? 'bg-white w-8' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </>
      )}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative"
        >
          {/* Decorative Elements */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-transparent via-gold-400 to-transparent"
          />

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold font-cairo text-white mb-6 px-4"
            style={{ 
              textShadow: '0 4px 20px rgba(0,0,0,0.5), 0 0 40px rgba(212,175,55,0.3)',
              lineHeight: '1.2'
            }}
          >
            {settings.heroTitle}
            <br />
            <motion.span 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="inline-block bg-gradient-to-r from-gold-400 via-gold-500 to-gold-400 bg-clip-text text-transparent"
              style={{
                filter: 'drop-shadow(0 2px 10px rgba(212,175,55,0.5))'
              }}
            >
              {settings.heroHighlight}
            </motion.span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="relative inline-block"
          >
            <p className="text-base sm:text-lg md:text-2xl text-white/95 mb-12 max-w-3xl mx-auto leading-relaxed px-6"
               style={{ textShadow: '0 2px 10px rgba(0,0,0,0.7)' }}>
              {settings.heroSubtitle}
            </p>
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-32 h-0.5 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mt-8 px-4"
          >
            <Link 
              href="/menu"
              className="group relative px-8 sm:px-12 py-4 sm:py-5 overflow-hidden rounded-full font-bold text-base sm:text-lg w-full sm:w-auto"
            >
              {/* Gradient background with animation */}
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 transition-all duration-500 group-hover:scale-110" />
              
              {/* Shine effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </div>
              
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-500 -z-10" />
              
              <span className="relative z-10 flex items-center justify-center gap-3 text-white drop-shadow-lg">
                Explore Menu
                <motion.svg
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </motion.svg>
              </span>
            </Link>
            
            <Link 
              href="/about"
              className="group relative px-8 sm:px-12 py-4 sm:py-5 overflow-hidden rounded-full font-bold text-base sm:text-lg w-full sm:w-auto"
            >
              {/* Glass background */}
              <div className="absolute inset-0 bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-full transition-all duration-500 group-hover:bg-white/20 group-hover:border-white/40" />
              
              {/* Gradient border animation */}
              <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-gold-400/50 via-white/30 to-gold-400/50 animate-pulse" style={{ padding: '2px' }}>
                  <div className="w-full h-full rounded-full bg-transparent" />
                </div>
              </div>
              
              <span className="relative z-10 flex items-center justify-center gap-3 text-white drop-shadow-lg">
                <svg className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Our Story
              </span>
            </Link>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 hidden md:block"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex flex-col items-center gap-2 text-white/60"
            >
              <span className="text-xs uppercase tracking-wider">Scroll</span>
              <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
                <motion.div
                  animate={{ y: [0, 12, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-1 h-3 bg-white/60 rounded-full mt-2"
                />
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
