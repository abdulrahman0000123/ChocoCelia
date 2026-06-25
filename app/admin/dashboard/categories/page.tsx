'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Loader2, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', nameAr: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setFormData({ name: category.name, nameAr: category.nameAr || '' });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-medium text-white">Are you sure you want to delete this category?</p>
        <p className="text-sm text-chocolate-300">Products in this category will be affected.</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              setDeletingId(id);
              const loadingToast = toast.loading('Deleting category...');
              try {
                const res = await fetch(`/api/categories/${id}`, {
                  method: 'DELETE',
                });

                if (res.ok) {
                  setCategories(categories.filter(c => c.id !== id));
                  toast.success('Category deleted successfully! 🗑️', { id: loadingToast });
                } else {
                  const error = await res.json();
                  toast.error(error.error || 'Failed to delete category', { id: loadingToast });
                }
              } catch (error) {
                console.error('Delete error:', error);
                toast.error('Failed to delete category', { id: loadingToast });
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

    const loadingToast = toast.loading(editingCategory ? 'Updating category...' : 'Creating category...');

    try {
      if (editingCategory) {
        // Update existing category
        const res = await fetch(`/api/categories/${editingCategory.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (res.ok) {
          const updatedCategory = await res.json();
          setCategories(categories.map(c => 
            c.id === editingCategory.id ? updatedCategory : c
          ));
          toast.success('Category updated successfully! ✨', { id: loadingToast });
        } else {
          const error = await res.json();
          toast.error(error.error || 'Failed to update category', { id: loadingToast });
          setSaving(false);
          return;
        }
      } else {
        // Create new category
        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (res.ok) {
          const newCategory = await res.json();
          setCategories([newCategory, ...categories]);
          toast.success('Category created successfully! 🎉', { id: loadingToast });
        } else {
          const error = await res.json();
          toast.error(error.error || 'Failed to create category', { id: loadingToast });
          setSaving(false);
          return;
        }
      }

      setIsFormOpen(false);
      setEditingCategory(null);
      setFormData({ name: '', nameAr: '' });
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save category', { id: loadingToast });
    } finally {
      setSaving(false);
    }
  };

  const filteredCategories = categories.filter((category) => {
    const matchesSearch = 
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (category.nameAr && category.nameAr.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white tracking-wide">Categories</h1>
          <p className="text-sm text-chocolate-300 mt-1">Manage and organize your menu categories</p>
        </div>
        {!isFormOpen && (
          <button
            onClick={() => {
              setEditingCategory(null);
              setFormData({ name: '', nameAr: '' });
              setIsFormOpen(true);
            }}
            className="bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-600 text-chocolate-950 px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold transition-all duration-300 shadow-[0_0_15px_rgba(212,175,55,0.15)] hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            Add Category
          </button>
        )}
      </div>

      {isFormOpen ? (
        <div className="bg-chocolate-900/20 p-6 rounded-2xl shadow-xl border border-chocolate-800 max-w-md backdrop-blur-md">
          <h2 className="text-xl font-bold text-white mb-6">
            {editingCategory ? 'Edit Category' : 'New Category'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-chocolate-200 mb-1">Name (English)</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 bg-chocolate-950/60 border border-chocolate-800 rounded-xl text-white placeholder-chocolate-500 outline-none focus:ring-2 focus:ring-gold-500 transition-all text-base"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-chocolate-200 mb-1">Name (Arabic)</label>
              <input
                type="text"
                className="w-full px-4 py-2 bg-chocolate-950/60 border border-chocolate-800 rounded-xl text-white placeholder-chocolate-500 outline-none focus:ring-2 focus:ring-gold-500 transition-all text-right text-base"
                value={formData.nameAr}
                onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                dir="rtl"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                disabled={saving}
                className="px-4 py-2 text-chocolate-200 hover:bg-chocolate-800/40 rounded-xl transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-600 text-chocolate-950 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 flex items-center gap-2 shadow-[0_0_15px_rgba(212,175,55,0.15)] cursor-pointer"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {saving ? 'Saving...' : 'Save Category'}
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
                placeholder="Search categories..."
                className="w-full pl-9 pr-4 py-2 bg-chocolate-950/60 border border-chocolate-800 rounded-xl text-sm text-white placeholder-chocolate-400 outline-none focus:ring-2 focus:ring-gold-500 transition-all text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="text-xs text-chocolate-300 font-medium">
              Showing {filteredCategories.length} of {categories.length} categories
            </div>
          </div>

          {/* Table Container */}
          {/* Table / Cards Container */}
          {filteredCategories.length === 0 ? (
            <div className="text-center py-16 text-chocolate-300 bg-chocolate-900/10 border border-chocolate-800 rounded-2xl">
              <p className="text-lg font-medium">No categories found.</p>
            </div>
          ) : (
            <>
              {/* Desktop Table (md and up) */}
              <div className="hidden md:block bg-chocolate-900/20 rounded-2xl shadow-lg overflow-hidden border border-chocolate-800">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-chocolate-950/60 border-b border-chocolate-800 text-xs font-bold text-white uppercase tracking-wider">
                        <th className="px-6 py-4.5">Name (EN)</th>
                        <th className="px-6 py-4.5 text-right">Name (AR)</th>
                        <th className="px-6 py-4.5">Products Linked</th>
                        <th className="px-6 py-4.5 text-right w-32">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-chocolate-800/40 text-sm text-chocolate-100">
                      {filteredCategories.map((category) => (
                        <tr key={category.id} className="hover:bg-chocolate-900/30 transition-colors">
                          <td className="px-6 py-4 font-semibold text-white">{category.name}</td>
                          <td className="px-6 py-4 text-right font-medium text-chocolate-200" dir="rtl">{category.nameAr || '-'}</td>
                          <td className="px-6 py-4 text-chocolate-300">
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-chocolate-800/50 text-chocolate-200 border border-chocolate-700/30">
                              {category._count?.products || 0} products
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right space-x-2">
                            <button
                              onClick={() => handleEdit(category)}
                              className="text-gold-500 hover:text-gold-400 p-2 hover:bg-chocolate-800/40 rounded-xl transition-all cursor-pointer inline-flex"
                              title="Edit Category"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(category.id)}
                              disabled={deletingId === category.id}
                              className="text-red-500 hover:text-red-400 p-2 hover:bg-chocolate-800/40 rounded-xl transition-all disabled:opacity-50 cursor-pointer inline-flex"
                              title="Delete Category"
                            >
                              {deletingId === category.id ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                <Trash2 className="w-5 h-5" />
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Card List (under md) */}
              <div className="block md:hidden space-y-4">
                {filteredCategories.map((category) => (
                  <div 
                    key={category.id} 
                    className="bg-chocolate-900/20 border border-chocolate-800/80 rounded-2xl p-5 space-y-4 backdrop-blur-sm shadow-md"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <h3 className="font-bold text-white text-base leading-tight">{category.name}</h3>
                        {category.nameAr && (
                          <p className="text-xs text-chocolate-300 font-medium text-right mt-1" dir="rtl">
                            {category.nameAr}
                          </p>
                        )}
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-chocolate-800/80 text-gold-400 border border-chocolate-700/50 flex-shrink-0">
                        {category._count?.products || 0} products
                      </span>
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t border-chocolate-800/40">
                      <button
                        onClick={() => handleEdit(category)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gold-600/10 hover:bg-gold-600/20 text-gold-400 rounded-xl transition-all font-bold text-xs cursor-pointer min-h-[36px]"
                        title="Edit Category"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        disabled={deletingId === category.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-650/10 hover:bg-red-650/20 text-red-400 rounded-xl transition-all font-bold text-xs cursor-pointer disabled:opacity-50 min-h-[36px]"
                        title="Delete Category"
                      >
                        {deletingId === category.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
