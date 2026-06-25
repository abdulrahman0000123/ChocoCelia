'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Minus, Plus, ArrowLeft, Check, Award, Truck, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { StarRating } from './StarRating';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';
import { WishlistButton } from './WishlistButton';
import Image from 'next/image';
import { ProductImageGallery } from './ProductImageGallery';
import { ProductBadge } from './ProductBadge';
import { StockStatus } from './StockStatus';
import { EstimatedDelivery } from './EstimatedDelivery';
import { ShippingInfo } from './ShippingInfo';

interface Product {
  id: string;
  name: string;
  nameAr?: string | null;
  description: string;
  descriptionAr?: string | null;
  price: number;
  image: string;
  images?: string[];
  weight?: string | null;
  ingredients?: string | null;
  category: {
    id: string;
    name: string;
    nameAr?: string | null;
  };
  tags?: string | null;
  badge?: string | null;
  stock?: number | null;
}

interface ProductDetailsClientProps {
  product: Product;
  reviews?: any[];
  locale: string;
}

export function ProductDetailsClient({ product, reviews = [], locale }: ProductDetailsClientProps) {
  const t = useTranslations();
  const isAr = locale === 'ar';
  const { addItem } = useCart();
  
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  
  const mainAddToCartRef = useRef<HTMLButtonElement>(null);

  const averageRating = reviews.length > 0
    ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1))
    : 0;

  const { addProduct } = useRecentlyViewed();

  useEffect(() => {
    if (product.id) {
      addProduct(product.id);
    }
  }, [product.id]);

  // Scroll listener to toggle sticky add to cart bar on mobile
  useEffect(() => {
    const handleScroll = () => {
      if (!mainAddToCartRef.current) return;
      const rect = mainAddToCartRef.current.getBoundingClientRect();
      // Show sticky bar when the main add to cart button goes out of view (scrolled past)
      // and only on mobile screens (viewport width < 768px)
      if (rect.bottom < 0 && window.innerWidth < 768) {
        setShowStickyBar(true);
      } else {
        setShowStickyBar(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const displayName = isAr && product.nameAr ? product.nameAr : product.name;
  const displayDescription = isAr && product.descriptionAr ? product.descriptionAr : product.description;
  const displayCategory = isAr && product.category?.nameAr ? product.category.nameAr : (product.category?.name || t('chocolate'));

  const triggerHapticFeedback = () => {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(10); // Subtle 10ms vibration
    }
  };

  const handleQuantityChange = (delta: number) => {
    triggerHapticFeedback();
    const newQuantity = quantity + delta;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: displayName,
      price: product.price,
      image: product.image,
      quantity: quantity
    });
    
    triggerHapticFeedback();
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 mt-8">
      {/* Image Gallery Column */}
      <motion.div 
        initial={{ opacity: 0, x: isAr ? 20 : -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full relative"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-gold-500/10 to-chocolate-500/10 rounded-3xl blur-xl" />
        <div className="relative">
          <ProductImageGallery mainImage={product.image} images={product.images} name={displayName} locale={locale} />
          {product.tags && (
            <div className={`absolute top-6 ${isAr ? 'right-6' : 'left-6'} z-20`}>
              <span className="px-4 py-2 bg-gradient-to-r from-gold-500 to-gold-600 text-white text-sm font-bold rounded-full uppercase tracking-wider shadow-lg">
                {product.tags}
              </span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Details Column */}
      <motion.div 
        initial={{ opacity: 0, x: isAr ? -20 : 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col justify-center"
      >
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-3 py-1.5 bg-chocolate-100/80 dark:bg-chocolate-800 text-chocolate-700 dark:text-gold-400 rounded-full w-fit">
            {displayCategory}
          </div>
          {product.badge && <ProductBadge badge={product.badge} locale={locale} />}
          <StockStatus stock={product.stock !== undefined ? product.stock : null} locale={locale} />
        </div>
        
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-chocolate-900 dark:text-white mb-4 font-cairo leading-tight">
          {displayName}
        </h1>
        
        {reviews.length > 0 && (
          <div className="flex items-center gap-2 mb-6">
            <StarRating rating={averageRating} size={16} />
            <span className="text-sm font-bold text-chocolate-600 dark:text-chocolate-400">
              {averageRating} ({reviews.length} {t('reviews')})
            </span>
          </div>
        )}
        
        <p className="text-base sm:text-lg text-chocolate-600 dark:text-chocolate-300 mb-8 leading-relaxed">
          {displayDescription}
        </p>

        {/* Specifications */}
        {(product.weight || product.ingredients) && (
          <div className="border border-chocolate-100/70 dark:border-chocolate-800/60 rounded-2xl p-6 mb-8 space-y-4 bg-chocolate-50/20 dark:bg-chocolate-900/10">
            {product.weight && (
              <div className="flex justify-between items-center text-chocolate-900 dark:text-chocolate-100 text-sm">
                <span className="font-bold">{t('weight')}:</span>
                <span className="text-chocolate-600 dark:text-chocolate-300 font-medium">{product.weight}</span>
              </div>
            )}
            {product.ingredients && (
              <div className="flex justify-between items-start text-chocolate-900 dark:text-chocolate-100 text-sm gap-4">
                <span className="font-bold flex-shrink-0">{t('ingredients')}:</span>
                <span className={`text-chocolate-600 dark:text-chocolate-300 font-medium ${isAr ? 'text-left' : 'text-right'}`}>
                  {product.ingredients}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Quantity & Price Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 bg-white dark:bg-chocolate-900/60 border border-chocolate-100/50 dark:border-chocolate-800/80 p-6 rounded-3xl shadow-lg">
          <div>
            <div className="text-xs text-chocolate-500 dark:text-chocolate-400 font-bold uppercase tracking-wider mb-1">
              {t('totalPrice')}
            </div>
            <div className="text-3xl font-extrabold text-chocolate-900 dark:text-white">
              {(Number(product.price) * quantity).toFixed(2)} EGP
            </div>
          </div>
          
          {/* Quantity Selector */}
          <div className="flex items-center bg-chocolate-50 dark:bg-chocolate-800/80 border border-chocolate-100/40 dark:border-chocolate-800/40 rounded-2xl p-1.5 shadow-inner w-fit">
            <button 
              onClick={() => handleQuantityChange(-1)}
              className="p-3 rounded-xl hover:bg-white dark:hover:bg-chocolate-700 text-chocolate-700 dark:text-chocolate-200 hover:shadow-sm transition-all active:scale-90 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-12 text-center font-extrabold text-lg text-chocolate-950 dark:text-chocolate-100 select-none">
              {quantity}
            </span>
            <button 
              onClick={() => handleQuantityChange(1)}
              className="p-3 rounded-xl hover:bg-white dark:hover:bg-chocolate-700 text-chocolate-700 dark:text-chocolate-200 hover:shadow-sm transition-all active:scale-90 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Add to Cart CTA & Wishlist Button */}
        <div className="flex gap-4 w-full">
          <motion.button 
            ref={mainAddToCartRef}
            onClick={handleAddToCart}
            animate={isAdded ? { scale: [1, 1.02, 1] } : {}}
            className={`flex-1 py-4.5 rounded-2xl font-bold text-lg transition-all transform hover:scale-[1.01] active:scale-[0.99] shadow-xl flex items-center justify-center gap-3 cursor-pointer min-h-[50px] ${
              isAdded
                ? 'bg-green-600 text-white'
                : 'bg-gradient-to-r from-chocolate-700 via-chocolate-600 to-chocolate-750 dark:from-gold-600 dark:to-gold-500 text-white hover:shadow-2xl hover:shadow-chocolate-600/40 dark:hover:shadow-gold-500/40'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-6 h-6 animate-pulse" />
                {t('addedToCart')}
              </>
            ) : (
              <>
                <ShoppingCart className="w-6 h-6" />
                {t('addToCart')}
              </>
            )}
          </motion.button>
          
          <WishlistButton productId={product.id} className="border border-chocolate-100 dark:border-chocolate-800" size={24} />
        </div>

        {/* Delivery Estimates */}
        <div className="mt-8">
          <EstimatedDelivery locale={locale} />
        </div>

        {/* Shipping & Quality Info */}
        <div className="mt-6">
          <ShippingInfo locale={locale} />
        </div>

        {/* Extra trust elements on details */}
        <div className="grid grid-cols-3 gap-2 mt-8 border-t border-chocolate-50 dark:border-chocolate-800/40 pt-6 text-center text-xs text-chocolate-500 dark:text-chocolate-400 font-medium">
          <div className="flex flex-col items-center gap-1">
            <Award className="w-5 h-5 text-gold-500" />
            <span>{isAr ? 'جودة فاخرة' : 'Premium Quality'}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Truck className="w-5 h-5 text-gold-500" />
            <span>{isAr ? 'توصيل مبرد' : 'Fresh Delivery'}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <ShieldCheck className="w-5 h-5 text-gold-500" />
            <span>{isAr ? 'دفع آمن' : 'Secure Order'}</span>
          </div>
        </div>
      </motion.div>

      {/* Mobile Sticky Add to Cart Bar */}
      <AnimatePresence>
        {showStickyBar && (
          <motion.div
            initial={{ y: 80 }}
            animate={{ y: 0 }}
            exit={{ y: 80 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-chocolate-900/95 backdrop-blur-md border-t border-chocolate-100 dark:border-chocolate-800/60 p-4 shadow-2xl flex items-center justify-between gap-4 pb-safe md:hidden"
            style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
          >
            <div className="flex flex-col">
              <span className="text-xs text-chocolate-500 dark:text-chocolate-400 font-bold uppercase truncate max-w-[150px]">
                {displayName}
              </span>
              <span className="text-lg font-extrabold text-chocolate-900 dark:text-white">
                {(Number(product.price) * quantity).toFixed(2)} EGP
              </span>
            </div>
            
            <button
              onClick={handleAddToCart}
              className={`flex-1 py-3 px-5 rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                isAdded
                  ? 'bg-green-600 text-white'
                  : 'bg-gold-600 text-white active:scale-95'
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-4 h-4" />
                  {t('addedToCart')}
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  {t('addToCart')}
                </>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
