'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function AboutPage() {
  const [settings, setSettings] = useState({
    ourStoryTitle: 'Our Story',
    ourStorySubtitle: 'Crafting moments of joy, one chocolate at a time.',
    ourStoryBeginningTitle: 'The Beginning',
    ourStoryBeginning: 'Founded with a passion for the art of chocolatiering, CHOCO-CELIA started as a small kitchen experiment. Our founder, driven by a love for pure, high-quality ingredients, sought to create chocolates that were not only delicious but also visually stunning.',
    ourStoryPhilosophyTitle: 'Our Philosophy',
    ourStoryPhilosophy: 'We believe in the power of handmade. Every piece of chocolate that leaves our workshop is crafted by hand, ensuring the perfect temper, snap, and shine. We source our cocoa beans from sustainable farms and pair them with the finest local ingredients to create unique flavor profiles.',
    placeholder1Icon: '🌿',
    placeholder1Title: 'Premium Ingredients',
    placeholder1Description: 'Only the finest cocoa and fresh ingredients.',
    placeholder2Icon: '🖐️',
    placeholder2Title: 'Handmade with Love',
    placeholder2Description: 'Crafted in small batches for perfection.',
    placeholder3Icon: '✨',
    placeholder3Title: 'Unique Flavors',
    placeholder3Description: 'Innovative combinations that delight.',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings({
          ourStoryTitle: data.ourStoryTitle || 'Our Story',
          ourStorySubtitle: data.ourStorySubtitle || 'Crafting moments of joy, one chocolate at a time.',
          ourStoryBeginningTitle: data.ourStoryBeginningTitle || 'The Beginning',
          ourStoryBeginning: data.ourStoryBeginning || 'Founded with a passion for the art of chocolatiering...',
          ourStoryPhilosophyTitle: data.ourStoryPhilosophyTitle || 'Our Philosophy',
          ourStoryPhilosophy: data.ourStoryPhilosophy || 'We believe in the power of handmade...',
          placeholder1Icon: data.placeholder1Icon || '🌿',
          placeholder1Title: data.placeholder1Title || 'Premium Ingredients',
          placeholder1Description: data.placeholder1Description || 'Only the finest cocoa and fresh ingredients.',
          placeholder2Icon: data.placeholder2Icon || '🖐️',
          placeholder2Title: data.placeholder2Title || 'Handmade with Love',
          placeholder2Description: data.placeholder2Description || 'Crafted in small batches for perfection.',
          placeholder3Icon: data.placeholder3Icon || '✨',
          placeholder3Title: data.placeholder3Title || 'Unique Flavors',
          placeholder3Description: data.placeholder3Description || 'Innovative combinations that delight.',
        });
      }
    } catch (error) {
      console.error('Failed to fetch settings');
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-b from-chocolate-50 via-white to-chocolate-50 dark:from-chocolate-950 dark:via-chocolate-900 dark:to-chocolate-950">
      {/* Hero Section with Modern Design */}
      <div className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-chocolate-900 via-chocolate-800 to-chocolate-950 dark:from-black dark:via-chocolate-950 dark:to-chocolate-900" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />
        
        {/* Animated Circles */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 left-20 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 right-20 w-96 h-96 bg-chocolate-500/10 rounded-full blur-3xl"
        />
        
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-6xl md:text-8xl font-bold font-serif mb-6 bg-gradient-to-r from-gold-400 via-gold-300 to-gold-500 bg-clip-text text-transparent drop-shadow-2xl">
              {settings.ourStoryTitle}
            </h1>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="relative"
          >
            <p className="text-2xl md:text-3xl text-white/90 max-w-3xl mx-auto font-light leading-relaxed">
              {settings.ourStorySubtitle}
            </p>
            <div className="absolute -inset-4 bg-gradient-to-r from-transparent via-gold-500/20 to-transparent blur-xl" />
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-white/70 rounded-full" />
          </div>
        </motion.div>
      </div>

      {/* Quote Section with Modern Card */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-white/90 dark:bg-chocolate-800/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-12 border border-chocolate-100 dark:border-chocolate-700"
        >
          <div className="text-center">
            <div className="text-6xl text-gold-500 mb-4">"</div>
            <p className="text-2xl md:text-3xl text-chocolate-800 dark:text-chocolate-100 font-serif italic leading-relaxed">
              At CHOCO-CELIA, we believe that chocolate is not just a treat, but an experience that speaks to the soul.
            </p>
            <div className="text-6xl text-gold-500 mt-4 rotate-180">"</div>
          </div>
        </motion.div>
      </div>

      {/* Story Content with Timeline Design */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="space-y-16">
          {/* The Beginning */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-gradient-to-br from-gold-500 to-gold-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-gold-500/30">
                  🌱
                </div>
              </div>
              <div className="flex-1 bg-white/80 dark:bg-chocolate-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-chocolate-100 dark:border-chocolate-700">
                <h3 className="text-3xl font-bold bg-gradient-to-r from-chocolate-900 to-chocolate-700 dark:from-gold-400 dark:to-gold-300 bg-clip-text text-transparent mb-4">
                  {settings.ourStoryBeginningTitle}
                </h3>
                <p className="text-lg text-chocolate-700 dark:text-chocolate-200 leading-relaxed">
                  {settings.ourStoryBeginning}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Our Philosophy */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="flex items-start gap-6 flex-row-reverse">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-gradient-to-br from-chocolate-600 to-chocolate-700 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-chocolate-600/30">
                  💎
                </div>
              </div>
              <div className="flex-1 bg-white/80 dark:bg-chocolate-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-chocolate-100 dark:border-chocolate-700 text-right">
                <h3 className="text-3xl font-bold bg-gradient-to-r from-chocolate-700 to-chocolate-900 dark:from-gold-300 dark:to-gold-400 bg-clip-text text-transparent mb-4">
                  {settings.ourStoryPhilosophyTitle}
                </h3>
                <p className="text-lg text-chocolate-700 dark:text-chocolate-200 leading-relaxed">
                  {settings.ourStoryPhilosophy}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Feature Cards with 3D Effect */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24"
        >
          <motion.div 
            whileHover={{ y: -10, scale: 1.02 }}
            transition={{ duration: 0.3 }}
            className="group relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-gold-500/20 to-chocolate-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
            <div className="relative text-center p-8 bg-white/90 dark:bg-chocolate-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-chocolate-100 dark:border-chocolate-700 h-full">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gold-400 to-gold-600 rounded-2xl flex items-center justify-center text-5xl shadow-lg transform group-hover:rotate-12 transition-transform">
                {settings.placeholder1Icon}
              </div>
              <h4 className="text-xl font-bold text-chocolate-900 dark:text-chocolate-100 mb-3">
                {settings.placeholder1Title}
              </h4>
              <p className="text-chocolate-600 dark:text-chocolate-300 leading-relaxed">
                {settings.placeholder1Description}
              </p>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -10, scale: 1.02 }}
            transition={{ duration: 0.3 }}
            className="group relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-chocolate-500/20 to-gold-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
            <div className="relative text-center p-8 bg-white/90 dark:bg-chocolate-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-chocolate-100 dark:border-chocolate-700 h-full">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-chocolate-600 to-chocolate-700 rounded-2xl flex items-center justify-center text-5xl shadow-lg transform group-hover:rotate-12 transition-transform">
                {settings.placeholder2Icon}
              </div>
              <h4 className="text-xl font-bold text-chocolate-900 dark:text-chocolate-100 mb-3">
                {settings.placeholder2Title}
              </h4>
              <p className="text-chocolate-600 dark:text-chocolate-300 leading-relaxed">
                {settings.placeholder2Description}
              </p>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -10, scale: 1.02 }}
            transition={{ duration: 0.3 }}
            className="group relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-gold-500/20 to-chocolate-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
            <div className="relative text-center p-8 bg-white/90 dark:bg-chocolate-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-chocolate-100 dark:border-chocolate-700 h-full">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gold-500 to-gold-600 rounded-2xl flex items-center justify-center text-5xl shadow-lg transform group-hover:rotate-12 transition-transform">
                {settings.placeholder3Icon}
              </div>
              <h4 className="text-xl font-bold text-chocolate-900 dark:text-chocolate-100 mb-3">
                {settings.placeholder3Title}
              </h4>
              <p className="text-chocolate-600 dark:text-chocolate-300 leading-relaxed">
                {settings.placeholder3Description}
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
