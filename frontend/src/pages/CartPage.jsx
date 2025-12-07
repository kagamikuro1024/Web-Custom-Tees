import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaPlus, FaMinus, FaShoppingCart, FaArrowRight } from 'react-icons/fa';
import useCartStore from '../stores/useCartStore';
import useAuthStore from '../stores/useAuthStore';
import toast from 'react-hot-toast';

const CartPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { cart, fetchCart, updateCartItem, removeCartItem, isLoading } = useCartStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart().catch(() => {});
    }
  }, [isAuthenticated, fetchCart]);

  const handleQuantityChange = async (itemId, currentQty, change) => {
    const newQty = currentQty + change;
    if (newQty < 1) return;
    
    try {
      await updateCartItem(itemId, newQty);
    } catch (error) {
      toast.error('Failed to update quantity');
    }
  };

  const handleRemove = async (itemId) => {
    if (!confirm('Remove this item from cart?')) return;
    
    try {
      await removeCartItem(itemId);
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error('Please login to checkout');
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  if (!isAuthenticated) {
    return (
      <div className="container-custom py-16">
        <div className="max-w-2xl mx-auto text-center">
          <FaShoppingCart className="mx-auto text-6xl text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold mb-4">Please Login</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to view your cart</p>
          <Link to="/login" className="btn btn-primary">
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading && !cart) {
    return (
      <div className="container-custom py-16">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (!cart || cart.items?.length === 0) {
    return (
      <div className="container-custom py-16">
        <div className="max-w-2xl mx-auto text-center">
          <FaShoppingCart className="mx-auto text-6xl text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold mb-4">Your Cart is Empty</h2>
          <p className="text-gray-600 mb-6">Start shopping to add items to your cart</p>
          <Link to="/shop" className="btn btn-primary">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm">
            {cart.items.map((item) => (
              <div key={item._id} className="p-6 border-b last:border-b-0">
                <div className="flex gap-6">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={item.product?.images?.[0] || 'https://via.placeholder.com/150'}
                      alt={item.product?.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{item.product?.name}</h3>
                        <div className="flex gap-4 mt-2 text-sm text-gray-600">
                          <span>Size: <span className="font-medium">{item.size}</span></span>
                          <span>Color: <span className="font-medium">{item.color}</span></span>
                        </div>
                        
                        {/* Custom Design Preview */}
                        {item.customDesign?.imageUrl && (
                          <div className="mt-3">
                            <p className="text-xs text-gray-500 mb-1">Custom Design:</p>
                            <img
                              src={item.customDesign.imageUrl}
                              alt="Custom design"
                              className="w-16 h-16 object-contain border rounded"
                            />
                          </div>
                        )}
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemove(item._id)}
                        className="text-red-500 hover:text-red-700 transition"
                        disabled={isLoading}
                      >
                        <FaTrash />
                      </button>
                    </div>

                    {/* Price and Quantity */}
                    <div className="flex justify-between items-center mt-4">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleQuantityChange(item._id, item.quantity, -1)}
                          disabled={isLoading || item.quantity <= 1}
                          className="w-8 h-8 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:border-primary-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          <FaMinus className="text-sm" />
                        </button>
                        
                        <span className="font-semibold text-lg w-8 text-center">
                          {item.quantity}
                        </span>
                        
                        <button
                          onClick={() => handleQuantityChange(item._id, item.quantity, 1)}
                          disabled={isLoading}
                          className="w-8 h-8 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:border-primary-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          <FaPlus className="text-sm" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary-600">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price * item.quantity)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)} each
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>
            
            <div className="space-y-3 mb-6 pb-6 border-b">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({cart.totalItems} items)</span>
                <span className="font-medium">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cart.totalPrice)}
                </span>
              </div>
              
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="text-sm text-primary-600">Calculated at checkout</span>
              </div>
            </div>

            <div className="flex justify-between text-xl font-bold mb-6">
              <span>Total</span>
              <span className="text-primary-600">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cart.totalPrice)}
              </span>
            </div>

            <button
              onClick={handleCheckout}
              className="btn btn-primary w-full py-4 text-lg font-bold flex items-center justify-center gap-2 rounded-xl shadow-lg hover:shadow-xl"
              disabled={isLoading}
            >
              Proceed to Checkout
              <FaArrowRight />
            </button>

            <Link
              to="/shop"
              className="block text-center text-primary-600 hover:text-primary-700 mt-4 font-medium"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;

