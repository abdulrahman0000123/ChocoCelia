'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Loader2, Tag, Percent, ToggleLeft, Megaphone, Search } from 'lucide-react';
import toast from 'react-hot-toast';

type ActiveTab = 'campaigns' | 'banners' | 'coupons';

export default function MarketingAdminPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('campaigns');
  
  // Data state
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    heroImage: '',
    heroTitleEn: '',
    heroTitleAr: '',
    heroCtaEn: '',
    heroCtaAr: '',
    heroCtaLink: '',
    accentColor: '',
    collectionLink: '',
    isActive: false,
    startsAt: '',
    endsAt: '',
  });

  const [bannerForm, setBannerForm] = useState({
    textEn: '',
    textAr: '',
    ctaEn: '',
    ctaAr: '',
    link: '',
    isActive: false,
    startsAt: '',
    endsAt: '',
  });

  const [couponForm, setCouponForm] = useState({
    code: '',
    discountPct: '',
    maxUses: '',
    expiry: '',
    isActive: true,
  });

  useEffect(() => {
    fetchData();
    setSearchQuery('');
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'campaigns') {
        const res = await fetch('/api/campaigns');
        if (res.ok) setCampaigns(await res.json());
      } else if (activeTab === 'banners') {
        const res = await fetch('/api/banners');
        if (res.ok) setBanners(await res.json());
      } else if (activeTab === 'coupons') {
        const res = await fetch('/api/coupons');
        if (res.ok) setCoupons(await res.json());
      }
    } catch (err) {
      console.error(err);
      toast.error(`Error loading ${activeTab}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    if (activeTab === 'campaigns') {
      setCampaignForm({
        name: item.name,
        heroImage: item.heroImage,
        heroTitleEn: item.heroTitleEn,
        heroTitleAr: item.heroTitleAr,
        heroCtaEn: item.heroCtaEn,
        heroCtaAr: item.heroCtaAr,
        heroCtaLink: item.heroCtaLink,
        accentColor: item.accentColor || '',
        collectionLink: item.collectionLink || '',
        isActive: item.isActive,
        startsAt: item.startsAt ? new Date(item.startsAt).toISOString().split('T')[0] : '',
        endsAt: item.endsAt ? new Date(item.endsAt).toISOString().split('T')[0] : '',
      });
    } else if (activeTab === 'banners') {
      setBannerForm({
        textEn: item.textEn,
        textAr: item.textAr,
        ctaEn: item.ctaEn || '',
        ctaAr: item.ctaAr || '',
        link: item.link || '',
        isActive: item.isActive,
        startsAt: item.startsAt ? new Date(item.startsAt).toISOString().split('T')[0] : '',
        endsAt: item.endsAt ? new Date(item.endsAt).toISOString().split('T')[0] : '',
      });
    } else if (activeTab === 'coupons') {
      setCouponForm({
        code: item.code,
        discountPct: item.discountPct.toString(),
        maxUses: item.maxUses ? item.maxUses.toString() : '',
        expiry: item.expiry ? new Date(item.expiry).toISOString().split('T')[0] : '',
        isActive: item.isActive,
      });
    }
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-medium text-white">Are you sure you want to delete this marketing item?</p>
        <p className="text-sm text-chocolate-300">This action cannot be undone.</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              setDeletingId(id);
              const loadingToast = toast.loading('Deleting...');
              try {
                const res = await fetch(`/api/${activeTab}?id=${id}`, {
                  method: 'DELETE',
                });
                if (res.ok) {
                  toast.success('Deleted successfully!', { id: loadingToast });
                  fetchData();
                } else {
                  toast.error('Failed to delete', { id: loadingToast });
                }
              } catch (error) {
                console.error(error);
                toast.error('Failed to delete', { id: loadingToast });
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

  const handleToggleActive = async (item: any) => {
    const loadingToast = toast.loading('Updating status...');
    try {
      const res = await fetch(`/api/${activeTab}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...item,
          isActive: !item.isActive,
        }),
      });

      if (res.ok) {
        toast.success('Status updated successfully!', { id: loadingToast });
        fetchData();
      } else {
        toast.error('Failed to update status', { id: loadingToast });
      }
    } catch (err) {
      console.error(err);
      toast.error('Error updating status', { id: loadingToast });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const loadingToast = toast.loading('Saving item...');
    
    try {
      const method = editingItem ? 'PUT' : 'POST';
      let payload: any = {};

      if (activeTab === 'campaigns') {
        payload = campaignForm;
      } else if (activeTab === 'banners') {
        payload = bannerForm;
      } else if (activeTab === 'coupons') {
        payload = {
          ...couponForm,
          discountPct: parseFloat(couponForm.discountPct),
          maxUses: couponForm.maxUses ? parseInt(couponForm.maxUses) : null,
          expiry: couponForm.expiry || null,
        };
      }

      if (editingItem) {
        payload.id = editingItem.id;
      }

      const res = await fetch(`/api/${activeTab}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success('Marketing item saved successfully! ✨', { id: loadingToast });
        setIsFormOpen(false);
        setEditingItem(null);
        resetForms();
        fetchData();
      } else {
        const errData = await res.json();
        toast.error(errData.error || 'Failed to save item', { id: loadingToast });
      }
    } catch (err) {
      console.error(err);
      toast.error('Error saving item', { id: loadingToast });
    } finally {
      setSaving(false);
    }
  };

  const resetForms = () => {
    setCampaignForm({
      name: '',
      heroImage: '',
      heroTitleEn: '',
      heroTitleAr: '',
      heroCtaEn: '',
      heroCtaAr: '',
      heroCtaLink: '',
      accentColor: '',
      collectionLink: '',
      isActive: false,
      startsAt: '',
      endsAt: '',
    });
    setBannerForm({
      textEn: '',
      textAr: '',
      ctaEn: '',
      ctaAr: '',
      link: '',
      isActive: false,
      startsAt: '',
      endsAt: '',
    });
    setCouponForm({
      code: '',
      discountPct: '',
      maxUses: '',
      expiry: '',
      isActive: true,
    });
  };

  const getFilteredData = () => {
    const query = searchQuery.toLowerCase();
    if (activeTab === 'campaigns') {
      return campaigns.filter(c => 
        c.name.toLowerCase().includes(query) || 
        c.heroTitleEn.toLowerCase().includes(query) ||
        c.heroTitleAr.toLowerCase().includes(query)
      );
    } else if (activeTab === 'banners') {
      return banners.filter(b => 
        b.textEn.toLowerCase().includes(query) || 
        b.textAr.toLowerCase().includes(query)
      );
    } else {
      return coupons.filter(cp => 
        cp.code.toLowerCase().includes(query)
      );
    }
  };

  const filteredData = getFilteredData();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white tracking-wide">Marketing & Campaigns</h1>
          <p className="text-sm text-chocolate-300 mt-1">
            Manage promotional campaigns, top display banners, and discount coupon codes
          </p>
        </div>
        {!isFormOpen && (
          <button
            onClick={() => {
              setEditingItem(null);
              resetForms();
              setIsFormOpen(true);
            }}
            className="bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-600 text-chocolate-950 px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold transition-all duration-300 shadow-[0_0_15px_rgba(212,175,55,0.15)] hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            Add {activeTab === 'campaigns' ? 'Campaign' : activeTab === 'banners' ? 'Banner' : 'Coupon'}
          </button>
        )}
      </div>

      {/* Tabs */}
      {!isFormOpen && (
        <div className="flex border-b border-chocolate-800 gap-2 md:gap-4 overflow-x-auto pb-px">
          <button
            onClick={() => { setActiveTab('campaigns'); }}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 font-bold text-sm transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'campaigns'
                ? 'border-gold-500 text-gold-400'
                : 'border-transparent text-chocolate-300 hover:text-white'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            Seasonal Campaigns
          </button>
          <button
            onClick={() => { setActiveTab('banners'); }}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 font-bold text-sm transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'banners'
                ? 'border-gold-500 text-gold-400'
                : 'border-transparent text-chocolate-300 hover:text-white'
            }`}
          >
            <ToggleLeft className="w-4 h-4" />
            Promo Banners
          </button>
          <button
            onClick={() => { setActiveTab('coupons'); }}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 font-bold text-sm transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'coupons'
                ? 'border-gold-500 text-gold-400'
                : 'border-transparent text-chocolate-300 hover:text-white'
            }`}
          >
            <Tag className="w-4 h-4" />
            Coupon Codes
          </button>
        </div>
      )}

      {isFormOpen ? (
        <div className="bg-chocolate-900/20 p-6 rounded-2xl shadow-xl border border-chocolate-800 max-w-3xl backdrop-blur-md">
          <h2 className="text-xl font-bold text-white mb-6">
            {editingItem ? `Edit ${activeTab.slice(0, -1)}` : `New ${activeTab.slice(0, -1)}`}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Campaign Form Fields */}
            {activeTab === 'campaigns' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-chocolate-200 mb-1">Campaign Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramadan Special"
                      className="w-full px-4 py-2 bg-chocolate-950/60 border border-chocolate-800 rounded-xl text-white placeholder-chocolate-500 outline-none focus:ring-2 focus:ring-gold-500 transition-all text-base"
                      value={campaignForm.name}
                      onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-chocolate-200 mb-1">Hero Image URL</label>
                    <input
                      type="text"
                      required
                      placeholder="https://..."
                      className="w-full px-4 py-2 bg-chocolate-950/60 border border-chocolate-800 rounded-xl text-white placeholder-chocolate-500 outline-none focus:ring-2 focus:ring-gold-500 transition-all text-base"
                      value={campaignForm.heroImage}
                      onChange={(e) => setCampaignForm({ ...campaignForm, heroImage: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-chocolate-200 mb-1">Hero Title (English)</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-2 bg-chocolate-950/60 border border-chocolate-800 rounded-xl text-white placeholder-chocolate-500 outline-none focus:ring-2 focus:ring-gold-500 transition-all text-base"
                      value={campaignForm.heroTitleEn}
                      onChange={(e) => setCampaignForm({ ...campaignForm, heroTitleEn: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-chocolate-200 mb-1 text-right">عنوان الهيرو (عربي)</label>
                    <input
                      type="text"
                      required
                      dir="rtl"
                      className="w-full px-4 py-2 bg-chocolate-950/60 border border-chocolate-800 rounded-xl text-white placeholder-chocolate-500 outline-none focus:ring-2 focus:ring-gold-500 transition-all text-right text-base"
                      value={campaignForm.heroTitleAr}
                      onChange={(e) => setCampaignForm({ ...campaignForm, heroTitleAr: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-chocolate-200 mb-1">Hero CTA text (English)</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Shop Now"
                      className="w-full px-4 py-2 bg-chocolate-950/60 border border-chocolate-800 rounded-xl text-white placeholder-chocolate-500 outline-none focus:ring-2 focus:ring-gold-500 transition-all text-base"
                      value={campaignForm.heroCtaEn}
                      onChange={(e) => setCampaignForm({ ...campaignForm, heroCtaEn: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-chocolate-200 mb-1 text-right">نص زر الدعوة (عربي)</label>
                    <input
                      type="text"
                      required
                      dir="rtl"
                      placeholder="مثال: تسوق الآن"
                      className="w-full px-4 py-2 bg-chocolate-950/60 border border-chocolate-800 rounded-xl text-white placeholder-chocolate-500 outline-none focus:ring-2 focus:ring-gold-500 transition-all text-right text-base"
                      value={campaignForm.heroCtaAr}
                      onChange={(e) => setCampaignForm({ ...campaignForm, heroCtaAr: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-chocolate-200 mb-1">CTA Action Link</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. /menu"
                      className="w-full px-4 py-2 bg-chocolate-950/60 border border-chocolate-800 rounded-xl text-white placeholder-chocolate-500 outline-none focus:ring-2 focus:ring-gold-500 transition-all text-base"
                      value={campaignForm.heroCtaLink}
                      onChange={(e) => setCampaignForm({ ...campaignForm, heroCtaLink: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-chocolate-200 mb-1">Accent Theme Color</label>
                    <input
                      type="text"
                      placeholder="e.g. #D4AF37"
                      className="w-full px-4 py-2 bg-chocolate-950/60 border border-chocolate-800 rounded-xl text-white placeholder-chocolate-500 outline-none focus:ring-2 focus:ring-gold-500 transition-all text-base"
                      value={campaignForm.accentColor}
                      onChange={(e) => setCampaignForm({ ...campaignForm, accentColor: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-chocolate-200 mb-1">Collection Link</label>
                    <input
                      type="text"
                      placeholder="e.g. /menu?category=ramadan"
                      className="w-full px-4 py-2 bg-chocolate-950/60 border border-chocolate-800 rounded-xl text-white placeholder-chocolate-500 outline-none focus:ring-2 focus:ring-gold-500 transition-all text-base"
                      value={campaignForm.collectionLink}
                      onChange={(e) => setCampaignForm({ ...campaignForm, collectionLink: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-chocolate-200 mb-1">Starts At</label>
                    <input
                      type="date"
                      className="w-full px-4 py-2 bg-chocolate-950/60 border border-chocolate-800 rounded-xl text-white outline-none focus:ring-2 focus:ring-gold-500 transition-all text-base"
                      value={campaignForm.startsAt}
                      onChange={(e) => setCampaignForm({ ...campaignForm, startsAt: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-chocolate-200 mb-1">Ends At</label>
                    <input
                      type="date"
                      className="w-full px-4 py-2 bg-chocolate-950/60 border border-chocolate-800 rounded-xl text-white outline-none focus:ring-2 focus:ring-gold-500 transition-all text-base"
                      value={campaignForm.endsAt}
                      onChange={(e) => setCampaignForm({ ...campaignForm, endsAt: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="campaignActive"
                    className="w-5 h-5 accent-gold-500 rounded text-gold-500 border-chocolate-800 bg-chocolate-950/60 focus:ring-gold-500"
                    checked={campaignForm.isActive}
                    onChange={(e) => setCampaignForm({ ...campaignForm, isActive: e.target.checked })}
                  />
                  <label htmlFor="campaignActive" className="text-sm font-semibold text-chocolate-200 cursor-pointer">
                    Set Active Campaign (Will deactivate other campaigns)
                  </label>
                </div>
              </div>
            )}

            {/* Banner Form Fields */}
            {activeTab === 'banners' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-chocolate-200 mb-1">Promo Text (English)</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Free shipping on orders above 500 EGP!"
                      className="w-full px-4 py-2 bg-chocolate-950/60 border border-chocolate-800 rounded-xl text-white placeholder-chocolate-500 outline-none focus:ring-2 focus:ring-gold-500 transition-all text-base"
                      value={bannerForm.textEn}
                      onChange={(e) => setBannerForm({ ...bannerForm, textEn: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-chocolate-200 mb-1 text-right">نص الإعلان (عربي)</label>
                    <input
                      type="text"
                      required
                      dir="rtl"
                      placeholder="مثال: شحن مجاني للطلبات فوق 500 جنيه!"
                      className="w-full px-4 py-2 bg-chocolate-950/60 border border-chocolate-800 rounded-xl text-white placeholder-chocolate-500 outline-none focus:ring-2 focus:ring-gold-500 transition-all text-right text-base"
                      value={bannerForm.textAr}
                      onChange={(e) => setBannerForm({ ...bannerForm, textAr: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-chocolate-200 mb-1">CTA Label (EN) - Optional</label>
                    <input
                      type="text"
                      placeholder="e.g. Order Now"
                      className="w-full px-4 py-2 bg-chocolate-950/60 border border-chocolate-800 rounded-xl text-white placeholder-chocolate-500 outline-none focus:ring-2 focus:ring-gold-500 transition-all text-base"
                      value={bannerForm.ctaEn}
                      onChange={(e) => setBannerForm({ ...bannerForm, ctaEn: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-chocolate-200 mb-1 text-right">عنوان الزر (AR) - اختياري</label>
                    <input
                      type="text"
                      dir="rtl"
                      placeholder="مثال: اطلب الآن"
                      className="w-full px-4 py-2 bg-chocolate-950/60 border border-chocolate-800 rounded-xl text-white placeholder-chocolate-500 outline-none focus:ring-2 focus:ring-gold-500 transition-all text-right text-base"
                      value={bannerForm.ctaAr}
                      onChange={(e) => setBannerForm({ ...bannerForm, ctaAr: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-chocolate-200 mb-1">Banner Link - Optional</label>
                    <input
                      type="text"
                      placeholder="e.g. /menu"
                      className="w-full px-4 py-2 bg-chocolate-950/60 border border-chocolate-800 rounded-xl text-white placeholder-chocolate-500 outline-none focus:ring-2 focus:ring-gold-500 transition-all text-base"
                      value={bannerForm.link}
                      onChange={(e) => setBannerForm({ ...bannerForm, link: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-chocolate-200 mb-1">Starts At</label>
                    <input
                      type="date"
                      className="w-full px-4 py-2 bg-chocolate-950/60 border border-chocolate-800 rounded-xl text-white outline-none focus:ring-2 focus:ring-gold-500 transition-all text-base"
                      value={bannerForm.startsAt}
                      onChange={(e) => setBannerForm({ ...bannerForm, startsAt: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-chocolate-200 mb-1">Ends At</label>
                    <input
                      type="date"
                      className="w-full px-4 py-2 bg-chocolate-950/60 border border-chocolate-800 rounded-xl text-white outline-none focus:ring-2 focus:ring-gold-500 transition-all text-base"
                      value={bannerForm.endsAt}
                      onChange={(e) => setBannerForm({ ...bannerForm, endsAt: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="bannerActive"
                    className="w-5 h-5 accent-gold-500 rounded text-gold-500 border-chocolate-800 bg-chocolate-950/60 focus:ring-gold-500"
                    checked={bannerForm.isActive}
                    onChange={(e) => setBannerForm({ ...bannerForm, isActive: e.target.checked })}
                  />
                  <label htmlFor="bannerActive" className="text-sm font-semibold text-chocolate-200 cursor-pointer">
                    Set Active Banner (Will deactivate other banners)
                  </label>
                </div>
              </div>
            )}

            {/* Coupon Form Fields */}
            {activeTab === 'coupons' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-chocolate-200 mb-1">Coupon Code</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. CHOCO10"
                      className="w-full px-4 py-2 bg-chocolate-950/60 border border-chocolate-800 rounded-xl text-white placeholder-chocolate-500 outline-none focus:ring-2 focus:ring-gold-500 transition-all text-base uppercase"
                      value={couponForm.code}
                      onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-chocolate-200 mb-1">Discount Percentage (%)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="100"
                      placeholder="e.g. 15"
                      className="w-full px-4 py-2 bg-chocolate-950/60 border border-chocolate-800 rounded-xl text-white placeholder-chocolate-500 outline-none focus:ring-2 focus:ring-gold-500 transition-all text-base"
                      value={couponForm.discountPct}
                      onChange={(e) => setCouponForm({ ...couponForm, discountPct: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-chocolate-200 mb-1">Max Uses (Optional)</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="e.g. 100"
                      className="w-full px-4 py-2 bg-chocolate-950/60 border border-chocolate-800 rounded-xl text-white placeholder-chocolate-500 outline-none focus:ring-2 focus:ring-gold-500 transition-all text-base"
                      value={couponForm.maxUses}
                      onChange={(e) => setCouponForm({ ...couponForm, maxUses: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-chocolate-200 mb-1">Expiry Date (Optional)</label>
                    <input
                      type="date"
                      className="w-full px-4 py-2 bg-chocolate-950/60 border border-chocolate-800 rounded-xl text-white outline-none focus:ring-2 focus:ring-gold-500 transition-all text-base"
                      value={couponForm.expiry}
                      onChange={(e) => setCouponForm({ ...couponForm, expiry: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="couponActive"
                    className="w-5 h-5 accent-gold-500 rounded text-gold-500 border-chocolate-800 bg-chocolate-950/60 focus:ring-gold-500"
                    checked={couponForm.isActive}
                    onChange={(e) => setCouponForm({ ...couponForm, isActive: e.target.checked })}
                  />
                  <label htmlFor="couponActive" className="text-sm font-semibold text-chocolate-200 cursor-pointer">
                    Coupon is active and redeemable
                  </label>
                </div>
              </div>
            )}

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
                {saving ? 'Saving...' : 'Save Item'}
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
                placeholder={`Search ${activeTab}...`}
                className="w-full pl-9 pr-4 py-2 bg-chocolate-950/60 border border-chocolate-800 rounded-xl text-sm text-white placeholder-chocolate-400 outline-none focus:ring-2 focus:ring-gold-500 transition-all text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="text-xs text-chocolate-300 font-medium">
              Showing {filteredData.length} of {activeTab === 'campaigns' ? campaigns.length : activeTab === 'banners' ? banners.length : coupons.length} items
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 text-gold-500 animate-spin" />
            </div>
          ) : (
            <div className="bg-chocolate-900/20 rounded-2xl shadow overflow-hidden border border-chocolate-800">
              {/* Campaigns Tab Content */}
              {activeTab === 'campaigns' && filteredData.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-chocolate-950/40 border-b border-chocolate-800 text-xs font-bold text-white uppercase tracking-wider">
                        <th className="px-6 py-4">Campaign Name</th>
                        <th className="px-6 py-4">Hero Media Details</th>
                        <th className="px-6 py-4">Dates</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-chocolate-800/40 text-sm text-chocolate-100">
                      {filteredData.map((c) => (
                        <tr key={c.id} className="hover:bg-chocolate-900/30 transition-colors">
                          <td className="px-6 py-4 font-bold text-white">{c.name}</td>
                          <td className="px-6 py-4 max-w-xs">
                            <div className="font-semibold text-gold-400 truncate">{c.heroTitleEn}</div>
                            <div className="text-xs text-chocolate-300 truncate mt-0.5">{c.heroImage}</div>
                          </td>
                          <td className="px-6 py-4 text-xs text-chocolate-200">
                            <div>S: {c.startsAt ? new Date(c.startsAt).toLocaleDateString() : 'N/A'}</div>
                            <div className="mt-0.5">E: {c.endsAt ? new Date(c.endsAt).toLocaleDateString() : 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleToggleActive(c)}
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                                c.isActive
                                  ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                  : 'bg-chocolate-950 text-chocolate-400 border border-chocolate-800'
                              }`}
                            >
                              {c.isActive ? 'Active' : 'Inactive'}
                            </button>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleEdit(c)}
                                className="p-2 bg-gold-500/10 hover:bg-gold-500/20 text-gold-400 rounded-xl transition-all cursor-pointer"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(c.id)}
                                disabled={deletingId === c.id}
                                className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Banners Tab Content */}
              {activeTab === 'banners' && filteredData.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-chocolate-950/40 border-b border-chocolate-800 text-xs font-bold text-white uppercase tracking-wider">
                        <th className="px-6 py-4">Banner Text (EN/AR)</th>
                        <th className="px-6 py-4">Action Button & Link</th>
                        <th className="px-6 py-4">Dates</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-chocolate-800/40 text-sm text-chocolate-100">
                      {filteredData.map((b) => (
                        <tr key={b.id} className="hover:bg-chocolate-900/30 transition-colors">
                          <td className="px-6 py-4 max-w-sm">
                            <div className="font-semibold text-white truncate">{b.textEn}</div>
                            <div className="text-xs text-chocolate-300 truncate text-right mt-0.5" dir="rtl">{b.textAr}</div>
                          </td>
                          <td className="px-6 py-4 text-xs text-chocolate-200">
                            {b.link ? (
                              <div>
                                <span className="font-semibold text-gold-400">{b.ctaEn || 'Link'}:</span> {b.link}
                              </div>
                            ) : 'No action link'}
                          </td>
                          <td className="px-6 py-4 text-xs text-chocolate-200">
                            <div>S: {b.startsAt ? new Date(b.startsAt).toLocaleDateString() : 'N/A'}</div>
                            <div className="mt-0.5">E: {b.endsAt ? new Date(b.endsAt).toLocaleDateString() : 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleToggleActive(b)}
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                                b.isActive
                                  ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                  : 'bg-chocolate-950 text-chocolate-400 border border-chocolate-800'
                              }`}
                            >
                              {b.isActive ? 'Active' : 'Inactive'}
                            </button>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleEdit(b)}
                                className="p-2 bg-gold-500/10 hover:bg-gold-500/20 text-gold-400 rounded-xl transition-all cursor-pointer"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(b.id)}
                                disabled={deletingId === b.id}
                                className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Coupons Tab Content */}
              {activeTab === 'coupons' && filteredData.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-chocolate-950/40 border-b border-chocolate-800 text-xs font-bold text-white uppercase tracking-wider">
                        <th className="px-6 py-4">Code</th>
                        <th className="px-6 py-4">Discount</th>
                        <th className="px-6 py-4">Uses Limit</th>
                        <th className="px-6 py-4">Expiry Date</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-chocolate-800/40 text-sm text-chocolate-100">
                      {filteredData.map((cp) => (
                        <tr key={cp.id} className="hover:bg-chocolate-900/30 transition-colors">
                          <td className="px-6 py-4 font-bold text-white uppercase flex items-center gap-1.5 bg-chocolate-950/20">
                            <Percent className="w-4 h-4 text-gold-400" />
                            {cp.code}
                          </td>
                          <td className="px-6 py-4 font-semibold text-gold-400">{cp.discountPct}% OFF</td>
                          <td className="px-6 py-4 text-xs text-chocolate-200">
                            {cp.uses} / {cp.maxUses || 'Unlimited'} uses
                          </td>
                          <td className="px-6 py-4 text-xs text-chocolate-200 font-medium">
                            {cp.expiry ? new Date(cp.expiry).toLocaleDateString() : 'Never'}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleToggleActive(cp)}
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                                cp.isActive
                                  ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                  : 'bg-chocolate-950 text-chocolate-400 border border-chocolate-800'
                              }`}
                            >
                              {cp.isActive ? 'Active' : 'Inactive'}
                            </button>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleEdit(cp)}
                                className="p-2 bg-gold-500/10 hover:bg-gold-500/20 text-gold-400 rounded-xl transition-all cursor-pointer"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(cp.id)}
                                disabled={deletingId === cp.id}
                                className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {filteredData.length === 0 && (
                <div className="text-center py-20 bg-chocolate-900/20 border border-dashed border-chocolate-850/60 rounded-2xl text-chocolate-300 animate-none">
                  <p className="font-medium text-lg">No marketing {activeTab} match your search.</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
