import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiUser, FiLogOut, FiMenu } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import useAuthStore from '../../stores/useAuthStore';
import useCartStore from '../../stores/useCartStore';
import NotificationCenter from '../NotificationCenter';

const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, isAdmin } = useAuthStore();
  const { getCartItemCount, fetchCart } = useCartStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart().catch(() => {});
    }
  }, [isAuthenticated, fetchCart]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const cartCount = getCartItemCount();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-primary-600">
            Custom<span className="text-gray-800">Tees</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-primary-600 transition">
              Home
            </Link>
            <div className="relative group">
              <Link to="/products" className="text-gray-700 hover:text-primary-600 transition font-medium">
                Products
              </Link>
              {/* Dropdown */}
              <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <Link to="/shop" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 text-sm">
                  Shop
                </Link>
                <Link to="/customize" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 text-sm">
                  Customize
                </Link>
              </div>
            </div>
            <Link to="/about" className="text-gray-700 hover:text-primary-600 transition">
              About Us
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <NotificationCenter />

            {/* Cart */}
            <Link to="/cart" className="relative text-gray-700 hover:text-primary-600 transition">
              <FiShoppingCart size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition">
                  <FiUser size={24} />
                  <span className="hidden md:block">{user?.firstName}</span>
                </button>
                
                {/* Dropdown */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  {isAdmin() && (
                    <>
                      <Link
                        to="/admin"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        Admin Dashboard
                      </Link>
                      <hr className="my-1" />
                    </>
                  )}
                  <Link
                    to="/dashboard"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/orders"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    Orders
                  </Link>
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <FiLogOut /> Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="btn btn-primary">
                Login
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-gray-700"
            >
              <FiMenu size={24} />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <Link
              to="/"
              className="block py-2 text-gray-700 hover:text-primary-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/products"
              className="block py-2 text-gray-700 hover:text-primary-600 font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Products
            </Link>
            <Link
              to="/shop"
              className="block py-2 pl-4 text-gray-600 hover:text-primary-600 text-sm"
              onClick={() => setMobileMenuOpen(false)}
            >
              → Shop
            </Link>
            <Link
              to="/customize"
              className="block py-2 pl-4 text-gray-600 hover:text-primary-600 text-sm"
              onClick={() => setMobileMenuOpen(false)}
            >
              → Customize
            </Link>
            <Link
              to="/about"
              className="block py-2 text-gray-700 hover:text-primary-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              About Us
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
