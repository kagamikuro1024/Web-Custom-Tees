import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaUpload, FaTimes, FaSpinner, FaPlus, FaMinus } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../utils/api';
import useCartStore from '../stores/useCartStore';
import useAuthStore from '../stores/useAuthStore';

const ProductDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  // Custom design states
  const [designFile, setDesignFile] = useState(null);
  const [designPreview, setDesignPreview] = useState(null);
  const [uploadedDesignUrl, setUploadedDesignUrl] = useState(null);
  const [uploadedPublicId, setUploadedPublicId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  // Design positioning states
  const [designPosition, setDesignPosition] = useState({ x: 50, y: 50 });
  const [designSize, setDesignSize] = useState(150);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const canvasRef = useRef(null);
  const productImageRef = useRef(null);

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/products/${slug}`);
        const productData = data.data || data.product || data;
        setProduct(productData);
        
        // Set default color
        if (productData.variantColors && productData.variantColors.length > 0) {
          setSelectedColor(productData.variantColors[0]);
        }
        
        // Set default size
        if (productData.sizes && productData.sizes.length > 0) {
          setSelectedSize(productData.sizes[0].name);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Failed to load product');
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug, navigate]);

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setDesignFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setDesignPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Upload design to Cloudinary
  const handleUploadDesign = async () => {
    if (!designFile) {
      toast.error('Please select a design file first');
      return;
    }

    if (!isAuthenticated) {
      toast.error('Please login to upload designs');
      navigate('/login');
      return;
    }

    const formData = new FormData();
    formData.append('design', designFile);

    try {
      setUploading(true);
      const { data } = await api.post('/upload/design', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploadedDesignUrl(data.data.url);
      setUploadedPublicId(data.data.publicId);
      toast.success('Design uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload design');
    } finally {
      setUploading(false);
    }
  };

  // Remove uploaded design
  const handleRemoveDesign = () => {
    setDesignFile(null);
    setDesignPreview(null);
    setUploadedDesignUrl(null);
    setUploadedPublicId(null);
  };

  // Mouse drag handlers for design positioning
  const handleMouseDown = (e) => {
    if (!designPreview || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if click is on design
    const designX = (designPosition.x / 100) * rect.width;
    const designY = (designPosition.y / 100) * rect.height;
    
    if (
      x >= designX &&
      x <= designX + designSize &&
      y >= designY &&
      y <= designY + designSize
    ) {
      setIsDragging(true);
      setDragStart({ x: x - designX, y: y - designY });
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - dragStart.x;
    const y = e.clientY - rect.top - dragStart.y;

    setDesignPosition({
      x: Math.max(0, Math.min(100, (x / rect.width) * 100)),
      y: Math.max(0, Math.min(100, (y / rect.height) * 100)),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  // Add to cart handler
  const handleAddToCart = async () => {
    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }

    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }

    // Validate custom design for customizable products
    if (product.isCustomizable && !uploadedDesignUrl) {
      toast.error('Please upload and position your design first');
      return;
    }

    const cartItem = {
      productId: product._id,
      quantity,
      selectedSize,
      selectedColor: selectedColor ? {
        name: selectedColor.name,
        hexCode: selectedColor.hexCode,
      } : null,
    };

    // Add custom design data if product is customizable
    if (product.isCustomizable && uploadedDesignUrl) {
      cartItem.customDesign = {
        imageUrl: uploadedDesignUrl,
        publicId: uploadedPublicId,
        placement: {
          location: 'front', // Can be extended to support front/back
          x: designPosition.x,
          y: designPosition.y,
          width: designSize,
          height: designSize,
          rotation: 0,
          scale: 1,
        },
        previewUrl: designPreview, // Base64 preview
      };
    }

    try {
      setAddingToCart(true);
      await addToCart(cartItem);
      toast.success('Added to cart successfully!');
      
      // Optionally navigate to cart
      // navigate('/cart');
    } catch (error) {
      console.error('Add to cart error:', error);
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <FaSpinner className="animate-spin text-4xl text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-custom py-12">
        <p className="text-center text-gray-600">Product not found</p>
      </div>
    );
  }

  // Get current product image
  const currentImage = selectedColor?.imageUrl || product.images[selectedImage]?.url || product.images[0]?.url;

  return (
    <div className="container-custom py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Product Images & Custom Design Preview */}
        <div>
          {/* Main Product Image with Design Overlay */}
          <div className="relative bg-gray-100 rounded-lg overflow-hidden mb-4">
            <div
              ref={canvasRef}
              className="relative aspect-square cursor-move"
              onMouseDown={handleMouseDown}
            >
              <img
                ref={productImageRef}
                src={currentImage}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              
              {/* Design Overlay */}
              {designPreview && (
                <div
                  className="absolute pointer-events-none"
                  style={{
                    left: `${designPosition.x}%`,
                    top: `${designPosition.y}%`,
                    width: `${designSize}px`,
                    height: `${designSize}px`,
                    transform: 'translate(0, 0)',
                  }}
                >
                  <img
                    src={designPreview}
                    alt="Custom design"
                    className="w-full h-full object-contain opacity-90 pointer-events-auto cursor-move"
                    draggable={false}
                  />
                </div>
              )}
            </div>

            {designPreview && (
              <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm text-gray-600">
                💡 Drag design to position
              </div>
            )}
          </div>

          {/* Thumbnail Gallery */}
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition ${
                    selectedImage === index ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <img
                    src={image.url}
                    alt={image.alt || product.name}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Info & Customization */}
        <div className="space-y-6">
          {/* Product Title */}
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">{product.name}</h1>
            
            {/* Rating & Reviews */}
            {product.rating?.count > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < Math.floor(product.rating.average) ? 'text-yellow-400' : 'text-gray-300'}>
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-gray-600">({product.rating.count} reviews)</span>
              </div>
            )}
          </div>
          
          {/* Price & Stock */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-baseline gap-3 mb-2">
              {product.compareAtPrice && (
                <span className="text-lg text-gray-400 line-through">
                  {product.compareAtPrice.toLocaleString('vi-VN')}₫
                </span>
              )}
              <span className="text-4xl font-bold text-primary-600">
                {product.price.toLocaleString('vi-VN')}₫
              </span>
              {product.compareAtPrice && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                  -{Math.round((1 - product.price / product.compareAtPrice) * 100)}%
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                product.totalStock > 0 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {product.totalStock > 0 ? (
                  <>
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    In Stock ({product.totalStock} available)
                  </>
                ) : (
                  'Out of Stock'
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Product Description</h3>
            <p className="text-gray-700 leading-relaxed">{product.description}</p>
            {product.material && (
              <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                <span className="font-medium">Material:</span>
                <span>{product.material}</span>
              </div>
            )}
          </div>

          {/* Custom Design Upload (if customizable) */}
          {product.isCustomizable && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                🎨 Customize Your Design
              </h3>

              {!designPreview ? (
                <div>
                  <label className="block mb-2 text-sm text-gray-600">
                    Upload your design (PNG, JPG, max 10MB)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="design-upload"
                  />
                  <label
                    htmlFor="design-upload"
                    className="btn-secondary cursor-pointer inline-flex items-center gap-2"
                  >
                    <FaUpload /> Choose Design File
                  </label>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-600">
                      {designFile?.name}
                    </span>
                    <button
                      onClick={handleRemoveDesign}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTimes />
                    </button>
                  </div>

                  {!uploadedDesignUrl && (
                    <button
                      onClick={handleUploadDesign}
                      disabled={uploading}
                      className="btn-primary w-full mb-3"
                    >
                      {uploading ? (
                        <>
                          <FaSpinner className="animate-spin mr-2" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <FaUpload className="mr-2" />
                          Upload Design
                        </>
                      )}
                    </button>
                  )}

                  {uploadedDesignUrl && (
                    <div className="bg-green-100 text-green-800 px-3 py-2 rounded text-sm mb-3">
                      ✓ Design uploaded! Drag it on the product to position.
                    </div>
                  )}

                  {/* Design Size Control */}
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">
                      Design Size: {designSize}px
                    </label>
                    <input
                      type="range"
                      min="50"
                      max="300"
                      value={designSize}
                      onChange={(e) => setDesignSize(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Color Selection */}
          {product.variantColors && product.variantColors.length > 0 && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Color: <span className="text-primary-600">{selectedColor?.name}</span>
              </h3>
              <div className="flex gap-3 flex-wrap">
                {product.variantColors.map((color, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedColor(color)}
                    className={`w-12 h-12 rounded-lg border-3 transition-all shadow-sm hover:shadow-md ${
                      selectedColor?.hexCode === color.hexCode
                        ? 'border-primary-600 ring-4 ring-primary-200 scale-110'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: color.hexCode }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Size Selection */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Select Size</h3>
            <div className="grid grid-cols-5 gap-2">
              {product.sizes.map((size, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedSize(size.name)}
                  disabled={size.stock === 0}
                  className={`px-4 py-3 border-2 rounded-lg font-semibold transition-all ${
                    selectedSize === size.name
                      ? 'border-primary-600 bg-primary-600 text-white shadow-lg scale-105'
                      : size.stock === 0
                      ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'border-gray-300 hover:border-primary-500 hover:bg-primary-50'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-sm">{size.name}</div>
                    {size.stock > 0 && size.stock < 10 && (
                      <div className="text-xs opacity-75">({size.stock} left)</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Quantity</h3>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-12 h-12 border-2 border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-100 hover:border-primary-500 transition-colors"
              >
                <FaMinus className="text-gray-600" />
              </button>
              <span className="text-2xl font-bold text-gray-900 w-16 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-12 h-12 border-2 border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-100 hover:border-primary-500 transition-colors"
              >
                <FaPlus className="text-gray-600" />
              </button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <div className="border-t pt-6">
            <button
              onClick={handleAddToCart}
              disabled={addingToCart || product.totalStock === 0 || !selectedSize}
              className="btn-primary w-full text-lg py-5 font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {addingToCart ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Adding to Cart...
                </>
              ) : (
                <>
                  <FaShoppingCart />
                  Add to Cart
                </>
              )}
            </button>
          </div>

          {/* Product Details */}
          <div className="mt-8 pt-8 border-t">
            <h3 className="font-semibold mb-3">Product Details</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Material:</span>
                <span className="font-medium">{product.material || 'Cotton'}</span>
              </div>
              <div className="flex justify-between">
                <span>Weight:</span>
                <span className="font-medium">{product.weight || 0}g</span>
              </div>
              <div className="flex justify-between">
                <span>SKU:</span>
                <span className="font-medium">{product.slug}</span>
              </div>
              {product.isCustomizable && (
                <div className="flex justify-between">
                  <span>Customizable:</span>
                  <span className="font-medium text-green-600">Yes ✓</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
