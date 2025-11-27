'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Minus, Plus, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';

export default function ProductDetailsPage() {
  const params = useParams();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const { locale } = useLanguage();
  
  useEffect(() => {
    fetchProduct();
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const products = await res.json();
        const foundProduct = products.find((p: any) => p.id === params.id);
        if (foundProduct) {
          setProduct(foundProduct);
        }
      }
    } catch (error) {
      console.error('Failed to fetch product');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      const displayName = locale === 'ar' && product.nameAr ? product.nameAr : product.name;
      addItem({
        id: product.id,
        name: displayName,
        price: product.price,
        image: product.image,
        quantity: quantity
      });
    }
  };

  const displayName = product && locale === 'ar' && product.nameAr ? product.nameAr : product?.name;
  const displayDescription = product && locale === 'ar' && product.descriptionAr ? product.descriptionAr : product?.description;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-chocolate-50 dark:bg-chocolate-950">
        <Loader2 className="w-8 h-8 animate-spin text-chocolate-600 dark:text-gold-500" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-chocolate-50 dark:bg-chocolate-950">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-chocolate-900 dark:text-chocolate-100 mb-4">Product not found</h1>
          <Link href="/menu" className="text-chocolate-600 dark:text-gold-500 hover:text-chocolate-800 dark:hover:text-gold-400">
            Return to menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-chocolate-50 via-white to-chocolate-50/50 dark:from-chocolate-950 dark:via-chocolate-900 dark:to-chocolate-950 pb-20 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link 
          href="/menu" 
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-chocolate-800/80 backdrop-blur-sm text-chocolate-700 dark:text-chocolate-200 hover:bg-white dark:hover:bg-chocolate-800 hover:text-chocolate-900 dark:hover:text-white transition-all shadow-md hover:shadow-lg"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Menu</span>
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 mt-8">
          {/* Image Section */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-gold-500/20 to-chocolate-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all" />
            <div className="relative bg-white/90 dark:bg-chocolate-800/90 backdrop-blur-sm rounded-3xl aspect-square flex items-center justify-center overflow-hidden shadow-2xl">
              {product.image ? (
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-9xl">🍫</span>
              )}
              {product.tags && (
                <div className="absolute top-6 left-6">
                  <span className="px-4 py-2 bg-gradient-to-r from-gold-500 to-gold-600 text-white text-sm font-bold rounded-full uppercase tracking-wider shadow-lg">
                    {product.tags}
                  </span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Details Section */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col justify-center"
          >
            <div className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider mb-3 px-3 py-1.5 bg-chocolate-100 dark:bg-chocolate-800 text-chocolate-600 dark:text-gold-400 rounded-full w-fit">
              {product.category} Chocolate
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-chocolate-900 to-chocolate-700 dark:from-chocolate-100 dark:to-gold-300 bg-clip-text text-transparent mb-6 font-serif leading-tight">
              {displayName}
            </h1>
            <p className="text-lg text-chocolate-700 dark:text-chocolate-200 mb-8 leading-relaxed">
              {displayDescription}
            </p>

            {(product.weight || product.ingredients) && (
              <div className="border-y border-chocolate-200 dark:border-chocolate-700 py-6 mb-8 space-y-4 bg-chocolate-50/50 dark:bg-chocolate-800/30 px-4 rounded-lg">
                {product.weight && (
                  <div className="flex justify-between text-chocolate-900 dark:text-chocolate-100">
                    <span className="font-bold">Weight:</span>
                    <span className="text-chocolate-700 dark:text-chocolate-300">{product.weight}</span>
                  </div>
                )}
                {product.ingredients && (
                  <div className="flex justify-between text-chocolate-900 dark:text-chocolate-100">
                    <span className="font-bold">Ingredients:</span>
                    <span className="text-right max-w-[60%] text-chocolate-700 dark:text-chocolate-300">{product.ingredients}</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between mb-8 bg-white/80 dark:bg-chocolate-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg">
              <div>
                <div className="text-sm text-chocolate-600 dark:text-chocolate-300 mb-1">Total Price</div>
                <div className="text-3xl font-bold text-chocolate-900 dark:text-white">
                  {(Number(product.price) * quantity).toFixed(2)} EGP
                </div>
              </div>
              
              <div className="flex items-center bg-chocolate-100 dark:bg-chocolate-700 rounded-2xl p-1.5 shadow-inner">
                <button 
                  onClick={() => handleQuantityChange(-1)}
                  className="p-2.5 rounded-xl hover:bg-white dark:hover:bg-chocolate-600 text-chocolate-700 dark:text-chocolate-200 transition-all active:scale-95"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="w-12 text-center font-bold text-xl text-chocolate-900 dark:text-chocolate-100">{quantity}</span>
                <button 
                  onClick={() => handleQuantityChange(1)}
                  className="p-2.5 rounded-xl hover:bg-white dark:hover:bg-chocolate-600 text-chocolate-700 dark:text-chocolate-200 transition-all active:scale-95"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            <button 
              onClick={handleAddToCart}
              className="w-full bg-gradient-to-r from-chocolate-600 to-chocolate-700 dark:from-gold-600 dark:to-gold-500 text-white py-5 rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-chocolate-600/50 dark:hover:shadow-gold-500/50 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-xl flex items-center justify-center gap-3"
            >
              <ShoppingCart className="w-6 h-6" />
              Add to Cart
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
