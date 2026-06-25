'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { ProductCard } from './ProductCard';

interface Product {
  id: string;
  name: string;
  nameAr?: string | null;
  description: string;
  descriptionAr?: string | null;
  price: number;
  image: string;
  category: {
    id: string;
    name: string;
    nameAr?: string | null;
  };
  tags?: string | null;
}

interface FeatureCard {
  icon: string;
  title: string;
  description: string;
}

interface HomeClientProps {
  featuredProducts: Product[];
  featureCards: FeatureCard[];
}

export function HomeClient({ featuredProducts, featureCards }: HomeClientProps) {
  const t = useTranslations();

  return (
    <div className="flex flex-col gap-20">
      {/* Featured Products Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent mb-4 font-cairo">
            {t('ourFavorites')}
          </h2>
          <p className="text-chocolate-600 dark:text-chocolate-400 max-w-2xl mx-auto font-medium">
            {t('discoverHandcrafted')}
          </p>
        </motion.div>

        {featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-chocolate-50/50 dark:bg-chocolate-900/30 rounded-3xl p-8 border border-chocolate-100/50 dark:border-chocolate-850">
            <p className="text-chocolate-500 dark:text-chocolate-400 mb-6 font-medium text-lg">
              {t('yourCartIsEmpty')}
            </p>
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gold-600 hover:bg-gold-700 text-white rounded-full font-bold shadow-lg transition-colors cursor-pointer min-h-[44px]"
            >
              <ShoppingBag className="w-5 h-5" />
              {t('browseMenu')}
            </Link>
          </div>
        )}

        {/* View All Button */}
        {featuredProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center mt-12"
          >
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 px-8 py-4 bg-chocolate-700 hover:bg-chocolate-800 dark:bg-chocolate-800 dark:hover:bg-chocolate-700 text-white rounded-full font-bold shadow-lg hover:gap-3 transition-all cursor-pointer min-h-[44px]"
            >
              {t('viewAllProducts')}
              <span className="text-gold-400">→</span>
            </Link>
          </motion.div>
        )}
      </section>

      {/* Feature Cards Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent mb-4 font-cairo">
            {t('whyChooseUs')}
          </h2>
          <p className="text-chocolate-600 dark:text-chocolate-400 max-w-2xl mx-auto font-medium">
            {t('whatMakesSpecial')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featureCards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative bg-gradient-to-br from-chocolate-800 to-chocolate-900 dark:from-chocolate-900 dark:to-black rounded-3xl p-8 text-center overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border border-chocolate-800/20"
            >
              {/* Background decoration */}
              <div className="absolute inset-0 bg-gradient-to-br from-gold-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Icon */}
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="relative z-10 text-5xl mb-6 flex justify-center"
              >
                {card.icon}
              </motion.div>

              {/* Title */}
              <h3 className="relative z-10 text-xl font-bold text-white mb-3 group-hover:text-gold-400 transition-colors font-cairo">
                {card.title}
              </h3>

              {/* Description */}
              <p className="relative z-10 text-chocolate-200 text-sm leading-relaxed font-cairo">
                {card.description}
              </p>

              {/* Bottom accent */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
