'use client';

import { useState } from 'react';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';

// Mock Data
const MOCK_CATEGORIES = [
  { id: '1', name: 'Dark Chocolate', productsCount: 12 },
  { id: '2', name: 'Milk Chocolate', productsCount: 8 },
  { id: '3', name: 'White Chocolate', productsCount: 5 },
  { id: '4', name: 'Gift Boxes', productsCount: 3 },
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState(MOCK_CATEGORIES);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '' });

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setFormData({ name: category.name });
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      setCategories(categories.filter(c => c.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory) {
      setCategories(categories.map(c => 
        c.id === editingCategory.id ? { ...c, name: formData.name } : c
      ));
    } else {
      setCategories([
        ...categories,
        { id: Math.random().toString(), name: formData.name, productsCount: 0 }
      ]);
    }
    setIsFormOpen(false);
    setEditingCategory(null);
    setFormData({ name: '' });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Categories</h1>
        <button
          onClick={() => {
            setEditingCategory(null);
            setFormData({ name: '' });
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-chocolate-500 focus:border-transparent outline-none"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-chocolate-600 text-white rounded-lg hover:bg-chocolate-700 transition-colors"
              >
                Save Category
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-600">Name</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Products</th>
                <th className="px-6 py-4 font-semibold text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-800 font-medium">{category.name}</td>
                  <td className="px-6 py-4 text-gray-600">{category.productsCount} products</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
