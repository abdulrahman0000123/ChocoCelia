'use client';

import React from 'react';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useWishlist } from '../hooks/useWishlist';

interface WishlistButtonProps {
  productId: string;
  className?: string;
  size?: number;
}

export function WishlistButton({ productId, className = '', size = 20 }: WishlistButtonProps) {
  const { isWishlisted, toggle } = useWishlist();
  const active = isWishlisted(productId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(productId);
  };

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      whileTap={{ scale: 0.8 }}
      whileHover={{ scale: 1.1 }}
      className={`group p-2.5 rounded-full bg-white/90 dark:bg-chocolate-850/90 shadow-md backdrop-blur-sm transition-colors text-chocolate-600 dark:text-chocolate-200 hover:text-red-500 dark:hover:text-red-400 cursor-pointer flex items-center justify-center ${className}`}
      aria-label={active ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart
        size={size}
        className={`transition-colors ${
          active 
            ? 'fill-red-500 text-red-500 animate-pulse' 
            : 'text-gold-500 dark:text-gold-400 group-hover:fill-red-500 group-hover:text-red-500'
        }`}
      />
    </motion.button>
  );
}
