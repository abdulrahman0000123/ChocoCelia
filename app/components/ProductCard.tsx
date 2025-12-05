'use client';

import { motion } from 'framer-motion';
import { ShoppingCart, Check } from 'lucide-react';
import Image from 'next/image';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../lib/translations';
import Link from 'next/link';
import { useState } from 'react';

interface Product {
  id: string;
  name: string;
  nameAr?: string;
  description: string;
  descriptionAr?: string;
  price: number;
  image: string;
  category: {
    id: string;
    name: string;
    nameAr?: string;
  };
  tags?: string;
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { locale } = useLanguage();
  const t = (key: string) => translations[locale][key] || key;
  const [isAdded, setIsAdded] = useState(false);

  const displayName = locale === 'ar' && product.nameAr ? product.nameAr : product.name;
  const displayDescription = locale === 'ar' && product.descriptionAr ? product.descriptionAr : product.description;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      name: displayName,
      price: product.price,
      image: product.image,
      quantity: 1
    });
    
    // Show animation
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <Link href={`/menu/${product.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        className="bg-white dark:bg-chocolate-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-chocolate-100 dark:border-chocolate-800 group cursor-pointer"
      >
        <div className="relative h-64 overflow-hidden bg-chocolate-50 dark:bg-chocolate-800">
          {/* Product Image */}
          {product.image ? (
            <img 
              src={product.image} 
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-chocolate-300 dark:text-chocolate-500">
              <span className="text-4xl">🍫</span>
            </div>
          )}
          
          {product.tags && (
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 bg-gold-500 text-white text-xs font-bold rounded-full uppercase tracking-wider">
                {product.tags}
              </span>
            </div>
          )}

          <motion.button 
            onClick={handleAddToCart}
            animate={isAdded ? { scale: [1, 1.2, 1] } : {}}
            className={`absolute bottom-4 right-4 p-3 rounded-full shadow-lg translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ${
              isAdded 
                ? 'bg-green-500 text-white' 
                : 'bg-white dark:bg-chocolate-800 hover:bg-chocolate-600 hover:text-white text-chocolate-600 dark:text-chocolate-200'
            }`}
          >
            {isAdded ? <Check className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
          </motion.button>

          {/* Toast notification */}
          {isAdded && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-full shadow-lg text-sm font-bold z-10"
            >
              ✓ {t('addedToCart')}
            </motion.div>
          )}
        </div>

      <div className="p-6">
        <div className="text-xs text-chocolate-400 dark:text-chocolate-400 font-semibold uppercase tracking-wider mb-2">
          {product.category?.name || t('uncategorized')}
        </div>
        <h3 className="text-xl font-bold text-chocolate-900 dark:text-chocolate-50 mb-2 font-cairo">
          {displayName}
        </h3>
        <p className="text-chocolate-600 dark:text-chocolate-300 text-sm mb-4 line-clamp-2">
          {displayDescription}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-chocolate-800 dark:text-chocolate-200">
            {Number(product.price).toFixed(2)} EGP
          </span>
        </div>
      </div>
    </motion.div>
    </Link>
  );
}
