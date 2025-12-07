import { Link } from 'react-router-dom';
import { FaStar, FaPalette } from 'react-icons/fa';

const ProductCard = ({ product }) => {
  const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
  const formattedPrice = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(product.price);

  return (
    <Link
      to={`/products/${product.slug}`}
      className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={primaryImage?.url || 'https://via.placeholder.com/400'}
          alt={primaryImage?.alt || product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400?text=No+Image';
          }}
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.isCustomizable && (
            <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              <FaPalette className="text-xs" /> Customizable
            </span>
          )}
          {product.isFeatured && (
            <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
              Featured
            </span>
          )}
        </div>

        {/* Compare At Price Badge */}
        {product.compareAtPrice && product.compareAtPrice > product.price && (
          <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-bold">
            SALE
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {product.name}
        </h3>

        {/* Short Description */}
        {product.shortDescription && (
          <p className="text-sm text-gray-500 mb-2 line-clamp-1">
            {product.shortDescription}
          </p>
        )}

        {/* Rating */}
        {product.rating?.count > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <FaStar
                  key={i}
                  className={`text-xs ${
                    i < Math.floor(product.rating.average)
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">
              ({product.rating.count})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-primary-600">
            {formattedPrice}
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-sm text-gray-400 line-through">
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
              }).format(product.compareAtPrice)}
            </span>
          )}
        </div>

        {/* Stock & Colors */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            {product.totalStock > 0 ? (
              <>In stock ({product.totalStock})</>
            ) : (
              <span className="text-red-500">Out of stock</span>
            )}
          </span>
          {product.variantColors && product.variantColors.length > 0 && (
            <div className="flex items-center gap-1">
              <span>{product.variantColors.length} colors</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
