'use client';

import { motion } from 'framer-motion';
import { MapPin, Instagram, Facebook, Twitter } from 'lucide-react';
import { useState, useEffect, use } from 'react';
import { useTranslations, useLocale } from 'next-intl';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default function ContactPage({ params }: PageProps) {
  const { locale } = use(params);
  const t = useTranslations();
  const isAr = locale === 'ar';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const [settings, setSettings] = useState({
    facebook: '',
    instagram: '',
    twitter: '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Failed to fetch settings');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Contact form submitted:', formData);
    alert(t('messageSentSuccess'));
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-chocolate-50/20 dark:bg-chocolate-950/10 py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold font-cairo text-chocolate-900 dark:text-chocolate-100 mb-4"
          >
            {t('getInTouch')}
          </motion.h1>
          <p className="text-gold-600 dark:text-gold-500 text-lg max-w-2xl mx-auto font-cairo font-semibold">
            {t('contactSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
          {/* Contact Info */}
          <motion.div 
            initial={{ opacity: 0, x: isAr ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            <div className="bg-white dark:bg-chocolate-900 p-8 rounded-3xl shadow-lg border border-chocolate-100/50 dark:border-chocolate-800/80">
              <h3 className="text-2xl font-bold text-chocolate-900 dark:text-chocolate-100 mb-6 font-cairo border-b border-chocolate-50 dark:border-chocolate-800 pb-4">{t('contactInfo')}</h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-chocolate-50 dark:bg-chocolate-800 p-3 rounded-full text-chocolate-600 dark:text-chocolate-300">
                    <MapPin className="w-6 h-6 text-gold-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-chocolate-800 dark:text-chocolate-200 font-cairo">{t('location')}</h4>
                    <p className="text-chocolate-600 dark:text-chocolate-300 font-cairo mt-1" dir={isAr ? 'rtl' : 'ltr'}>
                      {isAr ? 'محافظة بني سويف، جمهورية مصر العربية' : 'Beni-Suef Governorate, Egypt'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-chocolate-55 dark:border-chocolate-800">
                <h4 className="font-bold text-chocolate-800 dark:text-chocolate-200 mb-4 font-cairo">{t('followUs')}</h4>
                <div className="flex gap-4">
                  {settings.instagram && (
                    <a 
                      href={settings.instagram} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-chocolate-600 hover:bg-gold-600 text-white p-3 rounded-full transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center shadow-md"
                      aria-label="Instagram"
                    >
                      <Instagram className="w-5 h-5" />
                    </a>
                  )}
                  {settings.facebook && (
                    <a 
                      href={settings.facebook} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-chocolate-600 hover:bg-gold-600 text-white p-3 rounded-full transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center shadow-md"
                      aria-label="Facebook"
                    >
                      <Facebook className="w-5 h-5" />
                    </a>
                  )}
                  {settings.twitter && (
                    <a 
                      href={settings.twitter} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-chocolate-600 hover:bg-gold-600 text-white p-3 rounded-full transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center shadow-md"
                      aria-label="Twitter"
                    >
                      <Twitter className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: isAr ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-chocolate-900 p-8 rounded-3xl shadow-lg border border-chocolate-100/50 dark:border-chocolate-800/80"
          >
            <h3 className="text-2xl font-bold text-chocolate-900 dark:text-chocolate-100 mb-6 font-cairo border-b border-chocolate-50 dark:border-chocolate-800 pb-4">{t('sendUsMessage')}</h3>
            <form onSubmit={handleSubmit} className="space-y-6 font-cairo">
              <div>
                <label className="block text-sm font-bold text-chocolate-700 dark:text-chocolate-300 mb-2">{t('name')}</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-chocolate-200 dark:border-chocolate-700 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none transition-colors bg-chocolate-50/20 dark:bg-chocolate-800/20 text-black dark:text-chocolate-100 font-semibold text-base min-h-[44px]"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-chocolate-700 dark:text-chocolate-300 mb-2">{t('email')}</label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-chocolate-200 dark:border-chocolate-700 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none transition-colors bg-chocolate-50/20 dark:bg-chocolate-800/20 text-black dark:text-chocolate-100 font-semibold text-base min-h-[44px]"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-chocolate-700 dark:text-chocolate-300 mb-2">{t('message')}</label>
                <textarea
                  required
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl border border-chocolate-200 dark:border-chocolate-700 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none transition-colors bg-chocolate-50/20 dark:bg-chocolate-800/20 text-black dark:text-chocolate-100 font-semibold text-base"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-chocolate-700 to-chocolate-800 dark:from-gold-600 dark:to-gold-500 hover:from-chocolate-800 text-white py-4 rounded-full font-bold transition-all shadow-lg hover:shadow-xl active:scale-[0.98] cursor-pointer min-h-[44px]"
              >
                {t('sendMessage')}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
