import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaPalette } from 'react-icons/fa';

/**
 * ⚡ OPTIMIZED ProductCard Component
 * - React.memo: Prevents re-render when parent updates
 * - useMemo: Caches formatted prices
 * - Cloudinary optimization: Auto format & quality
 * - Lazy loading images: Only load when visible
 */
const ProductCard = React.memo(({ product }) => {
  // 🎯 Memoize expensive calculations
  const primaryImage = useMemo(() => 
    product.images?.find(img => img.isPrimary) || product.images?.[0],
    [product.images]
  );

  const formattedPrice = useMemo(() => 
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(product.price),
    [product.price]
  );

  const formattedComparePrice = useMemo(() => 
    product.compareAtPrice && product.compareAtPrice > product.price
      ? new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND'
        }).format(product.compareAtPrice)
      : null,
    [product.compareAtPrice, product.price]
  );

  // 🖼️ Cloudinary Image Optimization
  const optimizedImageUrl = useMemo(() => {
    const url = primaryImage?.url || 'https://via.placeholder.com/400';
    // Nếu là Cloudinary URL, thêm transformations để giảm kích thước
    if (url.includes('cloudinary.com') && url.includes('/upload/')) {
      return url.replace('/upload/', '/upload/w_500,h_500,c_fill,q_auto,f_auto/');
    }
    return url;
  }, [primaryImage?.url]);

  return (
    <Link
      to={`/products/${product.slug}`}
      className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
    >
      {/* Image with Lazy Loading */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={optimizedImageUrl}
          alt={primaryImage?.alt || product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          loading="lazy"
          decoding="async"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400?text=No+Image';
          }}
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.isCustomizable && (
            <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              <FaPalette className="text-xs" /> Customize
            </span>
          )}
          {product.isFeatured && (
            <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
              Nổi bật
            </span>
          )}
        </div>

        {/* Compare At Price Badge */}
        {formattedComparePrice && (
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
        {product.rating && (
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
              ({product.rating.count || 0})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-primary-600">
            {formattedPrice}
          </span>
          {formattedComparePrice && (
            <span className="text-sm text-gray-400 line-through">
              {formattedComparePrice}
            </span>
          )}
        </div>

        {/* Stock & Colors */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            {product.totalStock > 0 ? (
              <>Còn hàng ({product.totalStock})</>
            ) : (
              <span className="text-red-500">Hết hàng</span>
            )}
          </span>
          {product.variantColors && product.variantColors.length > 0 && (
            <div className="flex items-center gap-1">
              <span>{product.variantColors.length} màu</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
});

// Display name for debugging
ProductCard.displayName = 'ProductCard';

export default ProductCard;
