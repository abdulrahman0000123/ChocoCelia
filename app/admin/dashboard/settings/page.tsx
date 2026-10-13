'use client';
import Link from 'next/link';
import { adminFetch, adminError, useAdmin } from '../components/AdminContext';

import { AdminNotice } from '../components/AdminUI';
import { useState, useEffect } from 'react';
import { Save, Loader2, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const {t,ar} = useAdmin();
  const [loadError,setLoadError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newSlideUrl, setNewSlideUrl] = useState('');
  const [formData, setFormData] = useState({
    phone: '',
    facebook: '',
    instagram: '',
    twitter: '',
    // Delivery Fees
    deliveryFeeBeniSuef: '20',
    deliveryFeeEastNile: '40',
    // Payment Methods
    instaPayLink: '',
    cashWalletNumber: '',
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

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoadError('');setLoading(true);
    try {
      const res = await adminFetch('/api/settings');
      if(!res.ok) throw new Error();
      if (res.ok) {
        const data = await res.json();
        setFormData({
          phone: data.phone || '',
          facebook: data.facebook || '',
          instagram: data.instagram || '',
          twitter: data.twitter || '',
          // Delivery Fees
          deliveryFeeBeniSuef: data.deliveryFeeBeniSuef !== undefined ? data.deliveryFeeBeniSuef.toString() : '20',
          deliveryFeeEastNile: data.deliveryFeeEastNile !== undefined ? data.deliveryFeeEastNile.toString() : '40',
          // Payment Methods
          instaPayLink: data.instaPayLink || '',
          cashWalletNumber: data.cashWalletNumber || '',
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
      setLoadError('load');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const loadingToast = toast.loading(t('جارٍ حفظ الإعدادات…','Saving settings...'));

    try {
      const res = await adminFetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(Object.entries(formData).filter(([key]) => !key.startsWith('deliveryFee')))),
      });

      if (res.ok) {
        toast.success(t('تم حفظ الإعدادات.','Settings saved successfully! 🎉'), { id: loadingToast });
        // Reload after 1 second to show updated settings across the site
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        toast.error(t('تعذر تحديث الإعدادات.','Failed to update settings'), { id: loadingToast });
      }
    } catch (error) {
      toast.error(t('تعذر الحفظ.','An error occurred while saving'), { id: loadingToast });
    } finally {
      setSaving(false);
    }
  };

  const addSlideUrl = () => {
    if (!newSlideUrl.trim()) {
      toast.error(t('أدخل رابط صورة صحيحًا.','Please enter a valid image URL'));
      return;
    }
    
    setFormData({ 
      ...formData, 
      heroSlides: [...formData.heroSlides, newSlideUrl.trim()] 
    });
    setNewSlideUrl('');
    toast.success(t('تمت إضافة الصورة. احفظ التغييرات.','Slide URL added! Remember to save changes.'));
  };

  const removeSlide = (index: number) => {
    const newSlides = formData.heroSlides.filter((_, i) => i !== index);
    setFormData({ ...formData, heroSlides: newSlides });
    toast.success(t('تمت إزالة الصورة. احفظ التغييرات.','Slide removed! Remember to save changes.'));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gold-500" />
      </div>
    );
  }

  if(loadError) return <AdminNotice retry={fetchSettings}>{adminError(null,ar)}</AdminNotice>;
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-white tracking-wide">{t('إعدادات الموقع','Site Settings')}</h1>
        <Link className="inline-block mt-3 text-sm text-gold-300 underline" href="/admin/dashboard/seo">{t('إعدادات الظهور والذكاء الاصطناعي','SEO settings & AI API key / إعدادات الظهور ومفتاح AI')}</Link>
        <p className="text-sm text-chocolate-300 mt-1">{t('إدارة التواصل والدفع ومحتوى الموقع.','Configure delivery fees, contact channels, hero media, and landing page content')}</p>
      </div>

      <div className="bg-chocolate-900/20 rounded-2xl shadow p-6 border border-chocolate-800 backdrop-blur-md">
        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Contact & Social Channels */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b border-chocolate-800/40">
              {t('التواصل والشبكات الاجتماعية','Contact & Social Channels')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-chocolate-200 mb-1">
                  {t('رقم الهاتف وواتساب','Phone / WhatsApp Number')}
                </label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 bg-chocolate-950/60 border border-chocolate-800 rounded-xl text-white placeholder-chocolate-500 outline-none focus:ring-2 focus:ring-gold-500 transition-all text-base"
                  placeholder="e.g. +201000000000"
                />
                <p className="text-xs text-chocolate-300 mt-1">{t('أدخل كود الدولة ليعمل رابط واتساب، مثل 201xxxxxxxxx.','Include country code for proper WhatsApp link routing (e.g. 201xxxxxxxxx).')}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-chocolate-200 mb-1">
                  {t('رابط فيسبوك','Facebook URL')}
                </label>
                <input
                  type="url"
                  value={formData.facebook}
                  onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                  className="w-full px-4 py-2 bg-chocolate-950/60 border border-chocolate-800 rounded-xl text-white placeholder-chocolate-500 outline-none focus:ring-2 focus:ring-gold-500 transition-all text-base"
                  placeholder="https://facebook.com/yourpage"
                />
                <p className="text-xs text-chocolate-300 mt-1">{t('يُستخدم لرابط التواصل عبر ماسنجر.','Used to compute the floating Messenger chat action.')}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-chocolate-200 mb-1">
                  {t('رابط إنستجرام','Instagram URL')}
                </label>
                <input
                  type="url"
                  value={formData.instagram}
                  onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                  className="w-full px-4 py-2 bg-chocolate-950/60 border border-chocolate-800 rounded-xl text-white placeholder-chocolate-500 outline-none focus:ring-2 focus:ring-gold-500 transition-all text-base"
                  placeholder="https://instagram.com/yourhandle"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-chocolate-200 mb-1">
                  {t('رابط تويتر','Twitter URL')}
                </label>
                <input
                  type="url"
                  value={formData.twitter}
                  onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                  className="w-full px-4 py-2 bg-chocolate-950/60 border border-chocolate-800 rounded-xl text-white placeholder-chocolate-500 outline-none focus:ring-2 focus:ring-gold-500 transition-all text-base"
                  placeholder="https://twitter.com/yourhandle"
                />
              </div>
            </div>
          </div>

          <div><h2 className="text-xl font-bold mb-4">{t('المالية والتوصيل','Finance & delivery')}</h2><Link href="/admin/dashboard/settings/finance" className="inline-flex border border-border rounded-xl px-4 py-3">{t('إدارة رسوم التوصيل والتكلفة والمخصصات','Manage delivery fees, costs and allocations')}</Link></div>

          {/* Payment Methods Section */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b border-chocolate-800/40">
              {t('طرق الدفع','Payment Methods (طرق الدفع)')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-chocolate-200 mb-1">
                  {t('رابط إنستا باي','InstaPay Link (رابط إنستا باي)')}
                </label>
                <input
                  type="text"
                  value={formData.instaPayLink}
                  onChange={(e) => setFormData({ ...formData, instaPayLink: e.target.value })}
                  className="w-full px-4 py-2 bg-chocolate-950/60 border border-chocolate-800 rounded-xl text-white placeholder-chocolate-500 outline-none focus:ring-2 focus:ring-gold-500 transition-all text-base"
                  placeholder="https://instapay.com/..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-chocolate-200 mb-1">
                  {t('رقم المحفظة','Cash Wallet Number (رقم المحفظة)')}
                </label>
                <input
                  type="text"
                  value={formData.cashWalletNumber}
                  onChange={(e) => setFormData({ ...formData, cashWalletNumber: e.target.value })}
                  className="w-full px-4 py-2 bg-chocolate-950/60 border border-chocolate-800 rounded-xl text-white placeholder-chocolate-500 outline-none focus:ring-2 focus:ring-gold-500 transition-all text-base"
                  placeholder="01xxxxxxxxx"
                />
              </div>
            </div>
          </div>

          {/* Our Story Section */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b border-chocolate-800/40">
              {t('محتوى قصتنا','Our Story Content')}
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-chocolate-200 mb-1">
                    {t('عنوان قصتنا','Story Main Title')}
                  </label>
                  <input
                    type="text"
                    value={formData.ourStoryTitle}
                    onChange={(e) => setFormData({ ...formData, ourStoryTitle: e.target.value })}
                    className="w-full px-4 py-2 bg-chocolate-950/60 border border-chocolate-800 rounded-xl text-white placeholder-chocolate-500 outline-none focus:ring-2 focus:ring-gold-500 transition-all text-base"
                    placeholder="Our Story"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-chocolate-200 mb-1">
                    {t('وصف قصتنا','Story Subtitle')}
                  </label>
                  <input
                    type="text"
                    value={formData.ourStorySubtitle}
                    onChange={(e) => setFormData({ ...formData, ourStorySubtitle: e.target.value })}
                    className="w-full px-4 py-2 bg-chocolate-950/60 border border-chocolate-800 rounded-xl text-white placeholder-chocolate-500 outline-none focus:ring-2 focus:ring-gold-500 transition-all text-base"
                    placeholder="Crafting moments of joy..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-chocolate-200 mb-1">
                  {t('عنوان قسم البداية','Beginning Section Title')}
                </label>
                <input
                  type="text"
                  value={formData.ourStoryBeginningTitle}
                  onChange={(e) => setFormData({ ...formData, ourStoryBeginningTitle: e.target.value })}
                  className="w-full px-4 py-2 bg-chocolate-950/60 border border-chocolate-800 rounded-xl text-white placeholder-chocolate-500 outline-none focus:ring-2 focus:ring-gold-500 transition-all text-base"
                  placeholder="The Beginning"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-chocolate-200 mb-1">
                  {t('محتوى البداية','Beginning Content')}
                </label>
                <textarea
                  rows={4}
                  value={formData.ourStoryBeginning}
                  onChange={(e) => setFormData({ ...formData, ourStoryBeginning: e.target.value })}
                  className="w-full px-4 py-2 bg-chocolate-950/60 border border-chocolate-800 rounded-xl text-white placeholder-chocolate-500 outline-none focus:ring-2 focus:ring-gold-500 transition-all text-base"
                  placeholder="Tell the story of how your chocolate shop began..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-chocolate-200 mb-1">
                  {t('عنوان فلسفتنا','Philosophy Section Title')}
                </label>
                <input
                  type="text"
                  value={formData.ourStoryPhilosophyTitle}
                  onChange={(e) => setFormData({ ...formData, ourStoryPhilosophyTitle: e.target.value })}
                  className="w-full px-4 py-2 bg-chocolate-950/60 border border-chocolate-800 rounded-xl text-white placeholder-chocolate-500 outline-none focus:ring-2 focus:ring-gold-500 transition-all text-base"
                  placeholder="Our Philosophy"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-chocolate-200 mb-1">
                  {t('محتوى فلسفتنا','Philosophy Content')}
                </label>
                <textarea
                  rows={4}
                  value={formData.ourStoryPhilosophy}
                  onChange={(e) => setFormData({ ...formData, ourStoryPhilosophy: e.target.value })}
                  className="w-full px-4 py-2 bg-chocolate-950/60 border border-chocolate-800 rounded-xl text-white placeholder-chocolate-500 outline-none focus:ring-2 focus:ring-gold-500 transition-all text-base"
                  placeholder="Describe your philosophy and approach..."
                />
              </div>
            </div>
          </div>

          {/* Homepage Hero Section */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b border-chocolate-800/40">
              {t('مقدمة الصفحة الرئيسية','Homepage Hero Section')}
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-chocolate-200 mb-1">
                    {t('عنوان المقدمة','Hero Title (Part 1)')}
                  </label>
                  <input
                    type="text"
                    value={formData.heroTitle}
                    onChange={(e) => setFormData({ ...formData, heroTitle: e.target.value })}
                    className="w-full px-4 py-2 bg-chocolate-950/60 border border-chocolate-800 rounded-xl text-white placeholder-chocolate-500 outline-none focus:ring-2 focus:ring-gold-500 transition-all text-base"
                    placeholder="Where Every Bite"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-chocolate-200 mb-1">
                    {t('الجزء البارز من العنوان','Hero Highlight (Part 2)')}
                  </label>
                  <input
                    type="text"
                    value={formData.heroHighlight}
                    onChange={(e) => setFormData({ ...formData, heroHighlight: e.target.value })}
                    className="w-full px-4 py-2 bg-chocolate-950/60 border border-chocolate-800 rounded-xl text-white placeholder-chocolate-500 outline-none focus:ring-2 focus:ring-gold-500 transition-all text-base"
                    placeholder="Melts Your Heart"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-chocolate-200 mb-1">
                  {t('وصف المقدمة','Hero Subtitle')}
                </label>
                <textarea
                  rows={2}
                  value={formData.heroSubtitle}
                  onChange={(e) => setFormData({ ...formData, heroSubtitle: e.target.value })}
                  className="w-full px-4 py-2 bg-chocolate-950/60 border border-chocolate-800 rounded-xl text-white placeholder-chocolate-500 outline-none focus:ring-2 focus:ring-gold-500 transition-all text-base"
                  placeholder="Experience the finest handmade chocolates..."
                />
              </div>
            </div>
          </div>

          {/* Hero Background Slider */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b border-chocolate-800/40">
              {t('صور مقدمة الموقع','Hero Background Slider')}
            </h2>
            <div className="space-y-4">
              <p className="text-sm text-chocolate-300">
                {t('أضف الصور التي تظهر في مقدمة الموقع.','Provide slide images for the hero background slider.')}
              </p>
              
              {/* Current Slides */}
              {formData.heroSlides.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {formData.heroSlides.map((slide, index) => (
                    <div key={index} className="relative group rounded-xl overflow-hidden border border-chocolate-800 bg-chocolate-950/40">
                      <img
                        src={slide}
                        alt={`Slide ${index + 1}`}
                        className="w-full h-32 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeSlide(index)}
                        className="absolute top-2 right-2 bg-red-600/90 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-700 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
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
                  className="flex-1 px-4 py-2 bg-chocolate-950/60 border border-chocolate-800 rounded-xl text-white placeholder-chocolate-500 outline-none focus:ring-2 focus:ring-gold-500 transition-all text-base"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSlideUrl())}
                />
                <button
                  type="button"
                  onClick={addSlideUrl}
                  className="px-5 py-2 bg-gold-500/10 hover:bg-gold-500/20 text-gold-400 border border-gold-500/20 rounded-xl transition-all flex items-center gap-2 cursor-pointer font-semibold"
                >
                  <Upload className="w-4 h-4" />
                  {t('إضافة','Add')}
                </button>
              </div>
            </div>
          </div>

          {/* Feature Card 1 */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b border-chocolate-800/40">
              {t('ميزة ١','Feature Card 1')}
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-chocolate-200 mb-1">
                    {t('الأيقونة','Icon (Emoji)')}
                  </label>
                  <input
                    type="text"
                    value={formData.featureCard1Icon}
                    onChange={(e) => setFormData({ ...formData, featureCard1Icon: e.target.value })}
                    className="w-full px-4 py-2 bg-chocolate-950/60 border border-chocolate-800 rounded-xl text-white placeholder-chocolate-500 outline-none focus:ring-2 focus:ring-gold-500 transition-all text-base"
                    placeholder="🌿"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-chocolate-200 mb-1">
                    {t('العنوان','Title')}
                  </label>
                  <input
                    type="text"
                    value={formData.featureCard1Title}
                    onChange={(e) => setFormData({ ...formData, featureCard1Title: e.target.value })}
                    className="w-full px-4 py-2 bg-chocolate-950/60 border border-chocolate-800 rounded-xl text-white placeholder-chocolate-500 outline-none focus:ring-2 focus:ring-gold-500 transition-all text-base"
                    placeholder="Premium Ingredients"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-chocolate-200 mb-1">
                    {t('الوصف','Description')}
                  </label>
                  <input
                    type="text"
                    value={formData.featureCard1Description}
                    onChange={(e) => setFormData({ ...formData, featureCard1Description: e.target.value })}
                    className="w-full px-4 py-2 bg-chocolate-950/60 border border-chocolate-800 rounded-xl text-white placeholder-chocolate-500 outline-none focus:ring-2 focus:ring-gold-500 transition-all text-base"
                    placeholder="Only the finest cocoa..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Feature Card 2 */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b border-chocolate-800/40">
              {t('ميزة ٢','Feature Card 2')}
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-chocolate-200 mb-1">
                    {t('الأيقونة','Icon (Emoji)')}
                  </label>
                  <input
                    type="text"
                    value={formData.featureCard2Icon}
                    onChange={(e) => setFormData({ ...formData, featureCard2Icon: e.target.value })}
                    className="w-full px-4 py-2 bg-chocolate-950/60 border border-chocolate-800 rounded-xl text-white placeholder-chocolate-500 outline-none focus:ring-2 focus:ring-gold-500 transition-all text-base"
                    placeholder="🤎"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-chocolate-200 mb-1">
                    {t('العنوان','Title')}
                  </label>
                  <input
                    type="text"
                    value={formData.featureCard2Title}
                    onChange={(e) => setFormData({ ...formData, featureCard2Title: e.target.value })}
                    className="w-full px-4 py-2 bg-chocolate-950/60 border border-chocolate-800 rounded-xl text-white placeholder-chocolate-500 outline-none focus:ring-2 focus:ring-gold-500 transition-all text-base"
                    placeholder="Handmade with Love"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-chocolate-200 mb-1">
                    {t('الوصف','Description')}
                  </label>
                  <input
                    type="text"
                    value={formData.featureCard2Description}
                    onChange={(e) => setFormData({ ...formData, featureCard2Description: e.target.value })}
                    className="w-full px-4 py-2 bg-chocolate-950/60 border border-chocolate-800 rounded-xl text-white placeholder-chocolate-500 outline-none focus:ring-2 focus:ring-gold-500 transition-all text-base"
                    placeholder="Crafted in small batches..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Feature Card 3 */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b border-chocolate-800/40">
              {t('ميزة ٣','Feature Card 3')}
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-chocolate-200 mb-1">
                    {t('الأيقونة','Icon (Emoji)')}
                  </label>
                  <input
                    type="text"
                    value={formData.featureCard3Icon}
                    onChange={(e) => setFormData({ ...formData, featureCard3Icon: e.target.value })}
                    className="w-full px-4 py-2 bg-chocolate-950/60 border border-chocolate-800 rounded-xl text-white placeholder-chocolate-500 outline-none focus:ring-2 focus:ring-gold-500 transition-all text-base"
                    placeholder="✨"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-chocolate-200 mb-1">
                    {t('العنوان','Title')}
                  </label>
                  <input
                    type="text"
                    value={formData.featureCard3Title}
                    onChange={(e) => setFormData({ ...formData, featureCard3Title: e.target.value })}
                    className="w-full px-4 py-2 bg-chocolate-950/60 border border-chocolate-800 rounded-xl text-white placeholder-chocolate-500 outline-none focus:ring-2 focus:ring-gold-500 transition-all text-base"
                    placeholder="Unique Flavors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-chocolate-200 mb-1">
                    {t('الوصف','Description')}
                  </label>
                  <input
                    type="text"
                    value={formData.featureCard3Description}
                    onChange={(e) => setFormData({ ...formData, featureCard3Description: e.target.value })}
                    className="w-full px-4 py-2 bg-chocolate-950/60 border border-chocolate-800 rounded-xl text-white placeholder-chocolate-500 outline-none focus:ring-2 focus:ring-gold-500 transition-all text-base"
                    placeholder="Innovative combinations..."
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-chocolate-800/40">
            <button
              type="submit"
              disabled={saving}
              className="bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-600 text-chocolate-950 px-8 py-3 rounded-xl font-bold transition-all duration-300 shadow-[0_0_15px_rgba(212,175,55,0.15)] hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] cursor-pointer flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('جارٍ الحفظ…','Saving...')}
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {t('حفظ التغييرات','Save Changes')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
