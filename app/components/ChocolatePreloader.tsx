'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';

interface ChocolatePreloaderProps {
  onComplete?: () => void;
}

export default function ChocolatePreloader({ onComplete }: ChocolatePreloaderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const t = useTranslations();

  useEffect(() => {
    // Add class to body during preloading
    document.body.classList.add('preloading');
    
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 4;
      });
    }, 50);

    const timer = setTimeout(() => {
      setIsLoading(false);
      document.body.classList.remove('preloading');
      if (onComplete) {
        // Trigger website reveal immediately to start concurrent fade-in
        onComplete();
      }
    }, 2500);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(timer);
      document.body.classList.remove('preloading');
    };
  }, [onComplete]);

  // Define falling droplets with staggered timings and slightly randomized offsets
  const droplets = [
    { id: 1, left: 'calc(50% - 40px)', delay: 0.1, duration: 1.6, size: 8 },
    { id: 2, left: 'calc(50% - 15px)', delay: 0.7, duration: 1.9, size: 10 },
    { id: 3, left: 'calc(50% + 15px)', delay: 1.3, duration: 1.5, size: 7 },
    { id: 4, left: 'calc(50% + 35px)', delay: 2.0, duration: 1.7, size: 9 },
    { id: 5, left: 'calc(50% - 2px)', delay: 0.4, duration: 2.1, size: 8 },
  ];

  return (
    <AnimatePresence mode="wait">
      {isLoading && (
        <motion.div
          initial={{ y: 0 }}
          animate={{ y: 0 }}
          exit={{ y: '100vh' }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          className="chocolate-preloader fixed inset-x-0 overflow-visible"
          style={{
            top: -80, // Offset for the dripping top header
            height: 'calc(100vh + 80px)',
            zIndex: 9999,
          }}
        >
          {/* Custom style block to inject keyframe animations */}
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes shimmer {
              0% { background-position: -200% center; }
              100% { background-position: 200% center; }
            }
            .gold-shimmer-text {
              background: linear-gradient(90deg, #D4AF37 0%, #FFF 25%, #FFD700 50%, #FFF 75%, #D4AF37 100%);
              background-size: 200% auto;
              color: transparent;
              -webkit-background-clip: text;
              background-clip: text;
              animation: shimmer 4s linear infinite;
            }
          `}} />

          {/* Hidden SVG with gooey filter definition */}
          <svg className="absolute w-0 h-0" width="0" height="0">
            <defs>
              <filter id="gooey-chocolate">
                <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
                <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
                <feComposite in="SourceGraphic" in2="goo" operator="atop" />
              </filter>
            </defs>
          </svg>

          {/* 1. Dripping Top Border (visible only when container slides down) */}
          <div className="w-full h-20 overflow-hidden relative" style={{ backgroundColor: 'transparent' }}>
            <svg 
              viewBox="0 0 1000 100" 
              className="w-full h-full absolute bottom-0 left-0" 
              preserveAspectRatio="none"
              fill="#241006"
            >
              <path d="M 0 100 L 0 0 C 50 0, 80 80, 100 80 C 120 80, 150 0, 200 0 C 230 0, 250 60, 270 60 C 290 60, 310 10, 350 10 C 380 10, 400 90, 420 90 C 440 90, 470 0, 500 0 C 530 0, 550 50, 570 50 C 590 50, 610 20, 650 20 C 680 20, 700 75, 720 75 C 740 75, 770 0, 800 0 C 850 0, 900 65, 930 65 C 960 65, 980 0, 1000 0 L 1000 100 Z" />
            </svg>
          </div>

          {/* 2. Main Content Container */}
          <div 
            className="w-full h-screen relative flex flex-col items-center justify-between py-12 px-4"
            style={{
              background: 'linear-gradient(135deg, #1C0D06 0%, #241006 50%, #2D150B 100%)',
            }}
          >
            {/* Background ambient gold glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <motion.div
                animate={{
                  scale: [1, 1.15, 1],
                  opacity: [0.12, 0.22, 0.12]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500 rounded-full blur-3xl"
              />
              <motion.div
                animate={{
                  scale: [1.2, 1, 1.2],
                  opacity: [0.1, 0.18, 0.1]
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-600 rounded-full blur-3xl"
              />
            </div>

            {/* Top spacer / Brand label */}
            <div className="relative z-10 text-center select-none opacity-40">
              <span className="text-xs uppercase tracking-widest text-amber-200/50 font-cairo">
                Choco Celia Artisanal
              </span>
            </div>

            {/* Central Area: Chocolate Bar and Typography */}
            <div className="relative z-10 flex flex-col items-center justify-center flex-grow -mt-8">
              {/* Handcrafted SVG Chocolate Bar with Peeled Foil */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0, rotate: -5 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ duration: 0.8, type: "spring", stiffness: 80 }}
                className="relative w-40 h-56 md:w-48 md:h-68 select-none"
              >
                <svg 
                  viewBox="0 0 200 280" 
                  className="w-full h-full filter drop-shadow-[0_20px_35px_rgba(0,0,0,0.7)]"
                >
                  <defs>
                    <linearGradient id="choco-base" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4A2511" />
                      <stop offset="100%" stopColor="#1D0B03" />
                    </linearGradient>
                    <linearGradient id="choco-block-bevel" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#6E381A" />
                      <stop offset="100%" stopColor="#1F0B03" />
                    </linearGradient>
                    <linearGradient id="choco-block-face" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#5C2D14" />
                      <stop offset="100%" stopColor="#3A1808" />
                    </linearGradient>
                    <linearGradient id="choco-melt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4A2511" />
                      <stop offset="100%" stopColor="#241006" />
                    </linearGradient>
                    <linearGradient id="gold-foil" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#AA771C" />
                      <stop offset="25%" stopColor="#FFD700" />
                      <stop offset="50%" stopColor="#B38728" />
                      <stop offset="75%" stopColor="#FBF5B7" />
                      <stop offset="100%" stopColor="#AA771C" />
                    </linearGradient>
                  </defs>

                  {/* Chocolate Base Slab */}
                  <rect x="25" y="25" width="150" height="230" rx="12" fill="url(#choco-base)" />

                  {/* Chocolate Blocks (Bevel and Face) */}
                  {/* Row 1 - Column 1 */}
                  <rect x="37" y="37" width="58" height="55" rx="6" fill="url(#choco-block-bevel)" />
                  <rect x="42" y="42" width="48" height="45" rx="4" fill="url(#choco-block-face)" />
                  <path d="M 44 44 L 88 44 L 86 47 L 46 47 Z" fill="rgba(255,255,255,0.12)" />
                  <path d="M 44 44 L 44 87 L 47 85 L 47 46 Z" fill="rgba(255,255,255,0.08)" />

                  {/* Row 1 - Column 2 */}
                  <rect x="105" y="37" width="58" height="55" rx="6" fill="url(#choco-block-bevel)" />
                  <rect x="110" y="42" width="48" height="45" rx="4" fill="url(#choco-block-face)" />
                  <path d="M 112 44 L 156 44 L 154 47 L 114 47 Z" fill="rgba(255,255,255,0.12)" />
                  <path d="M 112 44 L 112 87 L 115 85 L 115 46 Z" fill="rgba(255,255,255,0.08)" />

                  {/* Row 2 - Column 1 (partially visible under foil) */}
                  <rect x="37" y="102" width="58" height="55" rx="6" fill="url(#choco-block-bevel)" />
                  <rect x="42" y="107" width="48" height="45" rx="4" fill="url(#choco-block-face)" />
                  <path d="M 42 107 L 88 107 L 86 110 L 44 110 Z" fill="rgba(255,255,255,0.12)" />
                  <path d="M 42 107 L 42 147 L 45 145 L 45 109 Z" fill="rgba(255,255,255,0.08)" />

                  {/* Row 2 - Column 2 (partially visible under foil) */}
                  <rect x="105" y="102" width="58" height="55" rx="6" fill="url(#choco-block-bevel)" />
                  <rect x="110" y="107" width="48" height="45" rx="4" fill="url(#choco-block-face)" />
                  <path d="M 110 107 L 156 107 L 154 110 L 112 110 Z" fill="rgba(255,255,255,0.12)" />
                  <path d="M 110 107 L 110 147 L 113 145 L 113 109 Z" fill="rgba(255,255,255,0.08)" />

                  {/* Pulsating Melt layer on top of foil seam */}
                  <motion.path
                    d="M 25 150 C 45 160, 65 140, 85 155 C 105 145, 125 160, 145 148 C 165 155, 175 140, 175 130 C 160 138, 140 142, 120 135 C 100 145, 80 135, 60 145 C 40 138, 25 150, 25 150 Z"
                    fill="url(#choco-melt)"
                    animate={{
                      d: [
                        "M 25 150 C 45 160, 65 140, 85 155 C 105 145, 125 160, 145 148 C 165 155, 175 140, 175 130 C 160 138, 140 142, 120 135 C 100 145, 80 135, 60 145 C 40 138, 25 150, 25 150 Z",
                        "M 25 152 C 43 158, 62 144, 83 152 C 107 148, 123 157, 147 150 C 162 158, 177 142, 175 130 C 162 135, 142 145, 122 138 C 102 142, 82 138, 62 148 C 42 140, 25 152, 25 152 Z",
                        "M 25 150 C 45 160, 65 140, 85 155 C 105 145, 125 160, 145 148 C 165 155, 175 140, 175 130 C 160 138, 140 142, 120 135 C 100 145, 80 135, 60 145 C 40 138, 25 150, 25 150 Z"
                      ]
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />

                  {/* Gold Foil Wrapper (covers bottom half) */}
                  {/* Shadow under foil */}
                  <path 
                    d="M 23 154 C 60 162, 100 132, 177 134 L 177 257 C 177 262, 172 262, 172 262 L 28 262 C 23 262, 23 257, 23 257 Z" 
                    fill="rgba(0,0,0,0.55)" 
                    filter="blur(3px)"
                  />
                  {/* Foil Body */}
                  <path 
                    d="M 25 150 C 60 158, 100 128, 175 130 L 175 255 C 175 255, 175 255, 175 255 L 25 255 Z" 
                    fill="url(#gold-foil)"
                  />
                  {/* Foil Crease Texture */}
                  <path d="M 25 150 L 60 185 L 75 170 Z" fill="rgba(255,255,255,0.18)" />
                  <path d="M 60 185 L 100 128 L 85 160 Z" fill="rgba(0,0,0,0.12)" />
                  <path d="M 100 128 L 135 195 L 115 180 Z" fill="rgba(255,255,255,0.15)" />
                  <path d="M 135 195 L 175 130 L 155 165 Z" fill="rgba(0,0,0,0.15)" />
                  
                  {/* Peeled Fold edge */}
                  <path 
                    d="M 25 150 C 50 165, 80 150, 100 128 C 120 145, 150 135, 175 130 C 160 145, 130 155, 100 140 C 70 165, 45 160, 25 150 Z" 
                    fill="url(#gold-foil)" 
                    stroke="#FFD700" 
                    strokeWidth="0.5"
                  />
                  <path 
                    d="M 25 150 C 50 165, 80 150, 100 128 C 120 145, 150 135, 175 130" 
                    fill="none" 
                    stroke="#FFF" 
                    strokeWidth="1.2" 
                    opacity="0.7"
                  />

                  {/* Dark Red Elegant Paper Band */}
                  <rect x="25" y="185" width="150" height="42" fill="#721c1a" opacity="0.95" />
                  <rect x="25" y="188" width="150" height="36" fill="none" stroke="#D4AF37" strokeWidth="1" opacity="0.8" />
                  <circle cx="100" cy="206" r="14" fill="#D4AF37" />
                  <polygon points="100,197 103,203 110,205 105,210 107,217 100,213 93,217 95,210 90,205 97,203" fill="#721c1a" />
                </svg>
              </motion.div>

              {/* Shimmering Text & Brand Info */}
              <div className="mt-8 text-center px-4 max-w-sm">
                <h1 className="text-3xl md:text-4xl font-bold tracking-wide select-none">
                  <span className="gold-shimmer-text font-display">Choco Celia</span>
                </h1>
                
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-amber-200/60 text-xs md:text-sm mt-2 font-cairo font-light tracking-wide italic"
                >
                  Your Daily Dose Of Happiness
                </motion.p>
              </div>

              {/* Progress bar container */}
              <div className="mt-8 w-44 md:w-52 h-1.5 bg-white/10 rounded-full overflow-hidden relative shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    width: `${progress}%`,
                    background: 'linear-gradient(90deg, #b5893d, #ffd700, #b5893d)',
                    boxShadow: '0 0 10px rgba(255, 215, 0, 0.6), 0 0 20px rgba(255, 215, 0, 0.3)',
                  }}
                  transition={{ ease: "easeOut" }}
                />
              </div>

              {/* Progress text */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-3 text-amber-200/50 text-[10px] md:text-xs tracking-widest uppercase font-cairo"
              >
                {t('loading')}
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  ...
                </motion.span>
                <span className="ml-1 text-amber-200/80 font-mono">{progress}%</span>
              </motion.p>
            </div>

            {/* Bottom footer note */}
            <div className="relative z-10 select-none opacity-20 text-[10px] text-amber-200/50 font-mono tracking-widest">
              HANDMADE WITH PERFECTION
            </div>

            {/* 3. Liquid Gooey Drip Layer */}
            <div 
              className="absolute inset-0 pointer-events-none overflow-hidden"
              style={{ filter: 'url(#gooey-chocolate)', zIndex: 5 }}
            >
              {/* Falling Drips from Chocolate Bar */}
              {droplets.map((drop) => (
                <motion.div
                  key={drop.id}
                  className="absolute bg-[#241006] rounded-full"
                  style={{
                    left: drop.left,
                    width: drop.size,
                    height: drop.size,
                    top: 'calc(50vh + 15px)', // Aligns exactly with the bottom of the peeled chocolate
                  }}
                  animate={{
                    y: ['0px', '50vh'], // Falls exactly to the bottom pool
                    scaleY: [1, 1.8, 1], // Stretches like real liquid droplets
                    scaleX: [1, 0.6, 1],
                    opacity: [0, 1, 1, 0.8, 0], // Fades in as it starts, fades out as it merges
                  }}
                  transition={{
                    duration: drop.duration,
                    repeat: Infinity,
                    delay: drop.delay,
                    ease: [0.6, 0.04, 0.98, 0.335], // Gravity acceleration curve
                  }}
                />
              ))}

              {/* Rising bottom liquid pool */}
              <motion.div
                className="absolute bottom-0 left-0 right-0 bg-[#241006] w-full"
                style={{
                  height: `calc(35px + ${progress * 0.15}vh)`, // Rises as progress increments
                }}
                animate={{
                  // Creates organic waving motion
                  borderRadius: [
                    '45% 45% 0 0 / 12% 12% 0 0',
                    '55% 35% 0 0 / 18% 8% 0 0',
                    '35% 55% 0 0 / 8% 18% 0 0',
                    '45% 45% 0 0 / 12% 12% 0 0'
                  ]
                }}
                transition={{
                  duration: 7,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
