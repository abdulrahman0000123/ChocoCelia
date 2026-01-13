'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../lib/translations';

interface ChocolatePreloaderProps {
  onComplete?: () => void;
}

export default function ChocolatePreloader({ onComplete }: ChocolatePreloaderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const { locale } = useLanguage();
  const t = (key: string) => {
    const translation = translations[locale as keyof typeof translations];
    return (translation as any)[key] || key;
  };

  useEffect(() => {
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
      if (onComplete) {
        // Call onComplete after a short delay to allow exit animation
        setTimeout(() => {
          onComplete();
        }, 500);
      }
    }, 2500);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(timer);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #3D1E0F 0%, #5D3A1A 50%, #78350f 100%)',
          }}
        >
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.2, 0.1]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/4 -left-20 w-64 h-64 bg-amber-500 rounded-full blur-3xl"
            />
            <motion.div
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.1, 0.15, 0.1]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-1/4 -right-20 w-64 h-64 bg-yellow-500 rounded-full blur-3xl"
            />
          </div>

          <div className="relative z-10 flex flex-col items-center">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                duration: 0.8,
                type: "spring",
                stiffness: 100,
                damping: 15
              }}
              className="relative"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-3 rounded-full"
                style={{
                  background: 'conic-gradient(from 0deg, transparent, #D4AF37, #FFD700, #D4AF37, transparent)',
                  padding: '3px',
                }}
              >
                <div className="w-full h-full rounded-full bg-[#3D1E0F]" />
              </motion.div>

              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden shadow-2xl"
                style={{
                  boxShadow: '0 0 40px rgba(212, 175, 55, 0.4), 0 0 80px rgba(212, 175, 55, 0.2)'
                }}
              >
                <img
                  src="/logo.png"
                  alt="Choco Celia"
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="mt-8 text-center"
            >
              <h1 className="text-2xl sm:text-3xl font-cairo text-white font-bold tracking-wide">
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-amber-400"
                >
                  Choco
                </motion.span>
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-white"
                >
                  {' '}Celia
                </motion.span>
              </h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-amber-200/70 text-sm mt-1 font-light italic"
              >
                Your Daily Dose Of Happiness
              </motion.p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: '160px' }}
              transition={{ delay: 0.8, duration: 0.3 }}
              className="mt-8 h-1 bg-white/20 rounded-full overflow-hidden"
            >
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                className="h-full rounded-full"
                style={{
                  background: 'linear-gradient(90deg, #D4AF37, #FFD700, #D4AF37)',
                }}
              />
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-3 text-amber-200/60 text-xs tracking-widest uppercase"
            >
              {t('loading')}
              <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                ...
              </motion.span>
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
