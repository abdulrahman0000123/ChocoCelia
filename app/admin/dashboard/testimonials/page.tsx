'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Loader2, Star, Check, X, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TestimonialsAdminPage() {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    customerName: '',
    city: '',
    quoteEn: '',
    quoteAr: '',
    rating: 5,
    approved: true,
  });

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const res = await fetch('/api/testimonials?all=true');
      if (res.ok) {
        const data = await res.json();
        setTestimonials(data);
      } else {
        toast.error('Failed to load testimonials');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error loading testimonials');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (t: any) => {
    setEditingTestimonial(t);
    setFormData({
      customerName: t.customerName,
      city: t.city,
      quoteEn: t.quoteEn,
      quoteAr: t.quoteAr,
      rating: t.rating || 5,
      approved: t.approved,
    });
    setIsFormOpen(true);
  };

  const handleToggleApproval = async (tItem: any) => {
    const loadingToast = toast.loading(tItem.approved ? 'Rejecting testimonial...' : 'Approving testimonial...');
    try {
      const res = await fetch('/api/testimonials', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...tItem,
          approved: !tItem.approved,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setTestimonials((prev) => prev.map((item) => (item.id === tItem.id ? updated : item)));
        toast.success(tItem.approved ? 'Testimonial set to pending!' : 'Testimonial approved!', { id: loadingToast });
      } else {
        toast.error('Failed to update approval status', { id: loadingToast });
      }
    } catch (err) {
      console.error(err);
      toast.error('Error updating approval status', { id: loadingToast });
    }
  };

  const handleDelete = async (id: string) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-medium text-white">Are you sure you want to delete this testimonial?</p>
        <p className="text-sm text-chocolate-300">This action cannot be undone.</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              setDeletingId(id);
              const loadingToast = toast.loading('Deleting testimonial...');
              try {
                const res = await fetch(`/api/testimonials?id=${id}`, {
                  method: 'DELETE',
                });

                if (res.ok) {
                  setTestimonials((prev) => prev.filter((item) => item.id !== id));
                  toast.success('Testimonial deleted successfully!', { id: loadingToast });
                } else {
                  toast.error('Failed to delete testimonial', { id: loadingToast });
                }
              } catch (error) {
                console.error(error);
                toast.error('Failed to delete testimonial', { id: loadingToast });
              } finally {
                setDeletingId(null);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const loadingToast = toast.loading(editingTestimonial ? 'Updating testimonial...' : 'Creating testimonial...');

    try {
      const method = editingTestimonial ? 'PUT' : 'POST';
      const body = editingTestimonial ? { id: editingTestimonial.id, ...formData } : formData;

      const res = await fetch('/api/testimonials', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const saved = await res.json();
        if (editingTestimonial) {
          setTestimonials((prev) => prev.map((t) => (t.id === editingTestimonial.id ? saved : t)));
          toast.success('Testimonial updated successfully! ✨', { id: loadingToast });
        } else {
          setTestimonials((prev) => [saved, ...prev]);
          toast.success('Testimonial created successfully! 🎉', { id: loadingToast });
        }
        setIsFormOpen(false);
        setEditingTestimonial(null);
        setFormData({ customerName: '', city: '', quoteEn: '', quoteAr: '', rating: 5, approved: true });
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || 'Failed to save testimonial', { id: loadingToast });
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to save testimonial', { id: loadingToast });
    } finally {
      setSaving(false);
    }
  };

  const filteredTestimonials = testimonials.filter((t) => {
    const query = searchQuery.toLowerCase();
    return (
      t.customerName.toLowerCase().includes(query) ||
      (t.city && t.city.toLowerCase().includes(query)) ||
      t.quoteEn.toLowerCase().includes(query) ||
      t.quoteAr.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white tracking-wide">Testimonials Manager</h1>
          <p className="text-sm text-chocolate-300 mt-1">
            Moderate and manage customer quotes and feedback cards on the homepage
          </p>
        </div>
        {!isFormOpen && (
          <button
            onClick={() => {
              setEditingTestimonial(null);
              setFormData({ customerName: '', city: '', quoteEn: '', quoteAr: '', rating: 5, approved: true });
              setIsFormOpen(true);
            }}
            className="bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-600 text-chocolate-950 px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold transition-all duration-300 shadow-[0_0_15px_rgba(212,175,55,0.15)] hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            Add Testimonial
          </button>
        )}
      </div>

      {isFormOpen ? (
        <div className="bg-chocolate-900/20 p-6 rounded-2xl shadow-xl border border-chocolate-800 max-w-2xl backdrop-blur-md">
          <h2 className="text-xl font-bold text-white mb-6">
            {editingTestimonial ? 'Edit Testimonial' : 'New Testimonial'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-chocolate-200 mb-1">
                  Customer Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 bg-chocolate-950/60 border border-chocolate-800 rounded-xl text-white placeholder-chocolate-500 outline-none focus:ring-2 focus:ring-gold-500 transition-all text-base"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-chocolate-200 mb-1">
                  City
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 bg-chocolate-950/60 border border-chocolate-800 rounded-xl text-white placeholder-chocolate-500 outline-none focus:ring-2 focus:ring-gold-500 transition-all text-base"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-chocolate-200 mb-1">
                  Quote (English)
                </label>
                <textarea
                  required
                  rows={4}
                  className="w-full px-4 py-2 bg-chocolate-950/60 border border-chocolate-800 rounded-xl text-white placeholder-chocolate-500 outline-none focus:ring-2 focus:ring-gold-500 transition-all text-base"
                  value={formData.quoteEn}
                  onChange={(e) => setFormData({ ...formData, quoteEn: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-chocolate-200 mb-1 text-right">
                  الرأي (عربي)
                </label>
                <textarea
                  required
                  rows={4}
                  dir="rtl"
                  className="w-full px-4 py-2 bg-chocolate-950/60 border border-chocolate-800 rounded-xl text-white placeholder-chocolate-500 outline-none focus:ring-2 focus:ring-gold-500 transition-all text-right text-base"
                  value={formData.quoteAr}
                  onChange={(e) => setFormData({ ...formData, quoteAr: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-chocolate-200 mb-1">
                  Rating (1-5 Stars)
                </label>
                <div className="flex gap-2 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="text-gold-500 focus:outline-none cursor-pointer"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= formData.rating ? 'fill-gold-500 text-gold-500' : 'text-chocolate-800'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center">
                <label className="flex items-center gap-3 cursor-pointer mt-6">
                  <input
                    type="checkbox"
                    className="w-5 h-5 accent-gold-500 rounded text-gold-500 border-chocolate-800 bg-chocolate-950/60 focus:ring-gold-500"
                    checked={formData.approved}
                    onChange={(e) => setFormData({ ...formData, approved: e.target.checked })}
                  />
                  <span className="text-sm font-semibold text-chocolate-200">Approved for site display</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-chocolate-800/40">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                disabled={saving}
                className="px-4 py-2 text-chocolate-200 hover:bg-chocolate-800/40 rounded-xl transition-colors text-sm font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-600 text-chocolate-950 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 flex items-center gap-2 shadow-[0_0_15px_rgba(212,175,55,0.15)] cursor-pointer animate-none"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {saving ? 'Saving...' : 'Save Testimonial'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          {/* Filters Bar */}
          <div className="bg-chocolate-900/20 p-4 rounded-2xl shadow border border-chocolate-800 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-chocolate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search testimonials..."
                className="w-full pl-9 pr-4 py-2 bg-chocolate-950/60 border border-chocolate-800 rounded-xl text-sm text-white placeholder-chocolate-400 outline-none focus:ring-2 focus:ring-gold-500 transition-all text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="text-xs text-chocolate-300 font-medium">
              Showing {filteredTestimonials.length} of {testimonials.length} testimonials
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 text-gold-500 animate-spin" />
            </div>
          ) : filteredTestimonials.length > 0 ? (
            <div className="bg-chocolate-900/20 rounded-2xl shadow overflow-hidden border border-chocolate-800">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-chocolate-950/40 border-b border-chocolate-800 text-xs font-bold text-white uppercase tracking-wider">
                      <th className="px-6 py-4">Customer</th>
                      <th className="px-6 py-4">Rating</th>
                      <th className="px-6 py-4">Quote (EN)</th>
                      <th className="px-6 py-4 text-right">Quote (AR)</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-chocolate-800/40 text-sm text-chocolate-100">
                    {filteredTestimonials.map((t) => (
                      <tr key={t.id} className="hover:bg-chocolate-900/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-white">{t.customerName}</div>
                          <div className="text-xs text-chocolate-300">{t.city}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 text-gold-500">
                            <span className="font-bold">{t.rating}</span>
                            <Star className="w-4 h-4 fill-current" />
                          </div>
                        </td>
                        <td className="px-6 py-4 max-w-xs truncate text-chocolate-200" title={t.quoteEn}>
                          {t.quoteEn}
                        </td>
                        <td className="px-6 py-4 max-w-xs truncate text-chocolate-200 text-right" dir="rtl" title={t.quoteAr}>
                          {t.quoteAr}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                              t.approved
                                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                : 'bg-gold-500/10 text-gold-400 border border-gold-500/20'
                            }`}
                          >
                            {t.approved ? 'Approved' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleToggleApproval(t)}
                              className={`p-2 rounded-xl transition-all cursor-pointer ${
                                t.approved
                                  ? 'bg-gold-500/10 hover:bg-gold-500/20 text-gold-400'
                                  : 'bg-green-500/10 hover:bg-green-500/20 text-green-400'
                              }`}
                              title={t.approved ? 'Reject' : 'Approve'}
                            >
                              {t.approved ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => handleEdit(t)}
                              className="p-2 bg-gold-500/10 hover:bg-gold-500/20 text-gold-400 rounded-xl transition-all cursor-pointer"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(t.id)}
                              disabled={deletingId === t.id}
                              className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                              title="Delete"
                            >
                              {deletingId === t.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
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
              <p className="font-medium text-lg">No testimonials found.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
