import mongoose from 'mongoose';
import slugify from 'slugify';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [300, 'Short description cannot exceed 300 characters']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  compareAtPrice: {
    type: Number,
    min: [0, 'Compare price cannot be negative'],
    default: null
  },
  
  // CRITICAL: Customization Flag
  isCustomizable: {
    type: Boolean,
    required: true,
    default: false
  },
  
  // Printable Area Configuration (Only for customizable products)
  printableArea: {
    location: {
      type: String,
      enum: ['front', 'back', 'both'],
      default: 'front'
    },
    width: {
      type: Number, // in pixels or percentage
      default: 300
    },
    height: {
      type: Number,
      default: 400
    },
    // Positioning on the base image
    offsetX: {
      type: Number,
      default: 0
    },
    offsetY: {
      type: Number,
      default: 0
    }
  },
  
  // Base Product Images
  images: [{
    url: { type: String, required: true },
    alt: String,
    isPrimary: { type: Boolean, default: false },
    color: String // Associated color for this image
  }],
  
  // Available Colors (for customizable products)
  variantColors: [{
    name: { type: String, required: true }, // 'White', 'Black', 'Navy'
    hexCode: { type: String, required: true }, // '#FFFFFF'
    imageUrl: String // Specific image for this color variant
  }],
  
  // Available Sizes
  sizes: [{
    name: { type: String, required: true }, // 'S', 'M', 'L', 'XL', '2XL'
    stock: { type: Number, required: true, min: 0, default: 0 },
    sku: String
  }],
  
  // Category & Tags
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Product category is required']
  },
  tags: [String],
  
  // Material & Specifications
  material: {
    type: String,
    default: '100% Cotton'
  },
  weight: {
    type: Number, // in grams
    default: 0
  },
  
  // Stock Management
  totalStock: {
    type: Number,
    required: true,
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  
  // SEO
  seoTitle: String,
  seoDescription: String,
  
  // Stats
  views: {
    type: Number,
    default: 0
  },
  sold: {
    type: Number,
    default: 0
  },
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  
  // Status
  status: {
    type: String,
    enum: ['draft', 'active', 'archived'],
    default: 'active'
  },
  isFeatured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Auto-generate slug from name
productSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  
  // Calculate total stock from sizes
  if (this.sizes && this.sizes.length > 0) {
    this.totalStock = this.sizes.reduce((total, size) => total + size.stock, 0);
  }
  
  next();
});

// Indexes for performance
productSchema.index({ slug: 1 });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ isCustomizable: 1 });
productSchema.index({ 'rating.average': -1 });
productSchema.index({ sold: -1 });

const Product = mongoose.model('Product', productSchema);

export default Product;
