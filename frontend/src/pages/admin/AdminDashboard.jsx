import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FiDollarSign, FiShoppingBag, FiUsers, FiPackage, FiTrendingUp, FiAlertTriangle } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [orderStatus, setOrderStatus] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [dashStats, trend, products, status, activities, stock] = await Promise.all([
        api.get('/admin/stats/dashboard'),
        api.get('/admin/stats/revenue-trend?days=30'),
        api.get('/admin/stats/top-products?limit=5'),
        api.get('/admin/stats/order-status'),
        api.get('/admin/stats/recent-activities?limit=8'),
        api.get('/admin/stats/low-stock?threshold=10')
      ]);

      setStats(dashStats.data.data);
      setRevenueTrend(trend.data.data);
      setTopProducts(products.data.data);
      setOrderStatus(status.data.data);
      setRecentActivities(activities.data.data);
      setLowStock(stock.data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

  const orderStatusColors = {
    pending: '#F59E0B',
    confirmed: '#3B82F6',
    processing: '#8B5CF6',
    shipped: '#10B981',
    delivered: '#059669',
    cancelled: '#EF4444'
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bảng điều khiển</h1>
          <p className="text-gray-600">Tổng quan hoạt động kinh doanh</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <FiDollarSign className="text-2xl" />
              </div>
              <span className="text-sm bg-white/20 px-3 py-1 rounded-full">Tháng này</span>
            </div>
            <h3 className="text-sm font-medium mb-1 opacity-90">Doanh thu</h3>
            <p className="text-3xl font-bold mb-1">{formatCurrency(stats?.revenue.month || 0)}</p>
            <p className="text-xs opacity-75">Tổng: {formatCurrency(stats?.revenue.total || 0)}</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <FiShoppingBag className="text-2xl" />
              </div>
              <span className="text-sm bg-white/20 px-3 py-1 rounded-full">{stats?.orders.pending} chờ</span>
            </div>
            <h3 className="text-sm font-medium mb-1 opacity-90">Đơn hàng</h3>
            <p className="text-3xl font-bold mb-1">{stats?.orders.month || 0}</p>
            <p className="text-xs opacity-75">Tổng: {stats?.orders.total || 0} đơn</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <FiUsers className="text-2xl" />
              </div>
              <span className="text-sm bg-white/20 px-3 py-1 rounded-full">+{stats?.users.newThisMonth}</span>
            </div>
            <h3 className="text-sm font-medium mb-1 opacity-90">Khách hàng</h3>
            <p className="text-3xl font-bold mb-1">{stats?.users.total || 0}</p>
            <p className="text-xs opacity-75">Mới tháng này</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <FiPackage className="text-2xl" />
              </div>
              <Link to="#low-stock" className="text-sm bg-white/20 px-3 py-1 rounded-full hover:bg-white/30">
                {stats?.products.lowStock} thấp
              </Link>
            </div>
            <h3 className="text-sm font-medium mb-1 opacity-90">Sản phẩm</h3>
            <p className="text-3xl font-bold mb-1">{stats?.products.total || 0}</p>
            <p className="text-xs opacity-75">Đang hoạt động</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Trend */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Xu hướng doanh thu (30 ngày)</h2>
              <FiTrendingUp className="text-2xl text-green-500" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => new Date(date).getDate().toString()}
                  stroke="#6b7280"
                />
                <YAxis 
                  tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                  stroke="#6b7280"
                />
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                  labelFormatter={(date) => new Date(date).toLocaleDateString('vi-VN')}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Doanh thu"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Order Status Distribution */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Trạng thái đơn hàng</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={Object.entries(orderStatus || {}).map(([key, value]) => ({
                    name: key === 'pending' ? 'Chờ xác nhận' :
                          key === 'confirmed' ? 'Đã xác nhận' :
                          key === 'processing' ? 'Đang xử lý' :
                          key === 'shipped' ? 'Đang giao' :
                          key === 'delivered' ? 'Đã giao' : 'Đã hủy',
                    value,
                    color: orderStatusColors[key]
                  }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {Object.values(orderStatusColors).map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value} đơn`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Top 5 sản phẩm bán chạy</h2>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={product._id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {index + 1}
                </div>
                <img 
                  src={product.imageUrl} 
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{product.name}</h4>
                  <p className="text-sm text-gray-600">Đã bán: {product.totalSold} sản phẩm</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">{formatCurrency(product.revenue)}</p>
                  <p className="text-xs text-gray-500">Doanh thu</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activities */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Hoạt động gần đây</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`mt-1 p-2 rounded-full ${
                    activity.type === 'order' ? 'bg-blue-100 text-blue-600' :
                    activity.type === 'user' ? 'bg-purple-100 text-purple-600' :
                    'bg-yellow-100 text-yellow-600'
                  }`}>
                    {activity.type === 'order' ? <FiShoppingBag /> :
                     activity.type === 'user' ? <FiUsers /> : <FiPackage />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 text-sm">{activity.title}</h4>
                    <p className="text-xs text-gray-600 truncate">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(activity.createdAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Low Stock Alert */}
          <div className="bg-white rounded-xl shadow-md p-6" id="low-stock">
            <div className="flex items-center gap-2 mb-6">
              <FiAlertTriangle className="text-2xl text-orange-500" />
              <h2 className="text-xl font-bold text-gray-900">Sản phẩm sắp hết hàng</h2>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {lowStock.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Không có sản phẩm nào sắp hết hàng</p>
              ) : (
                lowStock.map((product) => (
                  <div key={product._id} className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <img 
                      src={product.imageUrl} 
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm truncate">{product.name}</h4>
                      <p className="text-xs text-orange-600">
                        Còn {product.totalStock} sản phẩm
                      </p>
                    </div>
                    <Link 
                      to={`/admin/products/${product._id}/edit`}
                      className="px-3 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600 transition"
                    >
                      Nhập hàng
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
