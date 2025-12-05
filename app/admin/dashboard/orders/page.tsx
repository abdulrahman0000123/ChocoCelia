'use client';

import { useState, useEffect } from 'react';
import { Eye, CheckCircle, XCircle, Clock, Loader2, Phone, Mail, MapPin, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-700';
      case 'PENDING': return 'bg-yellow-100 text-yellow-700';
      case 'CANCELLED': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="w-4 h-4" />;
      case 'PENDING': return <Clock className="w-4 h-4" />;
      case 'CANCELLED': return <XCircle className="w-4 h-4" />;
      default: return null;
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
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Orders</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-semibold text-gray-600">Order ID</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Customer</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Phone</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Date</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Items</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Total</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Status</th>
              <th className="px-6 py-4 font-semibold text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-gray-800 font-medium">#{order.id.slice(0, 8)}</td>
                <td className="px-6 py-4 text-gray-600">{order.customerName}</td>
                <td className="px-6 py-4 text-gray-600">{order.customerPhone}</td>
                <td className="px-6 py-4 text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-gray-600">{order.items?.length || 0}</td>
                <td className="px-6 py-4 text-gray-800 font-bold">{order.total.toFixed(2)} EGP</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="text-chocolate-600 hover:text-chocolate-800 p-1"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg">No orders yet. Wait for customers to place orders!</p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Order Details</h2>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <span className="text-xs text-gray-500 block">Order ID</span>
                  <span className="font-bold text-gray-900">#{selectedOrder.id.slice(0, 8)}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block">Date</span>
                  <span className="font-medium text-gray-900">{new Date(selectedOrder.createdAt).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusIcon(selectedOrder.status)}
                    {selectedOrder.status}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block">Total</span>
                  <span className="font-bold text-gray-900 text-lg">{selectedOrder.total.toFixed(2)} EGP</span>
                </div>
              </div>

              {/* Customer Details */}
              <div className="border-t pt-4">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Customer Information
                </h3>
                <div className="space-y-3 bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <span className="text-gray-600 font-medium min-w-[100px]">Name:</span>
                    <span className="font-semibold text-gray-900">{selectedOrder.customerName}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-gray-500 mt-1" />
                    <span className="text-gray-600 font-medium min-w-[100px]">Phone:</span>
                    <a href={`tel:${selectedOrder.customerPhone}`} className="font-semibold text-blue-600 hover:underline">
                      {selectedOrder.customerPhone}
                    </a>
                  </div>
                  {selectedOrder.customerEmail && (
                    <div className="flex items-start gap-3">
                      <Mail className="w-4 h-4 text-gray-500 mt-1" />
                      <span className="text-gray-600 font-medium min-w-[100px]">Email:</span>
                      <a href={`mailto:${selectedOrder.customerEmail}`} className="font-semibold text-blue-600 hover:underline">
                        {selectedOrder.customerEmail}
                      </a>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-gray-500 mt-1" />
                    <span className="text-gray-600 font-medium min-w-[100px]">Address:</span>
                    <span className="font-medium text-gray-900">{selectedOrder.customerAddress}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <MessageSquare className="w-4 h-4 text-gray-500 mt-1" />
                    <span className="text-gray-600 font-medium min-w-[100px]">Contact via:</span>
                    <span className="font-semibold text-green-600 capitalize">{selectedOrder.preferredContact}</span>
                  </div>
                  {selectedOrder.specialRequests && (
                    <div className="flex items-start gap-3 border-t border-blue-200 pt-3 mt-3">
                      <span className="text-gray-600 font-medium min-w-[100px]">Message:</span>
                      <span className="text-gray-700 italic">{selectedOrder.specialRequests}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Order Items */}
              <div className="mt-6 border-t pt-4">
                <h3 className="font-bold text-gray-800 mb-3">Order Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                      <div>
                        <span className="font-medium text-gray-900">{item.product?.name || 'Product'}</span>
                        <span className="text-gray-500 text-sm ml-2">x{item.quantity}</span>
                      </div>
                      <span className="font-bold text-gray-900">{(item.price * item.quantity).toFixed(2)} EGP</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-8 border-t pt-4">
                {selectedOrder.status === 'PENDING' && (
                  <button 
                    onClick={() => updateOrderStatus(selectedOrder.id, 'COMPLETED')}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-medium flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Mark Completed
                  </button>
                )}
                {selectedOrder.status !== 'CANCELLED' && (
                  <button 
                    onClick={() => updateOrderStatus(selectedOrder.id, 'CANCELLED')}
                    className="flex-1 bg-red-100 text-red-600 py-3 rounded-lg hover:bg-red-200 font-medium flex items-center justify-center gap-2"
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
