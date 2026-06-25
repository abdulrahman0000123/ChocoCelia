import React from 'react';
import { Star, StarHalf } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: number;
  className?: string;
}

export function StarRating({ rating, maxRating = 5, size = 16, className = '' }: StarRatingProps) {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.4; // 4.4 and above gets a half star, 4.8 and above is rounded to 5 conceptually, but we can display custom or keep simple

  for (let i = 1; i <= maxRating; i++) {
    if (i <= fullStars) {
      stars.push(
        <Star
          key={i}
          size={size}
          className="fill-gold-500 text-gold-500"
        />
      );
    } else if (i === fullStars + 1 && hasHalf) {
      stars.push(
        <StarHalf
          key={i}
          size={size}
          className="fill-gold-500 text-gold-500"
        />
      );
    } else {
      stars.push(
        <Star
          key={i}
          size={size}
          className="text-chocolate-200 dark:text-chocolate-800"
        />
      );
    }
  }

  return <div className={`flex gap-0.5 ${className}`}>{stars}</div>;
}
