'use client';

import React, { useState, useEffect } from 'react';
import { Eye, CheckCircle, XCircle, Clock, Loader2, Phone, Mail, MapPin, MessageSquare, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

type OrderStatusFilter = 'ALL' | 'PENDING' | 'COMPLETED' | 'CANCELLED';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<OrderStatusFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const loadingToast = toast.loading('Updating order status...');
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        const updatedOrder = await res.json();
        setOrders(orders.map(o => o.id === orderId ? updatedOrder : o));
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(updatedOrder);
        }
        const statusEmoji = newStatus === 'COMPLETED' ? '✅' : newStatus === 'CANCELLED' ? '❌' : '⏳';
        toast.success(`Order status updated to ${newStatus}! ${statusEmoji}`, { id: loadingToast });
      } else {
        toast.error('Failed to update order status', { id: loadingToast });
      }
    } catch (error) {
      console.error('Failed to update order:', error);
      toast.error('Failed to update order status', { id: loadingToast });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-950/60 border border-green-800/40 text-green-300 inline-flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" />
            Completed
          </span>
        );
      case 'PENDING':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-950/60 border border-yellow-800/40 text-yellow-300 inline-flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Pending
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-950/60 border border-red-800/40 text-red-300 inline-flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-900/60 border border-gray-800/40 text-gray-300 inline-flex items-center gap-1">
            {status}
          </span>
        );
    }
  };

  // Filter and search logic
  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
    const matchesSearch = 
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerPhone.includes(searchQuery) ||
      (order.customerEmail && order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase())) ||
      order.customerAddress.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-10 h-10 animate-spin text-gold-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-wide">Orders Registry</h1>
        <p className="text-sm text-chocolate-200 mt-1">Review orders details, client contacts, and delivery logs.</p>
      </div>

      {/* Filters Bar */}
      <div className="bg-chocolate-900/20 p-4 rounded-2xl shadow border border-chocolate-850/50 flex flex-col lg:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 text-chocolate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer, phone, address..."
            className="w-full pl-9 pr-4 py-2 bg-chocolate-950/60 border border-chocolate-800 rounded-xl text-sm text-white placeholder-chocolate-400 outline-none focus:ring-2 focus:ring-gold-500 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Tab filters */}
        <div className="flex flex-wrap bg-chocolate-950/40 p-1.5 rounded-xl border border-chocolate-850/60 gap-1 w-full lg:w-auto">
          {(['ALL', 'PENDING', 'COMPLETED', 'CANCELLED'] as OrderStatusFilter[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === tab
                  ? 'bg-chocolate-800 text-gold-400 shadow-inner'
                  : 'text-chocolate-300 hover:text-white'
              }`}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Table grid */}
      <div className="bg-chocolate-900/20 rounded-2xl shadow overflow-hidden border border-chocolate-850/60">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-chocolate-950/40 border-b border-chocolate-850/60 text-xs font-bold text-white uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 hidden md:table-cell">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4 hidden md:table-cell">Date</th>
                <th className="px-6 py-4 hidden md:table-cell text-center">Items</th>
                <th className="px-6 py-4 hidden md:table-cell">Total</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-chocolate-850/40 text-sm text-gray-250">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-chocolate-900/30 transition-colors">
                  <td className="px-6 py-4 text-chocolate-300 font-mono hidden md:table-cell">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </td>
                  <td className="px-6 py-4 font-semibold text-white">{order.customerName}</td>
                  <td className="px-6 py-4 font-mono text-chocolate-200">{order.customerPhone}</td>
                  <td className="px-6 py-4 text-chocolate-300 hidden md:table-cell">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-center hidden md:table-cell">
                    {order.items?.length || 0}
                  </td>
                  <td className="px-6 py-4 text-white font-bold hidden md:table-cell">
                    {order.total.toFixed(2)} EGP
                  </td>
                  <td className="px-6 py-4 text-center">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="p-2 bg-chocolate-800 hover:bg-chocolate-700 text-gold-400 rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredOrders.length === 0 && (
          <div className="text-center py-20 text-chocolate-300 bg-chocolate-900/10">
            <p className="text-lg">No orders matched the criteria.</p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto backdrop-blur-sm">
          <div className="bg-[#150a06] border border-chocolate-800/80 rounded-3xl shadow-2xl max-w-2xl w-full p-6 my-8 text-white relative">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-chocolate-800/60">
              <h2 className="text-2xl font-bold text-white tracking-wide">Order Details Screen</h2>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-1 hover:bg-white/10 rounded-full text-chocolate-300 hover:text-white transition-colors cursor-pointer"
                aria-label="Close Order Details Modal"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Order Info Panel */}
              <div className="grid grid-cols-2 gap-4 bg-chocolate-950/60 p-4 rounded-2xl border border-chocolate-800">
                <div>
                  <span className="text-[10px] uppercase font-bold text-chocolate-400 block tracking-wider">Order ID</span>
                  <span className="font-mono text-sm font-bold text-white">#{selectedOrder.id.toUpperCase()}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-chocolate-400 block tracking-wider">Date</span>
                  <span className="font-semibold text-sm text-white">{new Date(selectedOrder.createdAt).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-chocolate-400 block tracking-wider">Status</span>
                  <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-chocolate-400 block tracking-wider">Total</span>
                  <span className="font-extrabold text-gold-400 text-lg">{selectedOrder.total.toFixed(2)} EGP</span>
                </div>
              </div>

              {/* Customer Details */}
              <div className="space-y-3">
                <h3 className="font-bold text-gold-400 text-sm uppercase tracking-wider flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Customer Information
                </h3>
                <div className="space-y-3 bg-chocolate-900/30 p-4 rounded-2xl border border-chocolate-850/60 text-sm">
                  <div className="flex items-start gap-3">
                    <span className="text-chocolate-300 font-bold min-w-[100px]">Name:</span>
                    <span className="font-bold text-white">{selectedOrder.customerName}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-chocolate-300 font-bold min-w-[100px]">Phone:</span>
                    <a href={`tel:${selectedOrder.customerPhone}`} className="font-mono font-bold text-gold-400 hover:underline">
                      {selectedOrder.customerPhone}
                    </a>
                  </div>
                  {selectedOrder.customerEmail && (
                    <div className="flex items-start gap-3">
                      <span className="text-chocolate-300 font-bold min-w-[100px]">Email:</span>
                      <a href={`mailto:${selectedOrder.customerEmail}`} className="font-medium text-gold-400 hover:underline">
                        {selectedOrder.customerEmail}
                      </a>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <span className="text-chocolate-300 font-bold min-w-[100px]">Address:</span>
                    <span className="font-semibold text-white">{selectedOrder.customerAddress}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-chocolate-300 font-bold min-w-[100px]">Contact via:</span>
                    <span className="font-bold text-green-400 capitalize">{selectedOrder.preferredContact}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-chocolate-300 font-bold min-w-[100px]">Payment:</span>
                    <span className={`font-bold px-2 py-0.5 rounded text-xs ${
                      selectedOrder.paymentMethod === 'cash_on_delivery' 
                        ? 'bg-yellow-950/60 border border-yellow-800/40 text-yellow-300' 
                        : 'bg-green-950/60 border border-green-800/40 text-green-300'
                    }`}>
                      {selectedOrder.paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery' : 'Online Payment'}
                    </span>
                  </div>
                  {selectedOrder.specialRequests && (
                    <div className="flex items-start gap-3 border-t border-chocolate-850/40 pt-3 mt-3">
                      <span className="text-chocolate-300 font-bold min-w-[100px]">Notes:</span>
                      <span className="text-chocolate-100 italic">{selectedOrder.specialRequests}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Order Items */}
              <div className="space-y-3">
                <h3 className="font-bold text-gold-400 text-sm uppercase tracking-wider">Order Items</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                  {selectedOrder.items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center bg-chocolate-950/40 p-3 rounded-xl border border-chocolate-900/60">
                      <div>
                        <span className="font-semibold text-white">{item.product?.name || 'Product'}</span>
                        <span className="text-chocolate-350 text-xs ml-2">x{item.quantity}</span>
                      </div>
                      <span className="font-bold text-gold-400">{(item.price * item.quantity).toFixed(2)} EGP</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-8 border-t border-chocolate-800/60 pt-4">
                {selectedOrder.status === 'PENDING' && (
                  <button 
                    onClick={() => updateOrderStatus(selectedOrder.id, 'COMPLETED')}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-all cursor-pointer shadow-lg shadow-green-950/20"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Mark Completed
                  </button>
                )}
                {selectedOrder.status !== 'CANCELLED' && (
                  <button 
                    onClick={() => updateOrderStatus(selectedOrder.id, 'CANCELLED')}
                    className="flex-1 bg-red-650/10 hover:bg-red-650/25 border border-red-800/30 hover:border-red-500/30 text-red-400 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-all cursor-pointer"
                  >
                    <XCircle className="w-5 h-5" />
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
