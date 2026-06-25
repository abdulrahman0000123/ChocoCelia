'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

interface AboutClientProps {
  settings: {
    ourStoryTitle?: string;
    ourStorySubtitle?: string;
    ourStoryBeginningTitle?: string;
    ourStoryBeginning?: string;
    ourStoryPhilosophyTitle?: string;
    ourStoryPhilosophy?: string;
    featureCard1Icon?: string;
    featureCard1Title?: string;
    featureCard1Description?: string;
    featureCard2Icon?: string;
    featureCard2Title?: string;
    featureCard2Description?: string;
    featureCard3Icon?: string;
    featureCard3Title?: string;
    featureCard3Description?: string;
  };
  locale: string;
}

export function AboutClient({ settings, locale }: AboutClientProps) {
  const t = useTranslations();
  const isAr = locale === 'ar';

  return (
    <div className="min-h-screen bg-gradient-to-b from-chocolate-50 via-white to-chocolate-50 dark:from-chocolate-950 dark:via-chocolate-900 dark:to-chocolate-950">
      {/* Hero Section */}
      <div className="relative h-[65vh] flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-chocolate-900 via-chocolate-850 to-chocolate-950 dark:from-black dark:via-chocolate-950 dark:to-chocolate-900" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40" />
        
        {/* Animated Circles */}
        <motion.div 
          animate={{ 
            scale: [1, 1.15, 1],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 left-20 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ 
            scale: [1.15, 1, 1.15],
            rotate: [360, 180, 0],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 right-20 w-96 h-96 bg-chocolate-500/10 rounded-full blur-3xl"
        />
        
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-5xl md:text-7xl font-extrabold font-cairo mb-6 bg-gradient-to-r from-gold-400 via-gold-300 to-gold-500 bg-clip-text text-transparent drop-shadow-2xl">
              {settings.ourStoryTitle || t('ourStory')}
            </h1>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="relative"
          >
            <p className="text-xl md:text-2xl text-white/95 max-w-3xl mx-auto font-medium leading-relaxed font-cairo">
              {settings.ourStorySubtitle || (isAr ? 'قصتنا مع الشوكولاتة الفاخرة المصنوعة يدوياً' : 'Our story with premium handcrafted chocolate')}
            </p>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-1.5 bg-white/70 rounded-full" />
          </div>
        </motion.div>
      </div>

      {/* Quote Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-chocolate-900 dark:bg-chocolate-950 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-12 border border-chocolate-800 dark:border-chocolate-900"
        >
          <div className="text-center font-cairo">
            <div className="text-5xl text-gold-500 mb-2">"</div>
            <p className="text-xl md:text-2xl text-gold-500 dark:text-gold-400 italic leading-relaxed font-semibold">
              {isAr 
                ? 'في شوكو سيليا، نؤمن بأن الشوكولاتة ليست مجرد حلوى، بل هي تجربة سعيدة تلمس القلب وتصنع الذكريات.' 
                : 'At CHOCO-CELIA, we believe that chocolate is not just a treat, but a joyful experience that speaks to the heart.'}
            </p>
            <div className="text-5xl text-gold-500 mt-2 rotate-180">"</div>
          </div>
        </motion.div>
      </div>

      {/* Timeline Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="space-y-16">
          {/* Section 1: The Beginning */}
          <motion.div 
            initial={{ opacity: 0, x: isAr ? 40 : -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className={`flex items-start gap-6 ${isAr ? 'flex-row' : 'flex-row'}`}>
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-gradient-to-br from-gold-500 to-gold-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-gold-500/20">
                  🌱
                </div>
              </div>
              <div className="flex-1 bg-white/80 dark:bg-chocolate-900/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-chocolate-100/50 dark:border-chocolate-800/80">
                <h3 className="text-2xl font-bold text-chocolate-900 dark:text-gold-400 mb-4 font-cairo border-b border-chocolate-50 dark:border-chocolate-800 pb-2">
                  {settings.ourStoryBeginningTitle || (isAr ? 'البداية' : 'The Beginning')}
                </h3>
                <p className="text-base sm:text-lg text-chocolate-700 dark:text-chocolate-200 leading-relaxed font-cairo">
                  {settings.ourStoryBeginning || (isAr 
                    ? 'بدأت قصتنا بشغف كبير بفن الشوكولاتة اليدوية، حيث انطلقت شوكو سيليا من تجارب مطبخنا الصغير لابتكار قطع تتميز بالجمال والمذاق الرائع.' 
                    : 'Our story began with a deep passion for the art of chocolate making, launching Choco-Celia from our kitchen to craft beautiful and delicious creations.')}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Section 2: Our Philosophy */}
          <motion.div 
            initial={{ opacity: 0, x: isAr ? -40 : 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className={`flex items-start gap-6 ${isAr ? 'flex-row-reverse' : 'flex-row-reverse'}`}>
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-gradient-to-br from-chocolate-600 to-chocolate-700 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-chocolate-600/20">
                  💎
                </div>
              </div>
              <div className={`flex-1 bg-white/80 dark:bg-chocolate-900/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-chocolate-100/50 dark:border-chocolate-800/80 ${isAr ? 'text-right' : 'text-left'}`}>
                <h3 className="text-2xl font-bold text-chocolate-900 dark:text-gold-400 mb-4 font-cairo border-b border-chocolate-50 dark:border-chocolate-800 pb-2">
                  {settings.ourStoryPhilosophyTitle || t('ourPhilosophy')}
                </h3>
                <p className="text-base sm:text-lg text-chocolate-700 dark:text-chocolate-200 leading-relaxed font-cairo">
                  {settings.ourStoryPhilosophy || (isAr 
                    ? 'نحن نؤمن بقيمة العمل اليدوي، فكل بار شوكولاتة أو قطعة ميني شوكلت تُصنع يدوياً بدقة تامة لضمان درجة اللمعان والقرمشة الفريدة.' 
                    : 'We believe in the value of handcrafted work, where every single chocolate bar or piece is meticulously made to ensure optimal snap and shine.')}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Feature Cards Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24"
        >
          <AboutCard 
            icon={settings.featureCard1Icon || '🌿'} 
            title={settings.featureCard1Title || t('premiumIngredients')} 
            description={settings.featureCard1Description || t('finestIngredients')} 
          />
          <AboutCard 
            icon={settings.featureCard2Icon || '🖐️'} 
            title={settings.featureCard2Title || t('handmadeWithLove')} 
            description={settings.featureCard2Description || t('craftedInSmallBatches')} 
          />
          <AboutCard 
            icon={settings.featureCard3Icon || '✨'} 
            title={settings.featureCard3Title || t('uniqueFlavors')} 
            description={settings.featureCard3Description || t('innovativeCombinations')} 
          />
        </motion.div>
      </div>
    </div>
  );
}

function AboutCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <motion.div 
      whileHover={{ y: -8, scale: 1.01 }}
      transition={{ duration: 0.3 }}
      className="group relative"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-gold-500/15 to-chocolate-500/15 rounded-3xl blur-xl group-hover:blur-2xl transition-all" />
      <div className="relative text-center p-8 bg-white/95 dark:bg-chocolate-900/90 backdrop-blur-sm rounded-3xl shadow-lg border border-chocolate-100/50 dark:border-chocolate-800/80 h-full flex flex-col justify-center">
        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gold-400 to-gold-600 rounded-2xl flex items-center justify-center text-4xl shadow-md transform group-hover:rotate-6 transition-transform">
          {icon}
        </div>
        <h4 className="text-xl font-bold text-chocolate-900 dark:text-chocolate-100 mb-3 font-cairo">
          {title}
        </h4>
        <p className="text-chocolate-600 dark:text-chocolate-300 leading-relaxed text-sm font-cairo font-medium">
          {description}
        </p>
      </div>
    </motion.div>
  );
}
