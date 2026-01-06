import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../utils/api';
import { FiShoppingBag, FiEdit3 } from 'react-icons/fi';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [customizableProducts, setCustomizableProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [featured, customizable] = await Promise.all([
          api.get('/products/featured?limit=4'),
          api.get('/products/customizable?limit=4'),
        ]);

        setFeaturedProducts(featured.data.data);
        setCustomizableProducts(customizable.data.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[600px] bg-gray-900">
        <img 
          src="/assets/1.png" 
          alt="Custom T-Shirts" 
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 flex items-center">
          <div className="container-custom">
            <div className="max-w-3xl text-white">
              <h1 className="text-5xl font-bold mb-6 fade-in">
                Design Your Own Custom T-Shirts
              </h1>
              <p className="text-xl mb-8 text-gray-200">
                Upload your design, customize it, and get high-quality printed t-shirts delivered to your door.
              </p>
              <div className="flex gap-4">
                <Link to="/customize" className="btn bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-medium">
                  Start Designing
                </Link>
                <Link to="/products" className="btn border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-3 rounded-lg font-medium">
                  Browse Products
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiEdit3 className="text-primary-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Design Tool</h3>
              <p className="text-gray-600">
                Upload your image and customize it with our intuitive editor
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiShoppingBag className="text-primary-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">High-Quality Printing</h3>
              <p className="text-gray-600">
                Premium fabrics and professional printing technology
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="text-primary-600" fill="currentColor" width="32" height="32" viewBox="0 0 24 24">
                  <path d="M12 2L3 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
              <p className="text-gray-600">
                Quick turnaround time with tracked shipping
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Customizable Products */}
      {!loading && customizableProducts.length > 0 && (
        <section className="py-16">
          <div className="container-custom">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">Customize Your Own</h2>
              <Link to="/products?isCustomizable=true" className="text-primary-600 hover:underline">
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {customizableProducts.map((product) => (
                <ProductCard key={product._id} product={product} customizable />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {!loading && featuredProducts.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container-custom">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">Featured Products</h2>
              <Link to="/products" className="text-primary-600 hover:underline">
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

const ProductCard = ({ product, customizable = false }) => {
  const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];

  return (
    <Link to={customizable ? `/customize/${product.slug}` : `/products/${product.slug}`} className="card overflow-hidden group hover:shadow-lg transition">
      <div className="aspect-square overflow-hidden bg-gray-100">
        <img
          src={primaryImage?.url}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
        />
      </div>
      <div className="p-4">
        {customizable && (
          <span className="inline-block bg-primary-100 text-primary-700 text-xs px-2 py-1 rounded-full mb-2">
            Customizable
          </span>
        )}
        <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
        <p className="text-primary-600 font-bold">
          {product.price.toLocaleString('vi-VN')} ₫
        </p>
      </div>
    </Link>
  );
};

export default HomePage;
