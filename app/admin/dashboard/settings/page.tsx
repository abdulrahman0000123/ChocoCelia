'use client';

import { useState, useEffect } from 'react';
import { Save, Loader2, Upload, X } from 'lucide-react';
import { compressImage } from '@/app/lib/imageUtils';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [newSlideUrl, setNewSlideUrl] = useState('');
  const [formData, setFormData] = useState({
    phone: '',
    email: '',
    address: '',
    city: '',
    workingHours: '',
    facebook: '',
    instagram: '',
    twitter: '',
    logo: '',
    // Delivery Fees
    deliveryFeeBeniSuef: '20',
    deliveryFeeEastNile: '40',
    // Our Story
    ourStoryTitle: '',
    ourStorySubtitle: '',
    ourStoryBeginningTitle: '',
    ourStoryBeginning: '',
    ourStoryPhilosophyTitle: '',
    ourStoryPhilosophy: '',
    // Hero Section
    heroTitle: '',
    heroHighlight: '',
    heroSubtitle: '',
    heroSlides: [] as string[],
    // Feature Cards
    featureCard1Icon: '',
    featureCard1Title: '',
    featureCard1Description: '',
    featureCard2Icon: '',
    featureCard2Title: '',
    featureCard2Description: '',
    featureCard3Icon: '',
    featureCard3Title: '',
    featureCard3Description: '',
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setFormData({
          phone: data.phone || '',
          email: data.email || '',
          address: data.address || '',
          city: data.city || '',
          workingHours: data.workingHours || '',
          facebook: data.facebook || '',
          instagram: data.instagram || '',
          twitter: data.twitter || '',
          logo: data.logo || '',
          // Delivery Fees
          deliveryFeeBeniSuef: data.deliveryFeeBeniSuef || '20',
          deliveryFeeEastNile: data.deliveryFeeEastNile || '40',
          // Our Story
          ourStoryTitle: data.ourStoryTitle || '',
          ourStorySubtitle: data.ourStorySubtitle || '',
          ourStoryBeginningTitle: data.ourStoryBeginningTitle || '',
          ourStoryBeginning: data.ourStoryBeginning || '',
          ourStoryPhilosophyTitle: data.ourStoryPhilosophyTitle || '',
          ourStoryPhilosophy: data.ourStoryPhilosophy || '',
          // Hero
          heroTitle: data.heroTitle || '',
          heroHighlight: data.heroHighlight || '',
          heroSubtitle: data.heroSubtitle || '',
          heroSlides: data.heroSlides || [],
          // Feature Cards
          featureCard1Icon: data.featureCard1Icon || '🌿',
          featureCard1Title: data.featureCard1Title || 'Premium Ingredients',
          featureCard1Description: data.featureCard1Description || 'Only the finest cocoa and fresh ingredients',
          featureCard2Icon: data.featureCard2Icon || '🤎',
          featureCard2Title: data.featureCard2Title || 'Handmade with Love',
          featureCard2Description: data.featureCard2Description || 'Crafted in small batches for perfection',
          featureCard3Icon: data.featureCard3Icon || '✨',
          featureCard3Title: data.featureCard3Title || 'Unique Flavors',
          featureCard3Description: data.featureCard3Description || 'Innovative combinations that delight',
        });
      }
    } catch (error) {
      console.error('Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    const loadingToast = toast.loading('Saving settings...');

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setMessage('Settings updated successfully!');
        toast.success('Settings saved successfully! 🎉', { id: loadingToast });
        // Reload after 1 second to show updated logo across the site
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setMessage('Failed to update settings.');
        toast.error('Failed to update settings', { id: loadingToast });
      }
    } catch (error) {
      setMessage('An error occurred.');
      toast.error('An error occurred', { id: loadingToast });
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    if (field === 'logo') setUploadingLogo(true);

    try {
      const compressedImage = await compressImage(file, 1000, 1000, 0.95);
      setFormData({ ...formData, [field]: compressedImage });
      setMessage('Logo uploaded! Click "Save Changes" to apply.');
    } catch (error) {
      alert('Failed to process image');
    } finally {
      if (field === 'logo') setUploadingLogo(false);
    }
  };

  const removeImage = (field: string) => {
    setFormData({ ...formData, [field]: '' });
  };

  const addSlideUrl = () => {
    if (!newSlideUrl.trim()) {
      alert('Please enter a valid image URL');
      return;
    }
    
    setFormData({ 
      ...formData, 
      heroSlides: [...formData.heroSlides, newSlideUrl.trim()] 
    });
    setNewSlideUrl('');
    setMessage('Slide added! Click "Save Changes" to apply.');
  };

  const removeSlide = (index: number) => {
    const newSlides = formData.heroSlides.filter((_, i) => i !== index);
    setFormData({ ...formData, heroSlides: newSlides });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-chocolate-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-8">Site Settings</h1>

      <div className="bg-white dark:bg-chocolate-900 rounded-xl shadow-sm border border-gray-200 dark:border-chocolate-800 p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Logo Section */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 pb-2 border-b border-gray-200 dark:border-chocolate-800">
              Logo & Branding
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Site Logo
              </label>
              {formData.logo ? (
                <div className="relative inline-block">
                  <img 
                    src={formData.logo} 
                    alt="Logo preview" 
                    className="h-24 w-auto object-contain border border-gray-300 dark:border-chocolate-700 rounded-lg bg-white dark:bg-chocolate-800 p-2"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage('logo')}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer block w-full max-w-md border-2 border-dashed border-gray-300 dark:border-chocolate-700 rounded-lg p-6 text-center hover:border-chocolate-500 transition-colors">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {uploadingLogo ? 'Uploading...' : 'Click to upload logo'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'logo')}
                    className="hidden"
                    disabled={uploadingLogo}
                  />
                </label>
              )}
            </div>
          </div>



          {/* Delivery Fees Section */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 pb-2 border-b border-gray-200 dark:border-chocolate-800">
              Delivery Fees (رسوم التوصيل)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Beni Suef (داخل بني سويف) - EGP
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.deliveryFeeBeniSuef}
                  onChange={(e) => setFormData({ ...formData, deliveryFeeBeniSuef: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-chocolate-700 focus:ring-2 focus:ring-chocolate-500 focus:border-transparent outline-none transition-all bg-white dark:bg-chocolate-800 text-gray-900 dark:text-gray-100"
                  placeholder="20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  East Nile (شرق النيل) - EGP
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.deliveryFeeEastNile}
                  onChange={(e) => setFormData({ ...formData, deliveryFeeEastNile: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-chocolate-700 focus:ring-2 focus:ring-chocolate-500 focus:border-transparent outline-none transition-all bg-white dark:bg-chocolate-800 text-gray-900 dark:text-gray-100"
                  placeholder="40"
                />
              </div>
            </div>
          </div>

          {/* Our Story Section */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 pb-2 border-b border-gray-200 dark:border-chocolate-800">
              Our Story Content
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Story Main Title
                  </label>
                  <input
                    type="text"
                    value={formData.ourStoryTitle}
                    onChange={(e) => setFormData({ ...formData, ourStoryTitle: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-chocolate-700 focus:ring-2 focus:ring-chocolate-500 focus:border-transparent outline-none transition-all bg-white dark:bg-chocolate-800 text-gray-900 dark:text-gray-100"
                    placeholder="Our Story"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Story Subtitle
                  </label>
                  <input
                    type="text"
                    value={formData.ourStorySubtitle}
                    onChange={(e) => setFormData({ ...formData, ourStorySubtitle: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-chocolate-700 focus:ring-2 focus:ring-chocolate-500 focus:border-transparent outline-none transition-all bg-white dark:bg-chocolate-800 text-gray-900 dark:text-gray-100"
                    placeholder="Crafting moments of joy..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Beginning Section Title
                </label>
                <input
                  type="text"
                  value={formData.ourStoryBeginningTitle}
                  onChange={(e) => setFormData({ ...formData, ourStoryBeginningTitle: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-chocolate-700 focus:ring-2 focus:ring-chocolate-500 focus:border-transparent outline-none transition-all bg-white dark:bg-chocolate-800 text-gray-900 dark:text-gray-100"
                  placeholder="The Beginning"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Beginning Content
                </label>
                <textarea
                  rows={4}
                  value={formData.ourStoryBeginning}
                  onChange={(e) => setFormData({ ...formData, ourStoryBeginning: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-chocolate-700 focus:ring-2 focus:ring-chocolate-500 focus:border-transparent outline-none transition-all bg-white dark:bg-chocolate-800 text-gray-900 dark:text-gray-100"
                  placeholder="Tell the story of how your chocolate shop began..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Philosophy Section Title
                </label>
                <input
                  type="text"
                  value={formData.ourStoryPhilosophyTitle}
                  onChange={(e) => setFormData({ ...formData, ourStoryPhilosophyTitle: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-chocolate-700 focus:ring-2 focus:ring-chocolate-500 focus:border-transparent outline-none transition-all bg-white dark:bg-chocolate-800 text-gray-900 dark:text-gray-100"
                  placeholder="Our Philosophy"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Philosophy Content
                </label>
                <textarea
                  rows={4}
                  value={formData.ourStoryPhilosophy}
                  onChange={(e) => setFormData({ ...formData, ourStoryPhilosophy: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-chocolate-700 focus:ring-2 focus:ring-chocolate-500 focus:border-transparent outline-none transition-all bg-white dark:bg-chocolate-800 text-gray-900 dark:text-gray-100"
                  placeholder="Describe your philosophy and approach..."
                />
              </div>
            </div>
          </div>

          {/* Hero Section */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 pb-2 border-b border-gray-200 dark:border-chocolate-800">
              Homepage Hero Section
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Hero Title (Part 1)
                  </label>
                  <input
                    type="text"
                    value={formData.heroTitle}
                    onChange={(e) => setFormData({ ...formData, heroTitle: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-chocolate-700 focus:ring-2 focus:ring-chocolate-500 focus:border-transparent outline-none transition-all bg-white dark:bg-chocolate-800 text-gray-900 dark:text-gray-100"
                    placeholder="Where Every Bite"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Hero Highlight (Part 2)
                  </label>
                  <input
                    type="text"
                    value={formData.heroHighlight}
                    onChange={(e) => setFormData({ ...formData, heroHighlight: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-chocolate-700 focus:ring-2 focus:ring-chocolate-500 focus:border-transparent outline-none transition-all bg-white dark:bg-chocolate-800 text-gray-900 dark:text-gray-100"
                    placeholder="Melts Your Heart"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Hero Subtitle
                </label>
                <textarea
                  rows={2}
                  value={formData.heroSubtitle}
                  onChange={(e) => setFormData({ ...formData, heroSubtitle: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-chocolate-700 focus:ring-2 focus:ring-chocolate-500 focus:border-transparent outline-none transition-all bg-white dark:bg-chocolate-800 text-gray-900 dark:text-gray-100"
                  placeholder="Experience the finest handmade chocolates..."
                />
              </div>
            </div>
          </div>

          {/* Hero Background Slider */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 pb-2 border-b border-gray-200 dark:border-chocolate-800">
              Hero Background Slider
            </h2>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Upload images for the hero background slider. Images will auto-rotate every 5 seconds.
              </p>
              
              {/* Current Slides */}
              {formData.heroSlides.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {formData.heroSlides.map((slide, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={slide}
                        alt={`Slide ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-300 dark:border-chocolate-700"
                      />
                      <button
                        type="button"
                        onClick={() => removeSlide(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                        Slide {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Slide URL */}
              <div className="flex gap-2">
                <input
                  type="url"
                  value={newSlideUrl}
                  onChange={(e) => setNewSlideUrl(e.target.value)}
                  placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-chocolate-700 focus:ring-2 focus:ring-chocolate-500 focus:border-transparent outline-none transition-all bg-white dark:bg-chocolate-800 text-gray-900 dark:text-gray-100"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSlideUrl())}
                />
                <button
                  type="button"
                  onClick={addSlideUrl}
                  className="px-6 py-2 bg-chocolate-600 text-white rounded-lg hover:bg-chocolate-700 transition-colors flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Add
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                💡 Tip: Use high-quality images (1200x800 or larger). You can use free stock photos from 
                <a href="https://unsplash.com" target="_blank" rel="noopener" className="text-chocolate-600 hover:underline"> Unsplash</a> or 
                <a href="https://pexels.com" target="_blank" rel="noopener" className="text-chocolate-600 hover:underline"> Pexels</a>
              </p>
            </div>
          </div>

          {/* Placeholder 1 */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 pb-2 border-b border-gray-200 dark:border-chocolate-800">
              Feature Card 1
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Icon (Emoji)
                  </label>
                  <input
                    type="text"
                    value={formData.featureCard1Icon}
                    onChange={(e) => setFormData({ ...formData, featureCard1Icon: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-chocolate-700 focus:ring-2 focus:ring-chocolate-500 focus:border-transparent outline-none transition-all bg-white dark:bg-chocolate-800 text-gray-900 dark:text-gray-100"
                    placeholder="🌿"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.featureCard1Title}
                    onChange={(e) => setFormData({ ...formData, featureCard1Title: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-chocolate-700 focus:ring-2 focus:ring-chocolate-500 focus:border-transparent outline-none transition-all bg-white dark:bg-chocolate-800 text-gray-900 dark:text-gray-100"
                    placeholder="Premium Ingredients"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={formData.featureCard1Description}
                    onChange={(e) => setFormData({ ...formData, featureCard1Description: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-chocolate-700 focus:ring-2 focus:ring-chocolate-500 focus:border-transparent outline-none transition-all bg-white dark:bg-chocolate-800 text-gray-900 dark:text-gray-100"
                    placeholder="Only the finest cocoa..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Placeholder 2 */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 pb-2 border-b border-gray-200 dark:border-chocolate-800">
              Feature Card 2
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Icon (Emoji)
                  </label>
                  <input
                    type="text"
                    value={formData.featureCard2Icon}
                    onChange={(e) => setFormData({ ...formData, featureCard2Icon: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-chocolate-700 focus:ring-2 focus:ring-chocolate-500 focus:border-transparent outline-none transition-all bg-white dark:bg-chocolate-800 text-gray-900 dark:text-gray-100"
                    placeholder="🖐️"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.featureCard2Title}
                    onChange={(e) => setFormData({ ...formData, featureCard2Title: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-chocolate-700 focus:ring-2 focus:ring-chocolate-500 focus:border-transparent outline-none transition-all bg-white dark:bg-chocolate-800 text-gray-900 dark:text-gray-100"
                    placeholder="Handmade with Love"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={formData.featureCard2Description}
                    onChange={(e) => setFormData({ ...formData, featureCard2Description: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-chocolate-700 focus:ring-2 focus:ring-chocolate-500 focus:border-transparent outline-none transition-all bg-white dark:bg-chocolate-800 text-gray-900 dark:text-gray-100"
                    placeholder="Crafted in small batches..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Placeholder 3 */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 pb-2 border-b border-gray-200 dark:border-chocolate-800">
              Feature Card 3
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Icon (Emoji)
                  </label>
                  <input
                    type="text"
                    value={formData.featureCard3Icon}
                    onChange={(e) => setFormData({ ...formData, featureCard3Icon: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-chocolate-700 focus:ring-2 focus:ring-chocolate-500 focus:border-transparent outline-none transition-all bg-white dark:bg-chocolate-800 text-gray-900 dark:text-gray-100"
                    placeholder="✨"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.featureCard3Title}
                    onChange={(e) => setFormData({ ...formData, featureCard3Title: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-chocolate-700 focus:ring-2 focus:ring-chocolate-500 focus:border-transparent outline-none transition-all bg-white dark:bg-chocolate-800 text-gray-900 dark:text-gray-100"
                    placeholder="Unique Flavors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={formData.featureCard3Description}
                    onChange={(e) => setFormData({ ...formData, featureCard3Description: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-chocolate-700 focus:ring-2 focus:ring-chocolate-500 focus:border-transparent outline-none transition-all bg-white dark:bg-chocolate-800 text-gray-900 dark:text-gray-100"
                    placeholder="Innovative combinations..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Social Media Section */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 pb-2 border-b border-gray-200 dark:border-chocolate-800">
              Social Media Links
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Facebook URL
                </label>
                <input
                  type="url"
                  value={formData.facebook}
                  onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-chocolate-700 focus:ring-2 focus:ring-chocolate-500 focus:border-transparent outline-none transition-all bg-white dark:bg-chocolate-800 text-gray-900 dark:text-gray-100"
                  placeholder="https://facebook.com/chococelia"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Instagram URL
                </label>
                <input
                  type="url"
                  value={formData.instagram}
                  onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-chocolate-700 focus:ring-2 focus:ring-chocolate-500 focus:border-transparent outline-none transition-all bg-white dark:bg-chocolate-800 text-gray-900 dark:text-gray-100"
                  placeholder="https://instagram.com/chococelia"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Twitter URL
                </label>
                <input
                  type="url"
                  value={formData.twitter}
                  onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-chocolate-700 focus:ring-2 focus:ring-chocolate-500 focus:border-transparent outline-none transition-all bg-white dark:bg-chocolate-800 text-gray-900 dark:text-gray-100"
                  placeholder="https://twitter.com/chococelia"
                />
              </div>
            </div>
          </div>

          {message && (
            <div className={`p-3 rounded-lg text-sm ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {message}
            </div>
          )}

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saving}
              className="bg-chocolate-600 text-white px-6 py-2 rounded-lg hover:bg-chocolate-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
