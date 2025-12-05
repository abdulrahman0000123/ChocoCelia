'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', nameAr: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
        <p className="font-medium">Are you sure you want to delete this category?</p>
        <p className="text-sm text-gray-500">Products in this category will be affected.</p>
        <div className="flex gap-2">
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
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    ), {
      duration: 10000,
      style: {
        background: '#fff',
        color: '#1f2937',
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-chocolate-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Categories</h1>
        <button
          onClick={() => {
            setEditingCategory(null);
            setFormData({ name: '', nameAr: '' });
            setIsFormOpen(true);
          }}
          className="bg-chocolate-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-chocolate-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Category
        </button>
      </div>

      {isFormOpen ? (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 max-w-md">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            {editingCategory ? 'Edit Category' : 'New Category'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name (English)</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-chocolate-500 focus:border-transparent outline-none text-black"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name (Arabic)</label>
              <input
                type="text"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-chocolate-500 focus:border-transparent outline-none text-black"
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
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-chocolate-600 text-white rounded-lg hover:bg-chocolate-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {saving ? 'Saving...' : 'Save Category'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-600">Name (EN)</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Name (AR)</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Products</th>
                <th className="px-6 py-4 font-semibold text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-800 font-medium">{category.name}</td>
                  <td className="px-6 py-4 text-gray-600" dir="rtl">{category.nameAr || '-'}</td>
                  <td className="px-6 py-4 text-gray-600">{category._count?.products || 0} products</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-all"
                      title="Edit Category"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      disabled={deletingId === category.id}
                      className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
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
          {categories.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p className="text-lg">No categories found. Create your first category!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
