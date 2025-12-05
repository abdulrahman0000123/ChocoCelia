'use client';

import { Hero } from "./components/Hero";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingBag, Star, Sparkles } from 'lucide-react';
import { useLanguage } from './context/LanguageContext';

interface Product {
  id: string;
  name: string;
  nameAr?: string;
  description: string;
  price: number;
  image: string;
  tags?: string;
}

interface FeatureCard {
  icon: string;
  title: string;
  description: string;
}

interface Settings {
  featureCard1Icon: string;
  featureCard1Title: string;
  featureCard1Description: string;
  featureCard2Icon: string;
  featureCard2Title: string;
  featureCard2Description: string;
  featureCard3Icon: string;
  featureCard3Title: string;
  featureCard3Description: string;
}

export default function Home() {
  const { t } = useLanguage();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [featureCards, setFeatureCards] = useState<FeatureCard[]>([]);

  useEffect(() => {
    // Set default feature cards from translations
    setFeatureCards([
      { icon: '🌿', title: t('premiumIngredients'), description: t('finestIngredients') },
      { icon: '🤎', title: t('handmadeWithLove'), description: t('craftedInSmallBatches') },
      { icon: '✨', title: t('uniqueFlavors'), description: t('innovativeCombinations') },
    ]);

    fetchFeaturedProducts();
    fetchSettings();
  }, [t]);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.featureCard1Title || data.featureCard2Title || data.featureCard3Title) {
          setFeatureCards([
            {
              icon: data.featureCard1Icon || '🌿',
              title: data.featureCard1Title || t('premiumIngredients'),
              description: data.featureCard1Description || t('finestIngredients'),
            },
            {
              icon: data.featureCard2Icon || '🤎',
              title: data.featureCard2Title || t('handmadeWithLove'),
              description: data.featureCard2Description || t('craftedInSmallBatches'),
            },
            {
              icon: data.featureCard3Icon || '✨',
              title: data.featureCard3Title || t('uniqueFlavors'),
              description: data.featureCard3Description || t('innovativeCombinations'),
            },
          ]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch settings');
    }
  };

  const fetchFeaturedProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const products = await res.json();
        // Get first 3 products or products with "Best Seller" or "New" tags
        const featured = products
          .filter((p: Product) => p.tags?.includes('Best Seller') || p.tags?.includes('New'))
          .slice(0, 3);
        
        // If not enough featured, fill with first products
        if (featured.length < 3) {
          const remaining = products
            .filter((p: Product) => !featured.find((f: Product) => f.id === p.id))
            .slice(0, 3 - featured.length);
          setFeaturedProducts([...featured, ...remaining]);
        } else {
          setFeaturedProducts(featured);
        }
      }
    } catch (error) {
      console.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-16 pb-16">
      <Hero />
      
      {/* Featured Products Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-chocolate-900 dark:text-chocolate-100 mb-4 font-cairo">
            {t('ourFavorites')}
          </h2>
          <p className="text-chocolate-600 dark:text-chocolate-400 max-w-2xl mx-auto">
            {t('discoverHandcrafted')}
          </p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-chocolate-100 dark:bg-chocolate-800 rounded-2xl h-80 animate-pulse" />
            ))}
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={`/menu/${product.id}`}>
                  <div className="group relative bg-white dark:bg-chocolate-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-chocolate-100 dark:border-chocolate-800">
                    {/* Product Image */}
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Tags */}
                      {product.tags && (
                        <div className="absolute top-3 left-3 flex gap-2">
                          {product.tags.split(',').map((tag, i) => (
                            <span
                              key={i}
                              className="px-3 py-1 bg-gold-500 text-white text-xs font-bold rounded-full shadow-lg"
                            >
                              {tag.trim()}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Quick View Button */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
                        <span className="px-6 py-2 bg-white text-chocolate-900 rounded-full font-semibold text-sm shadow-lg flex items-center gap-2">
                          <ShoppingBag className="w-4 h-4" />
                          {t('viewDetails')}
                        </span>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-lg text-chocolate-900 dark:text-white group-hover:text-gold-600 transition-colors">
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-1 text-gold-500">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="text-sm font-medium">4.9</span>
                        </div>
                      </div>
                      <p className="text-chocolate-500 dark:text-chocolate-400 text-sm mt-2 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-xl font-bold text-gold-600">
                          {product.price.toFixed(2)} EGP
                        </span>
                        <span className="text-xs text-chocolate-400 dark:text-chocolate-500">
                          Free Delivery
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-chocolate-500 dark:text-chocolate-400 mb-4">No products available yet</p>
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gold-500 text-white rounded-full font-semibold hover:bg-gold-600 transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              Browse Menu
            </Link>
          </div>
        )}

        {/* View All Button */}
        {featuredProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center mt-12"
          >
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 px-8 py-3 bg-chocolate-600 dark:bg-chocolate-700 text-white rounded-full font-bold hover:bg-chocolate-700 dark:hover:bg-chocolate-600 transition-all hover:gap-3 shadow-lg"
            >
              {t('viewAllProducts')}
              <span className="text-gold-400">→</span>
            </Link>
          </motion.div>
        )}
      </section>

      {/* Feature Cards Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-chocolate-900 dark:text-chocolate-100 mb-4 font-cairo">
            {t('whyChooseUs')}
          </h2>
          <p className="text-chocolate-600 dark:text-chocolate-400 max-w-2xl mx-auto">
            {t('whatMakesSpecial')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featureCards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative bg-gradient-to-br from-chocolate-800 to-chocolate-900 rounded-2xl p-8 text-center overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              {/* Background decoration */}
              <div className="absolute inset-0 bg-gradient-to-br from-gold-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Icon */}
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="relative z-10 text-5xl mb-6"
              >
                {card.icon}
              </motion.div>

              {/* Title */}
              <h3 className="relative z-10 text-xl font-bold text-white mb-3 group-hover:text-gold-400 transition-colors">
                {card.title}
              </h3>

              {/* Description */}
              <p className="relative z-10 text-chocolate-300 text-sm leading-relaxed">
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
