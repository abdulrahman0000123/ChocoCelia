'use client';

import { useState } from 'react';
import { Eye, CheckCircle, XCircle, Clock } from 'lucide-react';

// Mock data
const MOCK_ORDERS = [
  {
    id: 'ORD-001',
    customer: 'John Doe',
    date: '2023-11-25',
    total: 45.99,
    status: 'PENDING',
    items: 3
  },
  {
    id: 'ORD-002',
    customer: 'Jane Smith',
    date: '2023-11-24',
    total: 120.50,
    status: 'COMPLETED',
    items: 8
  },
  {
    id: 'ORD-003',
    customer: 'Mike Johnson',
    date: '2023-11-24',
    total: 24.99,
    status: 'CANCELLED',
    items: 1
  }
];

export default function OrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

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

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Orders</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-semibold text-gray-600">Order ID</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Customer</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Date</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Items</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Total</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Status</th>
              <th className="px-6 py-4 font-semibold text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {MOCK_ORDERS.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-gray-800 font-medium">{order.id}</td>
                <td className="px-6 py-4 text-gray-600">{order.customer}</td>
                <td className="px-6 py-4 text-gray-600">{order.date}</td>
                <td className="px-6 py-4 text-gray-600">{order.items}</td>
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
      </div>

      {/* Order Details Modal Placeholder */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
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
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-600">Order ID</span>
                <span className="font-bold text-gray-900">{selectedOrder.id}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-600">Customer</span>
                <span className="font-bold text-gray-900">{selectedOrder.customer}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-600">Status</span>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(selectedOrder.status)}`}>
                  {selectedOrder.status}
                </span>
              </div>
              
              <div className="mt-6">
                <h3 className="font-bold text-gray-800 mb-2">Items</h3>
                <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500 text-sm">
                  Order items details would appear here.
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-medium">
                  Mark Completed
                </button>
                <button className="flex-1 bg-red-100 text-red-600 py-2 rounded-lg hover:bg-red-200 font-medium">
                  Cancel Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
