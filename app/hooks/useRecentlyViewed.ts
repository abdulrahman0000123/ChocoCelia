'use client';

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'choco_recently_viewed';
const MAX_ITEMS = 6;

export function useRecentlyViewed() {
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setRecentlyViewed(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse recently viewed products', e);
      }
    }
  }, []);

  const addProduct = (id: string) => {
    if (!id) return;
    setRecentlyViewed((prev) => {
      // Remove if already exists to move to the front (most recent first)
      const filtered = prev.filter((item) => item !== id);
      const updated = [id, ...filtered].slice(0, MAX_ITEMS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  return { recentlyViewed, addProduct };
}
