import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../stores/useAuthStore';
import toast from 'react-hot-toast';
import api from '../utils/api';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuthStore();

  const [formData, setFormData] = useState({
    email: location.state?.email || '',
    password: '',
  });
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    // Show message from register page
    if (location.state?.message) {
      toast.success(location.state.message, { duration: 5000 });
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await login(formData);
      const userRole = response.data.user.role;
      
      // Redirect based on role
      if (userRole === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 'Login failed';
      
      // Check if error is about email verification
      if (errorMessage.includes('verify your email')) {
        setShowResendVerification(true);
        toast.error(errorMessage, { duration: 6000 });
      }
    }
  };

  const handleResendVerification = async () => {
    if (!formData.email) {
      toast.error('Please enter your email address');
      return;
    }

    setIsResending(true);
    try {
      await api.post('/auth/resend-verification', { email: formData.email });
      toast.success('Verification email has been sent! Please check your inbox.', {
        duration: 5000
      });
      setShowResendVerification(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend verification email');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                className="input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                required
                className="input"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>

            {showResendVerification && (
              <div className="mt-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-3">
                  <p className="text-sm text-yellow-800 mb-2">
                    ⚠️ Your email is not verified yet. Please check your inbox for the verification link.
                  </p>
                  <p className="text-sm text-gray-700">
                    Didn't receive the email? Click below to resend:
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={isResending}
                  className="btn btn-outline w-full"
                >
                  {isResending ? 'Sending...' : '📧 Resend Verification Email'}
                </button>
              </div>
            )}
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-600 hover:underline font-medium">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
