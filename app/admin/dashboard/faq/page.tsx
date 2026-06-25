'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Loader2, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function FAQAdminPage() {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    questionEn: '',
    questionAr: '',
    answerEn: '',
    answerAr: '',
    order: 0,
  });

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      const res = await fetch('/api/faq');
      if (res.ok) {
        const data = await res.json();
        setFaqs(data);
      } else {
        toast.error('Failed to load FAQs');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error loading FAQs');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (faq: any) => {
    setEditingFaq(faq);
    setFormData({
      questionEn: faq.questionEn,
      questionAr: faq.questionAr,
      answerEn: faq.answerEn,
      answerAr: faq.answerAr,
      order: faq.order || 0,
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-medium text-white">Are you sure you want to delete this FAQ?</p>
        <p className="text-sm text-chocolate-300">This action cannot be undone.</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              setDeletingId(id);
              const loadingToast = toast.loading('Deleting FAQ...');
              try {
                const res = await fetch(`/api/faq?id=${id}`, {
                  method: 'DELETE',
                });

                if (res.ok) {
                  setFaqs((prev) => prev.filter((item) => item.id !== id));
                  toast.success('FAQ deleted successfully!', { id: loadingToast });
                } else {
                  toast.error('Failed to delete FAQ', { id: loadingToast });
                }
              } catch (error) {
                console.error(error);
                toast.error('Failed to delete FAQ', { id: loadingToast });
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
    const loadingToast = toast.loading(editingFaq ? 'Updating FAQ...' : 'Creating FAQ...');

    try {
      const method = editingFaq ? 'PUT' : 'POST';
      const body = editingFaq ? { id: editingFaq.id, ...formData } : formData;

      const res = await fetch('/api/faq', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const savedFaq = await res.json();
        if (editingFaq) {
          setFaqs((prev) => prev.map((f) => (f.id === editingFaq.id ? savedFaq : f)).sort((a, b) => a.order - b.order));
          toast.success('FAQ updated successfully! ✨', { id: loadingToast });
        } else {
          setFaqs((prev) => [...prev, savedFaq].sort((a, b) => a.order - b.order));
          toast.success('FAQ created successfully! 🎉', { id: loadingToast });
        }
        setIsFormOpen(false);
        setEditingFaq(null);
        setFormData({ questionEn: '', questionAr: '', answerEn: '', answerAr: '', order: 0 });
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || 'Failed to save FAQ', { id: loadingToast });
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to save FAQ', { id: loadingToast });
    } finally {
      setSaving(false);
    }
  };

  const filteredFaqs = faqs.filter((faq) => {
    const query = searchQuery.toLowerCase();
    return (
      faq.questionEn.toLowerCase().includes(query) ||
      faq.questionAr.toLowerCase().includes(query) ||
      faq.answerEn.toLowerCase().includes(query) ||
      faq.answerAr.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white tracking-wide">FAQ Manager</h1>
          <p className="text-sm text-chocolate-300 mt-1">
            Manage public bilingual Frequently Asked Questions
          </p>
        </div>
        {!isFormOpen && (
          <button
            onClick={() => {
              setEditingFaq(null);
              setFormData({ questionEn: '', questionAr: '', answerEn: '', answerAr: '', order: faqs.length });
              setIsFormOpen(true);
            }}
            className="bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-600 text-chocolate-950 px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold transition-all duration-300 shadow-[0_0_15px_rgba(212,175,55,0.15)] hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            Add FAQ
          </button>
        )}
      </div>

      {isFormOpen ? (
        <div className="bg-chocolate-900/20 p-6 rounded-2xl shadow-xl border border-chocolate-800 max-w-2xl backdrop-blur-md">
          <h2 className="text-xl font-bold text-white mb-6">
            {editingFaq ? 'Edit FAQ Item' : 'New FAQ Item'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-chocolate-200 mb-1">
                  Question (English)
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 bg-chocolate-950/60 border border-chocolate-800 rounded-xl text-white placeholder-chocolate-500 outline-none focus:ring-2 focus:ring-gold-500 transition-all text-base"
                  value={formData.questionEn}
                  onChange={(e) => setFormData({ ...formData, questionEn: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-chocolate-200 mb-1 text-right">
                  السؤال (عربي)
                </label>
                <input
                  type="text"
                  required
                  dir="rtl"
                  className="w-full px-4 py-2 bg-chocolate-950/60 border border-chocolate-800 rounded-xl text-white placeholder-chocolate-500 outline-none focus:ring-2 focus:ring-gold-500 transition-all text-right text-base"
                  value={formData.questionAr}
                  onChange={(e) => setFormData({ ...formData, questionAr: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-chocolate-200 mb-1">
                  Answer (English)
                </label>
                <textarea
                  required
                  rows={4}
                  className="w-full px-4 py-2 bg-chocolate-950/60 border border-chocolate-800 rounded-xl text-white placeholder-chocolate-500 outline-none focus:ring-2 focus:ring-gold-500 transition-all text-base"
                  value={formData.answerEn}
                  onChange={(e) => setFormData({ ...formData, answerEn: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-chocolate-200 mb-1 text-right">
                  الإجابة (عربي)
                </label>
                <textarea
                  required
                  rows={4}
                  dir="rtl"
                  className="w-full px-4 py-2 bg-chocolate-950/60 border border-chocolate-800 rounded-xl text-white placeholder-chocolate-500 outline-none focus:ring-2 focus:ring-gold-500 transition-all text-right text-base"
                  value={formData.answerAr}
                  onChange={(e) => setFormData({ ...formData, answerAr: e.target.value })}
                />
              </div>
            </div>

            <div className="max-w-xs">
              <label className="block text-sm font-semibold text-chocolate-200 mb-1">
                Display Order
              </label>
              <input
                type="number"
                min="0"
                required
                className="w-full px-4 py-2 bg-chocolate-950/60 border border-chocolate-800 rounded-xl text-white placeholder-chocolate-500 outline-none focus:ring-2 focus:ring-gold-500 transition-all text-base"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
              />
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
                className="px-5 py-2.5 bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-600 text-chocolate-950 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 flex items-center gap-2 shadow-[0_0_15px_rgba(212,175,55,0.15)] cursor-pointer"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {saving ? 'Saving...' : 'Save FAQ'}
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
                placeholder="Search FAQs..."
                className="w-full pl-9 pr-4 py-2 bg-chocolate-950/60 border border-chocolate-800 rounded-xl text-sm text-white placeholder-chocolate-400 outline-none focus:ring-2 focus:ring-gold-500 transition-all text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="text-xs text-chocolate-300 font-medium">
              Showing {filteredFaqs.length} of {faqs.length} FAQs
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 text-gold-500 animate-spin" />
            </div>
          ) : filteredFaqs.length > 0 ? (
            <div className="bg-chocolate-900/20 rounded-2xl shadow overflow-hidden border border-chocolate-800">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-chocolate-950/40 border-b border-chocolate-800 text-xs font-bold text-white uppercase tracking-wider">
                      <th className="px-6 py-4 w-16 text-center">Order</th>
                      <th className="px-6 py-4">Question (EN)</th>
                      <th className="px-6 py-4 text-right">Question (AR)</th>
                      <th className="px-6 py-4">Answer (EN)</th>
                      <th className="px-6 py-4 text-right">Answer (AR)</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-chocolate-800/40 text-sm text-chocolate-100">
                    {filteredFaqs.map((faq) => (
                      <tr key={faq.id} className="hover:bg-chocolate-900/30 transition-colors">
                        <td className="px-6 py-4 text-center font-bold text-gold-500 bg-chocolate-950/30">
                          {faq.order}
                        </td>
                        <td className="px-6 py-4 font-semibold text-white max-w-xs truncate" title={faq.questionEn}>
                          {faq.questionEn}
                        </td>
                        <td className="px-6 py-4 font-semibold text-white max-w-xs truncate text-right text-chocolate-200" dir="rtl" title={faq.questionAr}>
                          {faq.questionAr}
                        </td>
                        <td className="px-6 py-4 max-w-xs truncate text-chocolate-200" title={faq.answerEn}>
                          {faq.answerEn}
                        </td>
                        <td className="px-6 py-4 max-w-xs truncate text-chocolate-200 text-right" dir="rtl" title={faq.answerAr}>
                          {faq.answerAr}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEdit(faq)}
                              className="p-2 bg-gold-500/10 hover:bg-gold-500/20 text-gold-400 rounded-xl transition-all cursor-pointer"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(faq.id)}
                              disabled={deletingId === faq.id}
                              className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                              title="Delete"
                            >
                              {deletingId === faq.id ? (
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
              <p className="font-medium text-lg">No FAQs found.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
