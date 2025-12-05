'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Facebook, Instagram, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

// Default social links
const DEFAULT_SOCIAL_LINKS = {
  facebook: 'https://www.facebook.com/profile.php?id=61582630209700',
  instagram: 'https://www.instagram.com/chococelia2025/',
};

export function Footer() {
  const [settings, setSettings] = useState(DEFAULT_SOCIAL_LINKS);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings({
          facebook: data.facebook || DEFAULT_SOCIAL_LINKS.facebook,
          instagram: data.instagram || DEFAULT_SOCIAL_LINKS.instagram,
        });
      }
    } catch (error) {
      console.error('Failed to fetch settings');
    }
  };

  return (
    <footer className="relative bg-gradient-to-b from-chocolate-900 via-chocolate-950 to-black dark:from-chocolate-950 dark:via-black dark:to-black overflow-hidden">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-gold-500/5 via-transparent to-gold-500/5 pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-gold-500 to-transparent opacity-70" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="md:col-span-2"
          >
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-3xl font-bold font-serif bg-gradient-to-r from-gold-400 via-gold-300 to-gold-400 bg-clip-text text-transparent">
                CHOCO-CELIA
              </h3>
              <Heart className="w-6 h-6 text-gold-500 fill-gold-500 animate-pulse" />
            </div>
            <p className="text-chocolate-300 text-base mb-6 leading-relaxed font-[family-name:var(--font-cairo)]" dir="rtl">
              أهلا بيكم في عالم الشوكولاتة السعيد!
              <br />
              هتلاقوا هنا بارات شوكولاتة وميني شوكلت هاند ميد،
              <br />
              بأشكال وأطعم مختلفة مخصّصة لكل لحظاتكم الحلوة ومناسباتكم الخاصة.
              <br />
              كل قطعة معمولة بحب ومتغلفة بشياكة. 🍫♥️
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h4 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
              Quick Links
              <div className="h-[2px] flex-1 bg-gradient-to-r from-gold-500 to-transparent" />
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/menu" className="text-chocolate-300 hover:text-gold-400 transition-all hover:translate-x-1 inline-block">
                  → Menu
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-chocolate-300 hover:text-gold-400 transition-all hover:translate-x-1 inline-block">
                  → About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-chocolate-300 hover:text-gold-400 transition-all hover:translate-x-1 inline-block">
                  → Contact
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Social Media */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h4 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
              Follow Us
              <div className="h-[2px] flex-1 bg-gradient-to-r from-gold-500 to-transparent" />
            </h4>
            <div className="flex gap-3">
              <motion.a
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                href={settings.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-gradient-to-br from-chocolate-800 to-chocolate-900 hover:from-gold-500 hover:to-gold-600 rounded-xl transition-all shadow-lg hover:shadow-gold-500/50"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5 text-white" />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                href={settings.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-gradient-to-br from-chocolate-800 to-chocolate-900 hover:from-gold-500 hover:to-gold-600 rounded-xl transition-all shadow-lg hover:shadow-gold-500/50"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5 text-white" />
              </motion.a>
            </div>
            
            {/* Newsletter CTA */}
            <div className="mt-8 p-4 bg-gradient-to-br from-gold-500/10 to-gold-600/5 border border-gold-500/20 rounded-xl">
              <p className="text-sm text-chocolate-300 mb-2">Stay Updated</p>
              <p className="text-xs text-chocolate-400">Follow us for exclusive offers & new collections</p>
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="pt-8 border-t border-chocolate-800/50"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-chocolate-400 text-sm text-center md:text-left">
              &copy; {new Date().getFullYear()} CHOCO-CELIA. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-chocolate-400 text-sm">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-gold-500 fill-gold-500 animate-pulse" />
              <span>and lots of chocolate</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Decorative bottom gradient */}
      <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-gold-500 to-transparent opacity-30" />
    </footer>
  );
}
