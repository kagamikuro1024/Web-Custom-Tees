import { useState, useEffect } from 'react';
import { FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';

const ShopPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Fetch only non-customizable products (pre-designed)
        const { data } = await api.get('/products?isCustomizable=false&sortBy=-createdAt&page=1&limit=12');
        setProducts(data.data?.products || data.products || []);
        setPagination(data.data?.pagination || data.pagination);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="container-custom py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Shop</h1>
        <p className="text-gray-600 text-lg">
          Pre-designed t-shirts ready to wear
        </p>
        {pagination && (
          <p className="text-sm text-gray-500 mt-2">
            Showing {products.length} of {pagination.total} products
          </p>
        )}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <FaSpinner className="animate-spin text-4xl text-primary" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg mb-4">No pre-designed products available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ShopPage;
