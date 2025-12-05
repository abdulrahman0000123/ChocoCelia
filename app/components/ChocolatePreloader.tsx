'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChocolatePreloader() {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate loading progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 4;
      });
    }, 50);

    // Hide preloader after 2.5 seconds
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(timer);
    };
  }, []);

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
          {/* Subtle animated background circles */}
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

          {/* Main content */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Logo container with golden ring animation */}
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
              {/* Rotating golden ring */}
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

              {/* Logo image */}
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

            {/* Brand name with typewriter effect */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="mt-8 text-center"
            >
              <h1 className="text-2xl sm:text-3xl font-serif text-white font-bold tracking-wide">
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

            {/* Progress bar */}
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

            {/* Loading text */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-3 text-amber-200/60 text-xs tracking-widest uppercase"
            >
              Loading
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
                  animate={{
                    rotateY: [0, 5, -5, 0],
                    rotateX: [0, 2, -2, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="relative w-full h-full preserve-3d"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Main chocolate body */}
                  <div className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl">
                    {/* Chocolate texture gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-900 via-orange-900 to-amber-950">
                      {/* Shine effect */}
                      <motion.div
                        animate={{
                          x: ['-100%', '200%'],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 1,
                          ease: "easeInOut"
                        }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                      />
                    </div>

                    {/* Chocolate squares grid with depth */}
                    <div className="relative grid grid-cols-4 gap-2 p-4 h-full">
                      {[...Array(16)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ scale: 0, rotateZ: -180 }}
                          animate={{ 
                            scale: 1, 
                            rotateZ: 0,
                            y: [0, -2, 0]
                          }}
                          transition={{ 
                            scale: { delay: i * 0.05, duration: 0.4 },
                            rotateZ: { delay: i * 0.05, duration: 0.4 },
                            y: { 
                              duration: 2,
                              repeat: Infinity,
                              delay: i * 0.1,
                              ease: "easeInOut"
                            }
                          }}
                          className="relative bg-gradient-to-br from-amber-800 to-orange-950 rounded-lg shadow-inner"
                          style={{
                            boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.3), inset -2px -2px 4px rgba(255,255,255,0.1)'
                          }}
                        >
                          {/* Individual square shine */}
                          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-lg" />
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* 3D depth effect */}
                  <div className="absolute inset-0 rounded-3xl border-4 border-amber-950/50 pointer-events-none" />
                </motion.div>

                {/* Melting chocolate drips - multiple animated */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full flex gap-8">
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        height: ['0px', '50px', '0px'],
                        opacity: [0, 1, 0],
                        scaleX: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.3,
                        ease: "easeInOut"
                      }}
                      className="w-3 bg-gradient-to-b from-amber-900 via-orange-900 to-transparent rounded-full"
                      style={{
                        filter: 'blur(1px)',
                        boxShadow: '0 0 10px rgba(217, 119, 6, 0.5)'
                      }}
                    />
                  ))}
                </div>

                {/* Steam/Aroma effect */}
                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 flex gap-4">
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        y: [0, -40],
                        opacity: [0.6, 0],
                        scale: [0.5, 1.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.4,
                        ease: "easeOut"
                      }}
                      className="w-8 h-8 rounded-full bg-amber-200/30 blur-md"
                    />
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Brand Name with glowing effect */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="relative"
            >
              <motion.h1 
                animate={{
                  textShadow: [
                    '0 0 20px rgba(245, 158, 11, 0.5)',
                    '0 0 40px rgba(245, 158, 11, 0.8)',
                    '0 0 20px rgba(245, 158, 11, 0.5)',
                  ]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="text-5xl font-bold text-white mb-2"
                style={{
                  textShadow: '0 0 30px rgba(245, 158, 11, 0.6), 0 2px 10px rgba(0,0,0,0.3)'
                }}
              >
                ChocoCelia
              </motion.h1>
              
              <motion.p
                animate={{
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="text-amber-100 text-lg mb-6 tracking-wide"
              >
                Premium Handmade Chocolates
              </motion.p>
            </motion.div>

            {/* Progress bar */}
            <div className="relative w-64 mx-auto">
              <div className="h-2 bg-amber-950/50 rounded-full overflow-hidden backdrop-blur-sm">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300 rounded-full relative"
                  style={{
                    boxShadow: '0 0 10px rgba(245, 158, 11, 0.8)'
                  }}
                >
                  {/* Shimmer effect on progress bar */}
                  <motion.div
                    animate={{
                      x: ['-100%', '200%'],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                  />
                </motion.div>
              </div>
              <motion.p
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-amber-200 text-sm mt-2 font-medium"
              >
                {progress}% Loading...
              </motion.p>
            </div>

            {/* Floating chocolate chips */}
            <div className="absolute inset-0 pointer-events-none">
              {isMounted && [...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    y: [0, -20, 0],
                    x: [0, Math.sin(i) * 10, 0],
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut"
                  }}
                  className="absolute w-6 h-6 bg-gradient-to-br from-amber-700 to-orange-900 rounded-full shadow-lg"
                  style={{
                    left: `${10 + i * 10}%`,
                    top: `${20 + (i % 3) * 25}%`,
                    boxShadow: '0 4px 10px rgba(0,0,0,0.3), inset -2px -2px 4px rgba(0,0,0,0.2)'
                  }}
                />
              ))}
            </div>
          </div>

          <style jsx global>{`
            @keyframes gradientShift {
              0% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
              100% { background-position: 0% 50%; }
            }
            .perspective-1000 {
              perspective: 1000px;
            }
            .preserve-3d {
              transform-style: preserve-3d;
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
