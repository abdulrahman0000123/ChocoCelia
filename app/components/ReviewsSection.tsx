'use client';

import React, { useState } from 'react';
import { StarRating } from './StarRating';
import { ReviewCard, Review } from './ReviewCard';
import { useTranslations } from 'next-intl';
import { Star } from 'lucide-react';

interface ReviewsSectionProps {
  productId: string;
  initialReviews: Review[];
  locale: string;
}

export function ReviewsSection({ productId, initialReviews, locale }: ReviewsSectionProps) {
  const t = useTranslations();
  const isAr = locale === 'ar';

  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [showForm, setShowForm] = useState(false);
  
  // Form fields
  const [rating, setRating] = useState(5);
  const [authorName, setAuthorName] = useState('');
  const [authorCity, setAuthorCity] = useState('');
  const [text, setText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  
  // Status states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Compute stats
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1))
    : 0;

  // Star breakdown stats
  const starCounts = [0, 0, 0, 0, 0]; // Index 0 is 1 star, Index 4 is 5 stars
  reviews.forEach((r) => {
    const starIdx = Math.min(Math.max(r.rating - 1, 0), 4);
    starCounts[starIdx]++;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitSuccess(null);
    setSubmitError(null);

    if (!authorName.trim() || !authorCity.trim() || !text.trim()) {
      setSubmitError(isAr ? 'برجاء ملء جميع الحقول المطلوبة' : 'Please fill all required fields.');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          rating,
          authorName,
          authorCity,
          text,
          imageUrl: imageUrl.trim() || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitSuccess(t('reviewSuccess'));
        // Reset form
        setRating(5);
        setAuthorName('');
        setAuthorCity('');
        setText('');
        setImageUrl('');
        setShowForm(false);
      } else {
        setSubmitError(data.error || t('reviewError'));
      }
    } catch (err) {
      console.error(err);
      setSubmitError(t('reviewError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-16 border-t border-chocolate-100 dark:border-chocolate-850 pt-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-chocolate-950 dark:text-white font-cairo">
            {t('reviews')}
          </h2>
          <p className="text-sm text-chocolate-500 dark:text-chocolate-400 mt-1">
            {totalReviews > 0
              ? t('basedOnReviews', { count: totalReviews })
              : t('noReviewsYet')}
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-5 py-2.5 rounded-xl bg-chocolate-100 hover:bg-chocolate-200 dark:bg-chocolate-800 dark:hover:bg-chocolate-700 text-chocolate-800 dark:text-gold-400 font-bold text-sm transition-all cursor-pointer min-h-[44px]"
        >
          {showForm ? (isAr ? 'إلغاء' : 'Cancel') : t('writeAReview')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Stats Column */}
        {totalReviews > 0 && (
          <div className="bg-chocolate-50/40 dark:bg-chocolate-900/20 border border-chocolate-100/50 dark:border-chocolate-850/60 p-6 rounded-3xl h-fit">
            <div className="text-center pb-6 border-b border-chocolate-100 dark:border-chocolate-850/60 mb-6">
              <div className="text-5xl font-extrabold text-chocolate-950 dark:text-white mb-2 font-display">
                {averageRating}
              </div>
              <StarRating rating={averageRating} size={18} className="justify-center mb-2" />
              <span className="text-xs font-bold text-chocolate-500 dark:text-chocolate-400 uppercase tracking-wider">
                {t('averageRating')}
              </span>
            </div>

            {/* Star Bars */}
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = starCounts[stars - 1];
                const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                return (
                  <div key={stars} className="flex items-center gap-3 text-sm">
                    <span className="w-3 text-chocolate-700 dark:text-chocolate-300 font-bold font-display">{stars}</span>
                    <span className="text-chocolate-400">★</span>
                    <div className="flex-1 h-2 bg-chocolate-100 dark:bg-chocolate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gold-500 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-chocolate-500 dark:text-chocolate-400 text-xs font-display">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Reviews List & Form Column */}
        <div className={totalReviews > 0 ? 'lg:col-span-2 space-y-6' : 'lg:col-span-3 space-y-6'}>
          {/* Form container */}
          {showForm && (
            <form
              onSubmit={handleSubmit}
              className="bg-cream dark:bg-chocolate-900/50 border border-gold-500/20 p-6 rounded-3xl space-y-4 shadow-inner"
            >
              <h3 className="font-extrabold text-lg text-chocolate-950 dark:text-white font-cairo">
                {t('writeAReview')}
              </h3>

              {submitError && (
                <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl text-sm font-medium">
                  {submitError}
                </div>
              )}

              {/* Star selection */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-chocolate-800 dark:text-chocolate-200">
                  {t('rating')} *
                </label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-110 transition-transform cursor-pointer"
                      aria-label={`Rate ${star} stars`}
                    >
                      <Star
                        size={28}
                        className={
                          star <= rating
                            ? 'fill-gold-500 text-gold-500'
                            : 'text-chocolate-200 dark:text-chocolate-800'
                        }
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Author name and City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="authorName" className="text-sm font-bold text-chocolate-800 dark:text-chocolate-200">
                    {t('yourName')} *
                  </label>
                  <input
                    id="authorName"
                    type="text"
                    required
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="px-4 py-2.5 rounded-xl border border-chocolate-100 dark:border-chocolate-800 bg-white dark:bg-chocolate-950 text-chocolate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="authorCity" className="text-sm font-bold text-chocolate-800 dark:text-chocolate-200">
                    {t('yourCity')} *
                  </label>
                  <input
                    id="authorCity"
                    type="text"
                    required
                    value={authorCity}
                    placeholder={isAr ? 'مثال: القاهرة' : 'e.g. Cairo'}
                    onChange={(e) => setAuthorCity(e.target.value)}
                    className="px-4 py-2.5 rounded-xl border border-chocolate-100 dark:border-chocolate-800 bg-white dark:bg-chocolate-950 text-chocolate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                  />
                </div>
              </div>

              {/* Image URL (Optional) */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="imageUrl" className="text-sm font-bold text-chocolate-800 dark:text-chocolate-200">
                  {t('optionalPhotoUrl')}
                </label>
                <input
                  id="imageUrl"
                  type="url"
                  value={imageUrl}
                  placeholder="https://..."
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="px-4 py-2.5 rounded-xl border border-chocolate-100 dark:border-chocolate-800 bg-white dark:bg-chocolate-950 text-chocolate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                />
              </div>

              {/* Text */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="reviewText" className="text-sm font-bold text-chocolate-800 dark:text-chocolate-200">
                  {t('reviewText')} *
                </label>
                <textarea
                  id="reviewText"
                  required
                  rows={4}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="px-4 py-2.5 rounded-xl border border-chocolate-100 dark:border-chocolate-800 bg-white dark:bg-chocolate-950 text-chocolate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500/50 resize-y"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 rounded-xl bg-gold-600 hover:bg-gold-500 text-white font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer min-h-[44px]"
              >
                {isSubmitting ? t('submitting') : t('submitReview')}
              </button>
            </form>
          )}

          {/* Success Notification */}
          {submitSuccess && (
            <div className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 rounded-2xl font-medium">
              {submitSuccess}
            </div>
          )}

          {/* List of reviews */}
          {totalReviews > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} locale={locale} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed border-chocolate-100 dark:border-chocolate-800 rounded-3xl bg-chocolate-50/10">
              <span className="text-4xl block mb-2">✨</span>
              <p className="text-chocolate-500 dark:text-chocolate-400 font-medium">
                {t('noReviewsYet')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
