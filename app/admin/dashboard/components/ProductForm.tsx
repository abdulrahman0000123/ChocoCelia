'use client';

import React, { useState, useEffect } from 'react';
import { Upload, X } from 'lucide-react';
import { compressImage } from '@/app/lib/imageUtils';

interface Category {
  id: string;
  name: string;
  nameAr: string;
}

interface ProductFormProps {
  initialData?: any;
  onCancel: () => void;
  onSubmit: (data: any) => void;
}

export function ProductForm({ initialData, onCancel, onSubmit }: ProductFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    nameAr: initialData?.nameAr || '',
    description: initialData?.description || '',
    descriptionAr: initialData?.descriptionAr || '',
    price: initialData?.price || '',
    categoryId: initialData?.categoryId || '',
    image: initialData?.image || '',
    images: Array.isArray(initialData?.images) ? initialData.images : [],
    isAvailable: initialData?.isAvailable ?? true,
  });

  const [imagePreview, setImagePreview] = useState<string>(initialData?.image || '');
  const [uploading, setUploading] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
        if (!initialData && data.length > 0) {
          setFormData(prev => ({ ...prev, categoryId: data[0].id }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch categories');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const result = await compressImage(file, 800, 800, 0.85);
      
      if (result.success && result.data) {
        setImagePreview(result.data);
        setFormData({ ...formData, image: result.data });
      } else {
        alert(result.error || 'Failed to upload image');
      }
    } catch (error) {
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleGalleryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (formData.images.length >= 5) {
      alert('You can only upload up to 5 additional images');
      return;
    }

    setUploadingGallery(true);

    try {
      const result = await compressImage(file, 800, 800, 0.85);
      
      if (result.success && result.data) {
        setFormData(prev => ({ 
          ...prev, 
          images: [...prev.images, result.data as string] 
        }));
      } else {
        alert(result.error || 'Failed to upload gallery image');
      }
    } catch (error) {
      alert('Failed to upload gallery image');
    } finally {
      setUploadingGallery(false);
    }
  };

  const removeImage = () => {
    setImagePreview('');
    setFormData({ ...formData, image: '' });
  };

  const removeGalleryImage = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_: string, index: number) => index !== indexToRemove)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const inputClasses = "w-full px-4 py-2.5 bg-chocolate-950/60 border border-chocolate-800 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all text-white text-sm";
  const labelClasses = "block text-xs font-bold text-chocolate-300 uppercase tracking-wider mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={labelClasses}>Product Name (English)</label>
          <input
            type="text"
            required
            className={inputClasses}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div>
          <label className={`${labelClasses} text-right`}>اسم المنتج (عربي)</label>
          <input
            type="text"
            required
            className={`${inputClasses} text-right`}
            dir="rtl"
            value={formData.nameAr}
            onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
          />
        </div>

        <div className="col-span-2">
          <label className={labelClasses}>Description (English)</label>
          <textarea
            rows={3}
            className={inputClasses}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="col-span-2">
          <label className={`${labelClasses} text-right`}>الوصف (عربي)</label>
          <textarea
            rows={3}
            className={`${inputClasses} text-right`}
            dir="rtl"
            value={formData.descriptionAr}
            onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
          />
        </div>

        <div>
          <label className={labelClasses}>Price (EGP)</label>
          <input
            type="number"
            step="0.01"
            required
            className={inputClasses}
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          />
        </div>

        <div>
          <label className={labelClasses}>Category</label>
          <select
            required
            className={inputClasses}
            value={formData.categoryId}
            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-2">
          <label className={labelClasses}>
            Main Product Image (Required)
          </label>
          
          {imagePreview ? (
            <div className="relative rounded-2xl overflow-hidden border border-chocolate-800 h-48">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors cursor-pointer shadow"
                aria-label="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
                disabled={uploading}
              />
              <label
                htmlFor="image-upload"
                className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-chocolate-800/80 rounded-2xl cursor-pointer hover:border-gold-500/50 bg-chocolate-900/10 transition-colors"
              >
                <Upload className="w-10 h-10 text-chocolate-400 mb-2" />
                <span className="text-sm text-chocolate-200">
                  {uploading ? 'Uploading & compressing...' : 'Click to upload main image'}
                </span>
                <span className="text-xs text-chocolate-400 mt-1">
                  PNG, JPG auto-compressed
                </span>
              </label>
            </div>
          )}
        </div>

        <div className="col-span-2">
          <label className={labelClasses}>
            Additional Gallery Images (Optional)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2">
            {formData.images.map((imgUrl: string, index: number) => (
              <div key={index} className="relative rounded-xl overflow-hidden border border-chocolate-800 aspect-square">
                <img 
                  src={imgUrl} 
                  alt={`Gallery Preview ${index + 1}`} 
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeGalleryImage(index)}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full transition-colors cursor-pointer shadow"
                  aria-label="Remove gallery image"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            
            {formData.images.length < 5 && (
              <div className="relative aspect-square">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleGalleryImageUpload}
                  className="hidden"
                  id="gallery-image-upload"
                  disabled={uploadingGallery}
                />
                <label
                  htmlFor="gallery-image-upload"
                  className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-chocolate-800/80 rounded-xl cursor-pointer hover:border-gold-500/50 bg-chocolate-900/10 transition-colors"
                >
                  <Upload className="w-6 h-6 text-chocolate-400 mb-2" />
                  <span className="text-xs text-center text-chocolate-200 px-2">
                    {uploadingGallery ? 'Uploading...' : 'Add Image'}
                  </span>
                </label>
              </div>
            )}
          </div>
          <p className="text-xs text-chocolate-400 mt-2">You can add up to 5 additional images for the product gallery.</p>
        </div>

        <div className="col-span-2">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              className="w-5 h-5 text-gold-600 border-chocolate-800 bg-chocolate-950/60 rounded focus:ring-gold-500 accent-gold-500"
              checked={formData.isAvailable}
              onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
            />
            <span className="text-sm font-semibold text-chocolate-200">Available for purchase</span>
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-chocolate-850/40">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2 text-chocolate-300 hover:bg-chocolate-900/40 rounded-xl transition-colors text-sm font-medium cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-chocolate-600 text-white rounded-xl hover:bg-chocolate-700 transition-colors text-sm font-medium cursor-pointer"
        >
          Save Product Properties
        </button>
      </div>
    </form>
  );
}
