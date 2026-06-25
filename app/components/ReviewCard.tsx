import React from 'react';
import { StarRating } from './StarRating';

export interface Review {
  id: string;
  rating: number;
  text: string;
  authorName: string;
  authorCity: string;
  imageUrl?: string | null;
  createdAt: Date | string;
}

interface ReviewCardProps {
  review: Review;
  locale: string;
}

export function ReviewCard({ review, locale }: ReviewCardProps) {
  const formattedDate = new Date(review.createdAt).toLocaleDateString(
    locale === 'ar' ? 'ar-EG' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  );

  return (
    <div className="bg-white dark:bg-chocolate-900 border border-chocolate-100/50 dark:border-chocolate-850 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start gap-4 mb-3">
        <div>
          <div className="font-bold text-chocolate-950 dark:text-white text-base">
            {review.authorName}
          </div>
          <div className="text-xs text-chocolate-500 dark:text-chocolate-400">
            {review.authorCity}
          </div>
        </div>
        <div className="text-xs text-chocolate-400 dark:text-chocolate-500">
          {formattedDate}
        </div>
      </div>

      <StarRating rating={review.rating} size={14} className="mb-3" />

      <p className="text-chocolate-800 dark:text-chocolate-200 text-sm leading-relaxed whitespace-pre-line">
        {review.text}
      </p>

      {review.imageUrl && (
        <div className="mt-4 relative rounded-lg overflow-hidden max-h-48 w-fit border border-chocolate-100 dark:border-chocolate-800">
          <img
            src={review.imageUrl}
            alt={`${review.authorName}'s product photo`}
            className="max-h-48 object-cover rounded-lg"
          />
        </div>
      )}
    </div>
  );
}
