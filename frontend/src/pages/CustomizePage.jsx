import { useState, useEffect } from 'react';
import { FaSpinner, FaPalette } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';

const CustomizePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Fetch only customizable products (blank templates)
        const { data } = await api.get('/products?isCustomizable=true&sortBy=-createdAt&page=1&limit=12');
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
        <div className="flex items-center gap-3 mb-3">
          <FaPalette className="text-4xl text-primary-600" />
          <h1 className="text-4xl font-bold">Customize Your T-Shirt</h1>
        </div>
        <p className="text-gray-600 text-lg">
          Choose a blank t-shirt and upload your own design
        </p>
        {pagination && (
          <p className="text-sm text-gray-500 mt-2">
            Showing {products.length} of {pagination.total} customizable products
          </p>
        )}
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
        <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
        <ol className="list-decimal list-inside text-blue-800 space-y-1">
          <li>Select a blank t-shirt color below</li>
          <li>Click on the product to open customization</li>
          <li>Upload your design image</li>
          <li>Position and resize your design</li>
          <li>Add to cart and checkout!</li>
        </ol>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <FaSpinner className="animate-spin text-4xl text-primary" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg mb-4">No customizable products available</p>
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

export default CustomizePage;
