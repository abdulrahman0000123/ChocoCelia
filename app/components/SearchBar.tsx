'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { motion } from 'framer-motion';

interface SearchBarProps {
  onClose: () => void;
}

interface Product {
  id: string;
  name: string;
  nameAr?: string | null;
  price: number;
  image: string;
}

export function SearchBar({ onClose }: SearchBarProps) {
  const t = useTranslations();
  const locale = useLocale();
  const isAr = locale === 'ar';
  const router = useRouter();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Handle outside click to close
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [onClose]);

  // Debounced search
  useEffect(() => {
    if (query.trim() === '') {
      setResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (err) {
        console.error('Search error', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleResultClick = (productId: string) => {
    router.push(`/menu/${productId}`);
    onClose();
  };

  const suggestions = isAr
    ? ['بوكس', 'ترافل', 'كراميل', 'مكسرات']
    : ['Box', 'Truffle', 'Caramel', 'Nuts'];

  return (
    <div className="fixed inset-0 z-50 bg-chocolate-950/40 backdrop-blur-md flex items-start justify-center pt-24 px-4 sm:px-6">
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        role="dialog"
        aria-modal="true"
        aria-label={t('searchPlaceholder')}
        className="w-full max-w-2xl bg-white dark:bg-chocolate-900 border border-chocolate-100 dark:border-chocolate-850 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Input area */}
        <div className="flex items-center px-6 py-4 border-b border-chocolate-50 dark:border-chocolate-850 gap-3">
          <Search className="w-6 h-6 text-chocolate-400 dark:text-chocolate-500 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder={t('searchPlaceholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-none text-chocolate-900 dark:text-white placeholder-chocolate-400 focus:outline-none text-lg font-medium"
          />
          {loading ? (
            <Loader2 className="w-5 h-5 text-gold-500 animate-spin flex-shrink-0" />
          ) : (
            query && (
              <button
                onClick={() => setQuery('')}
                className="p-1 text-chocolate-400 hover:text-chocolate-600 dark:hover:text-white cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-5 h-5" />
              </button>
            )
          )}
          <button
            onClick={onClose}
            className="p-1 text-chocolate-400 hover:text-chocolate-600 dark:hover:text-white border-l border-chocolate-100 dark:border-chocolate-800 pl-3 cursor-pointer"
            aria-label="Close search overlay"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Results Area */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {query.trim() === '' ? (
            <div>
              <h4 className="text-xs font-bold text-chocolate-400 dark:text-chocolate-500 uppercase tracking-wider mb-3">
                {isAr ? 'اقتراحات البحث' : 'Suggested Searches'}
              </h4>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setQuery(suggestion)}
                    className="px-4 py-2 bg-chocolate-50 hover:bg-chocolate-100 dark:bg-chocolate-800 dark:hover:bg-chocolate-700 text-chocolate-700 dark:text-chocolate-200 text-sm font-bold rounded-full transition-colors cursor-pointer min-h-[36px]"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-chocolate-400 dark:text-chocolate-500 uppercase tracking-wider mb-2">
                {isAr ? 'نتائج البحث' : 'Search Results'}
              </h4>
              <div className="divide-y divide-chocolate-50 dark:divide-chocolate-850">
                {results.map((product) => {
                  const displayName = isAr && product.nameAr ? product.nameAr : product.name;
                  return (
                    <button
                      key={product.id}
                      onClick={() => handleResultClick(product.id)}
                      className="w-full flex items-center gap-4 py-3 text-left hover:bg-chocolate-50/50 dark:hover:bg-chocolate-800/30 px-3 rounded-2xl transition-colors cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-xl bg-chocolate-50 dark:bg-chocolate-800 overflow-hidden flex-shrink-0 relative">
                        <img
                          src={product.image || '/logo.png'}
                          alt={displayName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-bold text-chocolate-900 dark:text-white truncate text-base">
                          {displayName}
                        </h5>
                        <p className="text-sm text-gold-600 dark:text-gold-400 font-extrabold mt-0.5">
                          {Number(product.price).toFixed(2)} EGP
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            !loading && (
              <div className="text-center py-8">
                <p className="text-chocolate-500 dark:text-chocolate-400 text-sm">
                  {t('noResultsFor')}{' '}
                  <span className="font-bold text-chocolate-900 dark:text-white">"{query}"</span>
                </p>
                <div className="mt-6">
                  <h4 className="text-xs font-bold text-chocolate-400 dark:text-chocolate-500 uppercase tracking-wider mb-3">
                    {isAr ? 'جرب البحث عن' : 'Try searching for'}
                  </h4>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => setQuery(suggestion)}
                        className="px-4 py-2 bg-chocolate-50 hover:bg-chocolate-100 dark:bg-chocolate-800 dark:hover:bg-chocolate-700 text-chocolate-700 dark:text-chocolate-200 text-sm font-bold rounded-full transition-colors cursor-pointer min-h-[36px]"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </motion.div>
    </div>
  );
}
