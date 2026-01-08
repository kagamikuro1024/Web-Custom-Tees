import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { FiUser, FiMail, FiPhone, FiSave, FiEye, FiEyeOff, FiLock, FiChevronDown, FiChevronUp, FiAward } from 'react-icons/fi';
import toast from 'react-hot-toast';
import useAuthStore from '../../stores/useAuthStore';
import TierBadge from '../../components/TierBadge';

const ProfilePage = () => {
  const { user, setUser } = useAuthStore();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deliveredOrders, setDeliveredOrders] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);

  const getTierThresholds = () => ({
    bronze: { min: 0, max: 4, next: 'silver' },
    silver: { min: 5, max: 9, next: 'gold' },
    gold: { min: 10, max: 19, next: 'platinum' },
    platinum: { min: 20, max: 49, next: 'diamond' },
    diamond: { min: 50, max: Infinity, next: null }
  });

  const getTierProgress = () => {
    const thresholds = getTierThresholds();
    const currentTier = user?.tier || 'bronze';
    const threshold = thresholds[currentTier];
    
    if (!threshold.next) {
      return { progress: 100, remaining: 0, nextTier: null };
    }

    const progress = ((deliveredOrders - threshold.min) / (threshold.max - threshold.min + 1)) * 100;
    const remaining = threshold.max - deliveredOrders + 1;
    
    return {
      progress: Math.min(progress, 100),
      remaining: Math.max(remaining, 0),
      nextTier: threshold.next
    };
  };

  useEffect(() => {
    const fetchOrderStats = async () => {
      try {
        const { data } = await api.get('/orders');
        const orders = data.data?.orders || [];
        setTotalOrders(orders.length);
        const delivered = orders.filter(o => o.orderStatus === 'delivered').length;
        setDeliveredOrders(delivered);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    if (user) {
      fetchOrderStats();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data } = await api.put('/users/profile', formData);
      setUser(data.data);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      await api.put('/users/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      toast.success('Password changed successfully');
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-custom py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Cài đặt hồ sơ</h1>
          <p className="text-gray-600 mt-2">
            Quản lý thông tin tài khoản và tùy chọn của bạn
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center mb-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  {user?.firstName} {user?.lastName}
                </h2>
                <p className="text-gray-500 text-sm">{user?.email}</p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-gray-600">Thành viên từ</span>
                  <span className="font-medium">
                    {new Date(user?.createdAt).toLocaleDateString('vi-VN', { 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600">Loại tài khoản</span>
                  <span className="font-medium capitalize">{user?.role}</span>
                </div>
              </div>

              {/* Tier Section */}
              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center gap-2 mb-4">
                  <FiAward className="text-blue-600" size={20} />
                  <h3 className="text-lg font-semibold text-gray-900">Hạng thành viên</h3>
                </div>
                
                <div className="flex items-center justify-center mb-4">
                  <TierBadge tier={user?.tier || 'bronze'} size="lg" />
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Tổng đơn hàng</span>
                    <span className="font-semibold text-gray-900">{totalOrders}</span>
                  </div>
                  
                  <div className="flex justify-between text-gray-600">
                    <span>Đơn hàng hoàn thành</span>
                    <span className="font-semibold text-green-600">{deliveredOrders}</span>
                  </div>

                  {getTierProgress().nextTier && (
                    <>
                      <div className="flex justify-between text-gray-600">
                        <span>Hạng tiếp theo</span>
                        <span className="font-semibold capitalize text-gray-900">
                          {getTierProgress().nextTier}
                        </span>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Tiến độ</span>
                          <span>Còn {getTierProgress().remaining} đơn hàng hoàn thành</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${getTierProgress().progress}%` }}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {!getTierProgress().nextTier && (
                    <div className="text-center py-2">
                      <p className="text-blue-600 font-medium">🎉 Đã đạt hạng cao nhất!</p>
                    </div>
                  )}
                </div>

                {/* Tier Benefits */}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs font-medium text-blue-900 mb-2">Quyền lợi hạng thành viên</p>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• Hỗ trợ khách hàng ưu tiên</li>
                    <li>• Truy cập sớm các thiết kế mới</li>
                    <li>• Khuyến mãi độc quyền</li>
                  </ul>
                </div>

                {/* Info Note */}
                <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                  <p className="font-medium mb-1">💡 Cách tính hạng thành viên:</p>
                  <p>Hạng được tính dựa trên số đơn hàng <strong>đã hoàn thành (đã giao)</strong>. Đặt thêm đơn hàng và chờ giao hàng để thăng hạng!</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Thông tin cá nhân
              </h2>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Họ
                    </label>
                    <div className="relative">
                      <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tên
                    </label>
                    <div className="relative">
                      <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Địa chỉ email
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                      disabled
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Không thể thay đổi email</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại
                  </label>
                  <div className="relative">
                    <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+84..."
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn btn-primary flex items-center justify-center gap-2"
                >
                  <FiSave />
                  {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </form>
            </div>

            {/* Change Password */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <button
                type="button"
                onClick={() => setShowPasswordSection(!showPasswordSection)}
                className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 rounded-full p-2">
                    <FiLock className="text-purple-600" />
                  </div>
                  <div className="text-left">
                    <h2 className="text-xl font-bold text-gray-900">
                      Đổi mật khẩu
                    </h2>
                    <p className="text-sm text-gray-500">
                      Cập nhật mật khẩu để bảo mật tài khoản của bạn
                    </p>
                  </div>
                </div>
                {showPasswordSection ? (
                  <FiChevronUp className="text-gray-400 text-xl" />
                ) : (
                  <FiChevronDown className="text-gray-400 text-xl" />
                )}
              </button>
              
              {showPasswordSection && (
                <div className="p-6 pt-0 border-t border-gray-200">
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mật khẩu hiện tại
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword.current ? 'text' : 'password'}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword.current ? <FiEyeOff /> : <FiEye />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mật khẩu mới
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword.new ? 'text' : 'password'}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword.new ? <FiEyeOff /> : <FiEye />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Xác nhận mật khẩu mới
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword.confirm ? 'text' : 'password'}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword.confirm ? <FiEyeOff /> : <FiEye />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full btn btn-secondary flex items-center justify-center gap-2"
                    >
                      <FiSave />
                      {loading ? 'Đang đổi...' : 'Đổi mật khẩu'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
