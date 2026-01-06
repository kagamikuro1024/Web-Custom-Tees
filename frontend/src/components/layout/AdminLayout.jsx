import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiShoppingCart, FiPackage, FiLogOut } from 'react-icons/fi';
import useAuthStore from '../../stores/useAuthStore';

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const { logout } = useAuthStore();

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: FiHome },
    { path: '/admin/orders', label: 'Orders', icon: FiShoppingCart },
    { path: '/admin/products', label: 'Products', icon: FiPackage }
  ];

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 w-64 bg-white shadow-lg border-r border-gray-200 z-40 h-screen">
        <div className="flex flex-col h-full">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Admin Panel</h2>
            <p className="text-sm text-gray-500">Manage your store</p>
          </div>

          <nav className="flex-1 px-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                  isActive(item.path)
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="text-xl" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 w-full transition-colors"
            >
              <FiLogOut className="text-xl" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
