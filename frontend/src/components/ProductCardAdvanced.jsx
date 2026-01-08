import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaPalette } from 'react-icons/fa';
import { optimizeCloudinaryImage, IMAGE_PRESETS } from '../utils/imageOptimization';
import { usePrefetch } from '../hooks/usePrefetch';

/**
 * ⚡ HIGHLY OPTIMIZED ProductCard Component (Advanced Version)
 * 
 * Optimizations Applied:
 * - React.memo: Prevents unnecessary re-renders
 * - useMemo: Caches expensive calculations
 * - Cloudinary optimization: Auto format, quality & resize
 * - Lazy loading images: Native browser lazy loading
 * - Prefetching: Pre-load product detail page on hover
 * - Proper key usage: Stable keys for list rendering
 */
const ProductCardAdvanced = React.memo(({ product }) => {
  const productUrl = `/products/${product.slug}`;
  
  // 🚀 Prefetch product detail page on hover
  const prefetchHandlers = usePrefetch(productUrl);

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

  // 🖼️ Cloudinary Image Optimization với preset
  const optimizedImageUrl = useMemo(() => {
    const url = primaryImage?.url || 'https://via.placeholder.com/400';
    return optimizeCloudinaryImage(url, IMAGE_PRESETS.CARD);
  }, [primaryImage?.url]);

  // 💾 Calculate discount percentage
  const discountPercentage = useMemo(() => {
    if (!product.compareAtPrice || product.compareAtPrice <= product.price) return null;
    return Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100);
  }, [product.compareAtPrice, product.price]);

  return (
    <Link
      to={productUrl}
      className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
      {...prefetchHandlers} // 🚀 Apply prefetch on hover/touch
    >
      {/* Image with Lazy Loading & Optimization */}
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
            <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
              <FaPalette className="text-xs" /> Customizable
            </span>
          )}
          {product.isFeatured && (
            <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
              Featured
            </span>
          )}
        </div>

        {/* Discount Badge */}
        {discountPercentage && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg">
            -{discountPercentage}%
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-primary-600 transition-colors min-h-[2.5rem]">
          {product.name}
        </h3>

        {/* Short Description */}
        {product.shortDescription && (
          <p className="text-sm text-gray-500 mb-2 line-clamp-1">
            {product.shortDescription}
          </p>
        )}

        {/* Rating */}
        {product.rating && product.rating.count > 0 && (
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
          {formattedComparePrice && (
            <span className="text-sm text-gray-400 line-through">
              {formattedComparePrice}
            </span>
          )}
        </div>

        {/* Stock & Colors */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className={product.totalStock > 0 ? 'text-green-600 font-medium' : 'text-red-500 font-medium'}>
            {product.totalStock > 0 ? (
              <>Còn hàng ({product.totalStock})</>
            ) : (
              <>Hết hàng</>
            )}
          </span>
          {product.variantColors && product.variantColors.length > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-gray-600">{product.variantColors.length} màu</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
});

// Display name for debugging
ProductCardAdvanced.displayName = 'ProductCardAdvanced';

export default ProductCardAdvanced;
