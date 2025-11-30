'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChocolatePreloader() {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [windowSize, setWindowSize] = useState({ width: 1920, height: 1080 });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Mark as mounted (client-side)
    setIsMounted(true);
    
    // Set window size on client side
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight
    });

    // Simulate loading progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    // Hide preloader after 3 seconds
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

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
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #78350f 0%, #92400e 25%, #b45309 50%, #d97706 75%, #f59e0b 100%)',
            backgroundSize: '400% 400%',
            animation: 'gradientShift 3s ease infinite'
          }}
        >
          {/* Animated background particles */}
          <div className="absolute inset-0 overflow-hidden">
            {isMounted && [...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: Math.random() * windowSize.width,
                  y: -20,
                  opacity: 0.3
                }}
                animate={{
                  y: windowSize.height + 20,
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: "linear"
                }}
                className="absolute w-2 h-2 bg-amber-300 rounded-full blur-sm"
              />
            ))}
          </div>

          <div className="relative z-10 text-center">
            {/* Main Chocolate Bar with realistic shadow */}
            <motion.div
              initial={{ scale: 0, rotateY: -180 }}
              animate={{ 
                scale: 1, 
                rotateY: 0,
              }}
              transition={{ 
                duration: 0.8,
                type: "spring",
                stiffness: 100
              }}
              className="relative mb-8"
            >
              {/* Chocolate wrapper with shine effect */}
              <div className="relative w-64 h-80 mx-auto perspective-1000">
                <motion.div
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
