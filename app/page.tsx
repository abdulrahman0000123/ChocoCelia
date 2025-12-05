'use client';

import { Hero } from "./components/Hero";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingBag, Star } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  nameAr?: string;
  description: string;
  price: number;
  image: string;
  tags?: string;
}

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

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
          <h2 className="text-3xl sm:text-4xl font-bold text-chocolate-900 dark:text-chocolate-100 mb-4 font-serif">
            Our Favorites
          </h2>
          <p className="text-chocolate-600 dark:text-chocolate-400 max-w-2xl mx-auto">
            Discover our most loved chocolates, handcrafted with care
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
                          View Details
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
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-chocolate-800 to-chocolate-900 text-white rounded-full font-semibold hover:from-chocolate-700 hover:to-chocolate-800 transition-all shadow-lg hover:shadow-xl"
            >
              View All Products
              <span className="text-gold-400">→</span>
            </Link>
          </motion.div>
        )}
      </section>
    </div>
  );
}
