export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium uppercase mb-2">Total Orders</h3>
          <p className="text-3xl font-bold text-gray-900">124</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium uppercase mb-2">Total Revenue</h3>
          <p className="text-3xl font-bold text-gray-900">4,250.00 EGP</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium uppercase mb-2">Total Products</h3>
          <p className="text-3xl font-bold text-gray-900">18</p>
        </div>
      </div>
    </div>
  );
}
