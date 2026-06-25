'use client';

import React, { useState, useEffect } from 'react';
import { Check, X, Trash2, Loader2, Star, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReviewsAdminPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/reviews?all=true');
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      } else {
        toast.error('Failed to load reviews');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error loading reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleApproval = async (id: string, currentApproved: boolean) => {
    const loadingToast = toast.loading(currentApproved ? 'Rejecting review...' : 'Approving review...');
    try {
      const res = await fetch('/api/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, approved: !currentApproved }),
      });

      if (res.ok) {
        setReviews(reviews.map((r) => (r.id === id ? { ...r, approved: !currentApproved } : r)));
        toast.success(currentApproved ? 'Review status updated to pending!' : 'Review approved!', { id: loadingToast });
      } else {
        toast.error('Failed to update review status', { id: loadingToast });
      }
    } catch (err) {
      console.error(err);
      toast.error('Error updating review status', { id: loadingToast });
    }
  };

  const handleDelete = async (id: string) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-medium text-white">Are you sure you want to delete this review?</p>
        <p className="text-sm text-chocolate-300">This action cannot be undone.</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              const loadingToast = toast.loading('Deleting review...');
              try {
                const res = await fetch(`/api/reviews?id=${id}`, {
                  method: 'DELETE',
                });

                if (res.ok) {
                  setReviews(reviews.filter((r) => r.id !== id));
                  toast.success('Review deleted successfully!', { id: loadingToast });
                } else {
                  toast.error('Failed to delete review', { id: loadingToast });
                }
              } catch (err) {
                console.error(err);
                toast.error('Error deleting review', { id: loadingToast });
              }
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors font-medium text-sm"
          >
            Delete
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-4 py-2 bg-chocolate-800 hover:bg-chocolate-700 text-white rounded-xl transition-colors font-medium text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    ), {
      duration: 10000,
      style: {
        background: '#2A1810',
        color: '#fff',
        border: '1px solid rgba(212, 175, 55, 0.2)',
        maxWidth: '400px',
      },
    });
  };

  const filteredReviews = reviews.filter((review) => {
    const query = searchQuery.toLowerCase();
    return (
      (review.product?.name && review.product.name.toLowerCase().includes(query)) ||
      review.authorName.toLowerCase().includes(query) ||
      (review.authorCity && review.authorCity.toLowerCase().includes(query)) ||
      review.text.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gold-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-white tracking-wide">Reviews Manager</h1>
        <p className="text-sm text-chocolate-300 mt-1">
          Approve, reject, or delete customer product reviews
        </p>
      </div>

      {/* Filters Bar */}
      <div className="bg-chocolate-900/20 p-4 rounded-2xl shadow border border-chocolate-800 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-chocolate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search reviews..."
            className="w-full pl-9 pr-4 py-2 bg-chocolate-950/60 border border-chocolate-800 rounded-xl text-sm text-white placeholder-chocolate-400 outline-none focus:ring-2 focus:ring-gold-500 transition-all text-base"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="text-xs text-chocolate-300 font-medium">
          Showing {filteredReviews.length} of {reviews.length} reviews
        </div>
      </div>

      {filteredReviews.length > 0 ? (
        <div className="bg-chocolate-900/20 rounded-2xl shadow overflow-hidden border border-chocolate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-chocolate-950/40 border-b border-chocolate-800 text-xs font-bold text-white uppercase tracking-wider">
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Author</th>
                  <th className="px-6 py-4">Rating</th>
                  <th className="px-6 py-4">Review Text</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-chocolate-800/40 text-sm text-chocolate-100">
                {filteredReviews.map((review) => (
                  <tr key={review.id} className="hover:bg-chocolate-900/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-white">
                      {review.product?.name || 'Unknown Product'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">{review.authorName}</div>
                      <div className="text-xs text-chocolate-300">{review.authorCity || 'Unknown City'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-gold-400">{review.rating}</span>
                        <Star className="w-4 h-4 fill-gold-500 text-gold-500" />
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate text-chocolate-200" title={review.text}>
                      {review.text}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                          review.approved
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                            : 'bg-gold-500/10 text-gold-400 border border-gold-500/20'
                        }`}
                      >
                        {review.approved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleToggleApproval(review.id, review.approved)}
                          className={`p-2 rounded-xl transition-all cursor-pointer ${
                            review.approved
                              ? 'bg-gold-500/10 hover:bg-gold-500/20 text-gold-400'
                              : 'bg-green-500/10 hover:bg-green-500/20 text-green-400'
                          }`}
                          title={review.approved ? 'Reject' : 'Approve'}
                        >
                          {review.approved ? <X className="w-5 h-5" /> : <Check className="w-5 h-5" />}
                        </button>
                        <button
                          onClick={() => handleDelete(review.id)}
                          className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-chocolate-900/20 border border-dashed border-chocolate-850/60 rounded-2xl text-chocolate-300">
          <p className="font-medium text-lg">No reviews found.</p>
        </div>
      )}
    </div>
  );
}
