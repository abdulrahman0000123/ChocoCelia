'use client';

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'choco_wishlist';

export function useWishlist() {
  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setWishlist(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse wishlist', e);
      }
    }
  }, []);

  const toggle = (id: string) => {
    if (!id) return;
    setWishlist((prev) => {
      const isExist = prev.includes(id);
      const updated = isExist ? prev.filter((item) => item !== id) : [...prev, id];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const isWishlisted = (id: string) => {
    return wishlist.includes(id);
  };

  return { wishlist, toggle, isWishlisted };
}
