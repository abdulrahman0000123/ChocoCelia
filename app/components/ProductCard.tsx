'use client';

import { motion } from 'framer-motion';
import { ShoppingCart, Check, Star } from 'lucide-react';
import Image from 'next/image';
import { useCart } from '../context/CartContext';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useState } from 'react';
import { WishlistButton } from './WishlistButton';

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

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const locale = useLocale();
  const t = useTranslations();
  const [isAdded, setIsAdded] = useState(false);

  const isAr = locale === 'ar';
  const displayName = isAr && product.nameAr ? product.nameAr : product.name;
  const displayDescription = isAr && product.descriptionAr ? product.descriptionAr : product.description;
  const displayCategory = isAr && product.category?.nameAr ? product.category.nameAr : (product.category?.name || t('uncategorized'));

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
    <Link href={`/menu/${product.id}`} className="block group">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        whileHover={{ y: -6 }}
        transition={{ duration: 0.4 }}
        className="bg-white dark:bg-chocolate-900 rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-chocolate-100/50 dark:border-chocolate-800/80 cursor-pointer flex flex-col h-full"
      >
        <div className="relative h-64 w-full overflow-hidden bg-chocolate-50 dark:bg-chocolate-800">
          {/* Product Image */}
          {product.image ? (
            <Image 
              src={product.image} 
              alt={displayName}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              priority={false}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-chocolate-300 dark:text-chocolate-500">
              <span className="text-5xl">🍫</span>
            </div>
          )}
          
          {/* Tags */}
          {product.tags && (
            <div className={`absolute top-4 ${isAr ? 'right-4' : 'left-4'}`}>
              <span className="px-3.5 py-1 bg-gradient-to-r from-gold-500 to-gold-600 text-white text-xs font-bold rounded-full shadow-md">
                {product.tags}
              </span>
            </div>
          )}

          {/* Wishlist Heart Overlay */}
          <div className={`absolute top-4 ${isAr ? 'left-4' : 'right-4'} z-20`}>
            <WishlistButton productId={product.id} size={18} />
          </div>

          {/* Quick Add to Cart Button */}
          <button 
            onClick={handleAddToCart}
            className={`absolute bottom-4 ${isAr ? 'left-4' : 'right-4'} p-3.5 rounded-full shadow-lg z-20 transition-all duration-300 hover:scale-110 active:scale-95 ${
              isAdded 
                ? 'bg-green-500 text-white' 
                : 'bg-white dark:bg-chocolate-800 hover:bg-gold-600 hover:text-white text-chocolate-700 dark:text-chocolate-100'
            }`}
            aria-label={t('addToCart')}
          >
            {isAdded ? <Check className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
          </button>
        </div>

        {/* Card Details */}
        <div className="p-6 flex flex-col flex-grow justify-between">
          <div>
            <div className="text-xs text-gold-600 dark:text-gold-400 font-bold uppercase tracking-wider mb-2">
              {displayCategory}
            </div>
            
            <h3 className="text-xl font-bold text-chocolate-900 dark:text-chocolate-100 mb-2 font-cairo group-hover:text-gold-600 dark:group-hover:text-gold-500 transition-colors line-clamp-1">
              {displayName}
            </h3>
            
            <p className="text-chocolate-600 dark:text-chocolate-300 text-sm mb-4 line-clamp-2 leading-relaxed">
              {displayDescription}
            </p>
          </div>

          <div className="flex items-center justify-between border-t border-chocolate-50 dark:border-chocolate-800/40 pt-4 mt-auto">
            <span className="text-xl font-extrabold text-chocolate-900 dark:text-white">
              {Number(product.price).toFixed(2)} EGP
            </span>
            <div className="flex items-center gap-1 text-gold-500">
              <Star className="w-4 h-4 fill-current" />
              <span className="text-sm font-bold">4.9</span>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
