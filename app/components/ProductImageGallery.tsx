'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';

interface ProductImageGalleryProps {
  mainImage: string;
  images?: string[];
  name: string;
  locale: string;
}

export function ProductImageGallery({ mainImage, images = [], name, locale }: ProductImageGalleryProps) {
  const isAr = locale === 'ar';
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Combine main image and additional images, removing duplicates
  const allImages = Array.from(new Set([mainImage, ...(images || [])])).filter(Boolean);

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % allImages.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Main Image Viewport */}
      <div className="relative bg-white dark:bg-chocolate-850 rounded-3xl aspect-square flex items-center justify-center overflow-hidden shadow-2xl border border-chocolate-100/50 dark:border-chocolate-800/80 group">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full relative"
          >
            <Image
              src={allImages[activeIndex]}
              alt={`${name} - View ${activeIndex + 1}`}
              fill
              priority={activeIndex === 0}
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>

        {/* Lightbox Trigger Button */}
        <button
          onClick={() => setIsLightboxOpen(true)}
          className="absolute top-4 right-4 p-2.5 rounded-full bg-white/80 dark:bg-chocolate-900/85 backdrop-blur-sm shadow-md hover:bg-white text-chocolate-700 dark:text-chocolate-200 transition-all opacity-0 group-hover:opacity-100 active:scale-95 cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center z-10"
          aria-label="Zoom image"
        >
          <Maximize2 className="w-5 h-5" />
        </button>

        {/* Navigation Arrows */}
        <button
          onClick={handlePrev}
          className={`absolute left-4 p-3 rounded-full bg-white/75 dark:bg-chocolate-900/80 backdrop-blur-sm text-chocolate-700 dark:text-chocolate-250 shadow-md hover:bg-white transition-all active:scale-90 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center z-10 ${allImages.length <= 1 ? 'hidden' : ''}`}
          aria-label="Previous image"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={handleNext}
          className={`absolute right-4 p-3 rounded-full bg-white/75 dark:bg-chocolate-900/80 backdrop-blur-sm text-chocolate-700 dark:text-chocolate-250 shadow-md hover:bg-white transition-all active:scale-90 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center z-10 ${allImages.length <= 1 ? 'hidden' : ''}`}
          aria-label="Next image"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Thumbnails strip */}
      {allImages.length > 1 && (
        <div className="flex gap-3 justify-center">
          {allImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`w-16 h-16 rounded-xl overflow-hidden relative border-2 bg-white dark:bg-chocolate-850 cursor-pointer transition-all active:scale-95 min-h-[64px] min-w-[64px] ${
                idx === activeIndex
                  ? 'border-gold-500 shadow-md scale-105'
                  : 'border-chocolate-100/50 dark:border-chocolate-800/40 opacity-70 hover:opacity-100'
              }`}
            >
              <Image
                src={img}
                alt="Thumbnail"
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox / Fullscreen Modal */}
      <AnimatePresence>
        {isLightboxOpen && (
          <div className="fixed inset-0 z-50 bg-chocolate-950/95 backdrop-blur-sm flex flex-col items-center justify-center p-4">
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Close fullscreen view"
            >
              <X className="w-7 h-7" />
            </button>

            <div className="w-full max-w-4xl aspect-square relative rounded-3xl overflow-hidden shadow-2xl border border-white/10">
              <Image
                src={allImages[activeIndex]}
                alt={`${name} - Fullscreen`}
                fill
                sizes="(max-width: 1200px) 100vw, 1000px"
                className="object-contain"
              />
            </div>

            {/* Lightbox Navigation */}
            {allImages.length > 1 && (
              <div className="flex items-center gap-6 mt-6 text-white">
                <button
                  onClick={handlePrev}
                  className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <ChevronLeft className="w-7 h-7" />
                </button>
                <span className="text-sm font-bold font-display">
                  {activeIndex + 1} / {allImages.length}
                </span>
                <button
                  onClick={handleNext}
                  className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <ChevronRight className="w-7 h-7" />
                </button>
              </div>
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
export default ProductImageGallery;
