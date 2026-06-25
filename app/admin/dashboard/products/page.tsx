'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Loader2, Image as ImageIcon, Search, Filter } from 'lucide-react';
import { ProductForm } from '../components/ProductForm';
import toast from 'react-hot-toast';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Failed to fetch products');
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Failed to fetch categories');
    }
  };

  const handleCreate = async (data: any) => {
    const loadingToast = toast.loading('Creating product...');
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      const responseData = await res.json();
      
      if (res.ok) {
        fetchProducts();
        setIsFormOpen(false);
        toast.success('Product created successfully! 🍫', { id: loadingToast });
      } else {
        toast.error(`Failed to create product: ${responseData.error || 'Unknown error'}`, { id: loadingToast });
      }
    } catch (error) {
      console.error('Failed to create product:', error);
      toast.error('Failed to create product. Please try again.', { id: loadingToast });
    }
  };

  const handleUpdate = async (data: any) => {
    const loadingToast = toast.loading('Updating product...');
    try {
      const res = await fetch(`/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        fetchProducts();
        setIsFormOpen(false);
        setEditingProduct(null);
        toast.success('Product updated successfully! ✨', { id: loadingToast });
      } else {
        toast.error('Failed to update product', { id: loadingToast });
      }
    } catch (error) {
      console.error('Failed to update product');
      toast.error('Failed to update product', { id: loadingToast });
    }
  };

  const handleToggleAvailability = async (id: string, currentAvailable: boolean) => {
    const loadingToast = toast.loading(currentAvailable ? 'Setting out of stock...' : 'Setting in stock...');
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: !currentAvailable }),
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, isAvailable: !currentAvailable } : p))
        );
        toast.success(!currentAvailable ? 'Product set available! 🍫' : 'Product set out of stock!', { id: loadingToast });
      } else {
        toast.error('Failed to update status', { id: loadingToast });
      }
    } catch (err) {
      console.error(err);
      toast.error('Error toggling availability', { id: loadingToast });
    }
  };

  const handleDelete = async (id: string) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-medium text-gray-900">Are you sure you want to delete this product?</p>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              setDeletingId(id);
              const loadingToast = toast.loading('Deleting product...');
              try {
                const res = await fetch(`/api/products/${id}`, {
                  method: 'DELETE',
                });
                if (res.ok) {
                  setProducts(products.filter(p => p.id !== id));
                  toast.success('Product deleted successfully! 🗑️', { id: loadingToast });
                } else {
                  const data = await res.json();
                  toast.error(data.error || 'Failed to delete product', { id: loadingToast });
                }
              } catch (error) {
                console.error('Failed to delete product:', error);
                toast.error('Failed to delete product', { id: loadingToast });
              } finally {
                setDeletingId(null);
              }
            }}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
          >
            Delete
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
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

  // Filter logic
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.nameAr && product.nameAr.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = !selectedCategory || product.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-10 h-10 animate-spin text-gold-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-wide">Products List</h1>
          <p className="text-sm text-chocolate-200 mt-1">Manage catalog details and instant availability status.</p>
        </div>
        {!isFormOpen && (
          <button
            onClick={() => {
              setEditingProduct(null);
              setIsFormOpen(true);
            }}
            className="bg-chocolate-600 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-chocolate-700 transition-colors font-medium shadow cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            Add Product
          </button>
        )}
      </div>

      {isFormOpen ? (
        <div className="bg-chocolate-900/20 p-6 rounded-2xl shadow-xl border border-chocolate-850/60">
          <h2 className="text-xl font-bold text-white mb-6">
            {editingProduct ? 'Edit Product Parameters' : 'Register New Product'}
          </h2>
          <ProductForm
            initialData={editingProduct}
            onCancel={() => setIsFormOpen(false)}
            onSubmit={editingProduct ? handleUpdate : handleCreate}
          />
        </div>
      ) : (
        <>
          {/* Filters Bar */}
          <div className="bg-chocolate-900/20 p-4 rounded-2xl shadow border border-chocolate-850/50 flex flex-col md:flex-row gap-4 items-center">
            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-chocolate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-9 pr-4 py-2 bg-chocolate-950/60 border border-chocolate-800 rounded-xl text-sm text-white placeholder-chocolate-400 outline-none focus:ring-2 focus:ring-gold-500 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Category Select Filter */}
            <div className="relative w-full md:w-60 flex items-center gap-2">
              <Filter className="w-4 h-4 text-chocolate-400 flex-shrink-0" />
              <select
                className="w-full px-3 py-2 bg-chocolate-950/60 border border-chocolate-800 rounded-xl text-sm text-white outline-none focus:ring-2 focus:ring-gold-500 transition-all"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-xs text-chocolate-300 ml-auto font-medium">
              Showing {filteredProducts.length} of {products.length} products
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-chocolate-900/20 rounded-2xl shadow overflow-hidden border border-chocolate-850/60">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-chocolate-950/40 border-b border-chocolate-850/60 text-xs font-bold text-white uppercase tracking-wider">
                    <th className="px-6 py-4 w-20">Image</th>
                    <th className="px-6 py-4">Name (EN/AR)</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4 text-center w-32">Available</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-chocolate-850/40 text-sm text-gray-200">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-chocolate-900/30 transition-colors">
                      <td className="px-6 py-4">
                        {product.image ? (
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            className="w-12 h-12 object-cover rounded-xl border border-chocolate-800"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-chocolate-950/60 rounded-xl border border-chocolate-800 flex items-center justify-center text-chocolate-400">
                            <ImageIcon className="w-6 h-6" />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-white">{product.name}</div>
                        {product.nameAr && (
                          <div className="text-xs text-chocolate-300 font-medium mt-0.5">{product.nameAr}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-chocolate-200">
                        {product.category?.name || 'Unassigned'}
                      </td>
                      <td className="px-6 py-4 font-semibold text-white">
                        {Number(product.price).toFixed(2)} EGP
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <label className="relative inline-flex items-center cursor-pointer select-none">
                            <input 
                              type="checkbox" 
                              checked={product.isAvailable} 
                              onChange={() => handleToggleAvailability(product.id, product.isAvailable)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-chocolate-950 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-chocolate-300 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold-600 peer-checked:after:bg-white"></div>
                          </label>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingProduct({
                                ...product,
                                category: product.category?.name || product.categoryId
                              });
                              setIsFormOpen(true);
                            }}
                            className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            disabled={deletingId === product.id}
                            className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                            title="Delete"
                          >
                            {deletingId === product.id ? (
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
            {filteredProducts.length === 0 && (
              <div className="text-center py-20 text-chocolate-300 bg-chocolate-900/10">
                <p className="text-lg">No products match your search filter.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
