'use client';

import React, { useState, useEffect } from 'react';
import { Download, Calendar, Loader2, Package, TrendingUp, ShoppingCart, Clock, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0
  });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchStats();
  }, [startDate, endDate]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      let url = '/api/dashboard/stats';
      
      if (startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
      }
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      toast.error('Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    const loadingToast = toast.loading('Exporting order report...');
    try {
      setExporting(true);
      let url = '/api/orders/export';
      
      if (startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
      }
      
      const res = await fetch(url);
      if (res.ok) {
        const blob = await res.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `orders_${startDate || 'all'}_to_${endDate || 'all'}.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(downloadUrl);
        toast.success('Orders report exported! 📊', { id: loadingToast });
      } else {
        toast.error('Failed to export orders', { id: loadingToast });
      }
    } catch (error) {
      console.error('Failed to export orders:', error);
      toast.error('Failed to export orders. Please try again.', { id: loadingToast });
    } finally {
      setExporting(false);
    }
  };

  const clearDateFilter = () => {
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-wide">Dashboard Overview</h1>
          <p className="text-sm text-chocolate-200 mt-1">Real-time business performance analytics.</p>
        </div>
        
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl shadow-lg hover:shadow-emerald-950/20 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed text-sm font-semibold w-full sm:w-auto justify-center cursor-pointer"
        >
          {exporting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Export Report (CSV)
            </>
          )}
        </button>
      </div>

      {/* Date Filter */}
      <div className="bg-chocolate-900/25 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-chocolate-850/60">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-gold-400 animate-pulse" />
          <span className="font-semibold text-chocolate-100 text-sm sm:text-base">Filter Performance by Date Range</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-chocolate-300 uppercase tracking-wider">From date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-4 py-2 bg-chocolate-950/60 border border-chocolate-800 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent text-white w-full text-sm outline-none transition-all"
            />
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-chocolate-300 uppercase tracking-wider">To date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-4 py-2 bg-chocolate-950/60 border border-chocolate-800 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent text-white w-full text-sm outline-none transition-all"
            />
          </div>
          
          {(startDate || endDate) && (
            <div>
              <button
                onClick={clearDateFilter}
                className="px-4 py-2 text-sm text-chocolate-300 hover:text-white border border-chocolate-800 hover:bg-chocolate-900/50 rounded-xl transition-colors w-full sm:w-auto font-medium cursor-pointer"
              >
                Clear Range
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-gold-500" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Total Orders */}
            <div className="bg-gradient-to-br from-chocolate-900/40 via-chocolate-950/20 to-chocolate-900/40 p-6 rounded-2xl shadow-xl border border-chocolate-800/80 hover:border-gold-500/30 transition-colors group">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-chocolate-300 text-xs sm:text-sm font-bold uppercase tracking-wider">Total Orders</h3>
                <div className="p-3 bg-orange-500/10 rounded-2xl border border-orange-500/20 text-orange-400 group-hover:scale-110 transition-transform">
                  <ShoppingCart className="w-6 h-6" />
                </div>
              </div>
              <p className="text-3xl sm:text-4xl font-extrabold text-white font-display tracking-tight">
                {stats.totalOrders}
              </p>
            </div>
            
            {/* Total Revenue */}
            <div className="bg-gradient-to-br from-chocolate-900/40 via-chocolate-950/20 to-chocolate-900/40 p-6 rounded-2xl shadow-xl border border-chocolate-800/80 hover:border-gold-500/30 transition-colors group">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-chocolate-300 text-xs sm:text-sm font-bold uppercase tracking-wider">Total Revenue</h3>
                <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>
              <p className="text-3xl sm:text-4xl font-extrabold text-gold-400 font-display tracking-tight">
                {stats.totalRevenue.toFixed(2)} <span className="text-sm font-bold text-chocolate-200">EGP</span>
              </p>
            </div>
            
            {/* Total Products */}
            <div className="bg-gradient-to-br from-chocolate-900/40 via-chocolate-950/20 to-chocolate-900/40 p-6 rounded-2xl shadow-xl border border-chocolate-800/80 hover:border-gold-500/30 transition-colors group sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-chocolate-300 text-xs sm:text-sm font-bold uppercase tracking-wider">Total Products</h3>
                <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-blue-400 group-hover:scale-110 transition-transform">
                  <Package className="w-6 h-6" />
                </div>
              </div>
              <p className="text-3xl sm:text-4xl font-extrabold text-white font-display tracking-tight">
                {stats.totalProducts}
              </p>
            </div>
          </div>

          {/* Order Status Breakdown */}
          <div className="bg-chocolate-900/20 border border-chocolate-850/60 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-6 tracking-wide">Order Status Breakdown</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Pending */}
              <div className="flex items-center gap-4 p-4 bg-yellow-950/20 rounded-2xl border border-yellow-800/30 hover:bg-yellow-950/30 transition-all shadow-inner">
                <div className="p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20 text-yellow-500">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-yellow-300 uppercase tracking-wider">Pending</p>
                  <p className="text-2xl sm:text-3xl font-bold text-white mt-1">{stats.pendingOrders}</p>
                </div>
              </div>
              
              {/* Completed */}
              <div className="flex items-center gap-4 p-4 bg-emerald-950/20 rounded-2xl border border-emerald-800/30 hover:bg-emerald-950/30 transition-all shadow-inner">
                <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">Completed</p>
                  <p className="text-2xl sm:text-3xl font-bold text-white mt-1">{stats.completedOrders}</p>
                </div>
              </div>
              
              {/* Cancelled */}
              <div className="flex items-center gap-4 p-4 bg-red-950/20 rounded-2xl border border-red-800/30 hover:bg-red-950/30 transition-all shadow-inner">
                <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20 text-red-500">
                  <XCircle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-red-300 uppercase tracking-wider">Cancelled</p>
                  <p className="text-2xl sm:text-3xl font-bold text-white mt-1">{stats.cancelledOrders}</p>
                </div>
              </div>
              
            </div>
          </div>
        </>
      )}
    </div>
  );
}
