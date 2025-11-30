'use client';

import { useState, useEffect } from 'react';
import { ProductCard } from '../components/ProductCard';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export default function MenuPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Failed to fetch categories');
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(p => p.category?.name === selectedCategory);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-chocolate-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-chocolate-50/30 pb-20">
      {/* Header */}
      <div className="bg-chocolate-900 text-white py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold font-serif mb-4">Our Menu</h1>
        <p className="text-chocolate-200 text-lg max-w-2xl mx-auto px-4">
          Discover our handcrafted collection of premium chocolates.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        {/* Filters */}
        <div className="bg-white dark:bg-chocolate-900 p-4 rounded-xl shadow-lg border border-chocolate-100 dark:border-chocolate-800 mb-12 flex flex-wrap justify-center gap-4">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
              selectedCategory === 'All'
                ? 'bg-chocolate-600 text-white shadow-md'
                : 'bg-chocolate-50 text-chocolate-600 hover:bg-chocolate-100'
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.name)}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                selectedCategory === category.name
                  ? 'bg-chocolate-600 text-white shadow-md'
                  : 'bg-chocolate-50 text-chocolate-600 hover:bg-chocolate-100'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-20 text-chocolate-400">
            <p className="text-xl">No products found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
