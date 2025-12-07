import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fabric } from 'fabric';
import html2canvas from 'html2canvas';
import api from '../utils/api';
import useCartStore from '../stores/useCartStore';
import useAuthStore from '../stores/useAuthStore';
import toast from 'react-hot-toast';
import { FiUpload, FiRotateCw, FiZoomIn, FiZoomOut, FiTrash2 } from 'react-icons/fi';

const CustomizerPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [designFile, setDesignFile] = useState(null);
  const [uploadedDesignUrl, setUploadedDesignUrl] = useState('');
  const [uploadedPublicId, setUploadedPublicId] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [canvas, setCanvas] = useState(null);
  const [designPlacement, setDesignPlacement] = useState('front');

  const canvasRef = useRef(null);
  const previewRef = useRef(null);

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/products/${slug}`);
        const productData = data.data;

        if (!productData.isCustomizable) {
          toast.error('This product is not customizable');
          navigate(`/products/${slug}`);
          return;
        }

        setProduct(productData);
        setSelectedColor(productData.variantColors[0] || null);
        setSelectedSize(productData.sizes[0]?.name || '');
        setLoading(false);
      } catch (error) {
        console.error('Error fetching product:', error);
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug, navigate]);

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (!product) return;

    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: 500,
      height: 600,
      backgroundColor: '#ffffff',
    });

    setCanvas(fabricCanvas);

    return () => {
      fabricCanvas.dispose();
    };
  }, [product]);

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setDesignFile(file);
    uploadDesign(file);
  };

  // Upload design to Cloudinary
  const uploadDesign = async (file) => {
    if (!isAuthenticated) {
      toast.error('Please login to upload designs');
      navigate('/login');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('design', file);

      const { data } = await api.post('/upload/design', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setUploadedDesignUrl(data.data.url);
      setUploadedPublicId(data.data.publicId);

      // Add image to canvas
      addImageToCanvas(data.data.url);

      toast.success('Design uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload design');
    } finally {
      setIsUploading(false);
    }
  };

  // Add uploaded image to Fabric canvas
  const addImageToCanvas = (imageUrl) => {
    if (!canvas) return;

    fabric.Image.fromURL(imageUrl, (img) => {
      // Scale image to fit printable area
      const maxWidth = product.printableArea?.width || 300;
      const maxHeight = product.printableArea?.height || 400;

      const scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1);

      img.scale(scale);
      img.set({
        left: 100,
        top: 100,
        selectable: true,
        hasControls: true,
        hasBorders: true,
      });

      // Clear previous design
      canvas.clear();
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
    }, { crossOrigin: 'anonymous' });
  };

  // Rotate design
  const rotateDesign = () => {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      activeObject.rotate((activeObject.angle + 90) % 360);
      canvas.renderAll();
    }
  };

  // Scale design up
  const scaleUp = () => {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      activeObject.scale(activeObject.scaleX * 1.1);
      canvas.renderAll();
    }
  };

  // Scale design down
  const scaleDown = () => {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      activeObject.scale(activeObject.scaleX * 0.9);
      canvas.renderAll();
    }
  };

  // Remove design
  const removeDesign = () => {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      canvas.remove(activeObject);
      canvas.renderAll();
    }
  };

  // Capture final preview
  const capturePreview = async () => {
    if (!previewRef.current) return null;

    try {
      const canvas = await html2canvas(previewRef.current, {
        backgroundColor: null,
        scale: 2,
      });

      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
      });
    } catch (error) {
      console.error('Error capturing preview:', error);
      return null;
    }
  };

  // Get design placement data from canvas
  const getDesignPlacement = () => {
    const activeObject = canvas?.getActiveObject();
    if (!activeObject) return null;

    return {
      location: designPlacement,
      x: activeObject.left,
      y: activeObject.top,
      width: activeObject.getScaledWidth(),
      height: activeObject.getScaledHeight(),
      rotation: activeObject.angle,
      scale: activeObject.scaleX,
    };
  };

  // Add to cart with custom design
  const handleAddToCart = async () => {
    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }

    if (!uploadedDesignUrl) {
      toast.error('Please upload a design');
      return;
    }

    const placement = getDesignPlacement();
    if (!placement) {
      toast.error('Please position your design on the canvas');
      return;
    }

    // Capture preview
    const previewDataUrl = await capturePreview();

    try {
      await addToCart({
        productId: product._id,
        quantity,
        selectedSize,
        selectedColor: selectedColor ? {
          name: selectedColor.name,
          hexCode: selectedColor.hexCode,
        } : null,
        customDesign: {
          imageUrl: uploadedDesignUrl,
          publicId: uploadedPublicId,
          placement,
          previewUrl: previewDataUrl,
        },
      });

      navigate('/cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-custom py-8">
        <p className="text-center text-gray-600">Product not found</p>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-bold mb-6">Customize Your {product.name}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Preview Area */}
        <div className="space-y-4">
          <div className="card p-6">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Design Location</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setDesignPlacement('front')}
                  className={`btn flex-1 ${designPlacement === 'front' ? 'btn-primary' : 'btn-outline'}`}
                >
                  Front
                </button>
                <button
                  onClick={() => setDesignPlacement('back')}
                  className={`btn flex-1 ${designPlacement === 'back' ? 'btn-primary' : 'btn-outline'}`}
                >
                  Back
                </button>
              </div>
            </div>

            {/* Preview with overlay */}
            <div ref={previewRef} className="relative bg-gray-100 rounded-lg overflow-hidden">
              {/* Base product image */}
              <img
                src={selectedColor?.imageUrl || product.images[0]?.url}
                alt={product.name}
                className="w-full h-auto"
              />

              {/* Canvas overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <canvas ref={canvasRef} className="border-2 border-dashed border-gray-400" />
              </div>
            </div>

            {/* Design Controls */}
            {uploadedDesignUrl && (
              <div className="mt-4 flex gap-2 justify-center">
                <button onClick={rotateDesign} className="btn btn-outline" title="Rotate">
                  <FiRotateCw size={20} />
                </button>
                <button onClick={scaleUp} className="btn btn-outline" title="Zoom In">
                  <FiZoomIn size={20} />
                </button>
                <button onClick={scaleDown} className="btn btn-outline" title="Zoom Out">
                  <FiZoomOut size={20} />
                </button>
                <button onClick={removeDesign} className="btn btn-outline text-red-600" title="Remove">
                  <FiTrash2 size={20} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Customization Options */}
        <div className="space-y-6">
          {/* Upload Design */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">Upload Your Design</h3>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="design-upload"
            />
            <label
              htmlFor="design-upload"
              className="btn btn-primary w-full flex items-center justify-center gap-2 cursor-pointer"
            >
              <FiUpload size={20} />
              {isUploading ? 'Uploading...' : 'Choose File'}
            </label>
            {designFile && (
              <p className="mt-2 text-sm text-gray-600">Selected: {designFile.name}</p>
            )}
            <p className="mt-2 text-xs text-gray-500">
              Supported formats: JPG, PNG, SVG (Max 10MB)
            </p>
          </div>

          {/* Color Selection */}
          {product.variantColors.length > 0 && (
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4">Select Color</h3>
              <div className="flex gap-3 flex-wrap">
                {product.variantColors.map((color) => (
                  <button
                    key={color.hexCode}
                    onClick={() => setSelectedColor(color)}
                    className={`w-12 h-12 rounded-full border-2 ${
                      selectedColor?.hexCode === color.hexCode
                        ? 'border-primary-600 ring-2 ring-primary-200'
                        : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color.hexCode }}
                    title={color.name}
                  />
                ))}
              </div>
              {selectedColor && (
                <p className="mt-2 text-sm text-gray-600">{selectedColor.name}</p>
              )}
            </div>
          )}

          {/* Size Selection */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">Select Size</h3>
            <div className="grid grid-cols-5 gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size.name}
                  onClick={() => setSelectedSize(size.name)}
                  disabled={size.stock === 0}
                  className={`btn ${
                    selectedSize === size.name ? 'btn-primary' : 'btn-outline'
                  } ${size.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {size.name}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">Quantity</h3>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="btn btn-outline w-12 h-12"
              >
                -
              </button>
              <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="btn btn-outline w-12 h-12"
              >
                +
              </button>
            </div>
          </div>

          {/* Price & Add to Cart */}
          <div className="card p-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600">Price:</span>
              <span className="text-2xl font-bold text-primary-600">
                {(product.price * quantity).toLocaleString('vi-VN')} ₫
              </span>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={!uploadedDesignUrl || isUploading}
              className="btn btn-primary w-full text-lg py-3"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomizerPage;
