import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
    default: 1
  },
  
  // Variant Selection
  selectedSize: {
    type: String,
    required: [true, 'Size selection is required']
  },
  selectedColor: {
    name: String,
    hexCode: String
  },
  
  // CRITICAL: Custom Design Data (Required if product is customizable)
  customDesign: {
    imageUrl: {
      type: String,
      default: null
    },
    publicId: {
      type: String, // Cloudinary public_id for deletion
      default: null
    },
    // Design placement and transformation data
    placement: {
      location: {
        type: String,
        enum: ['front', 'back'],
        default: 'front'
      },
      // Coordinates and scale for the design overlay
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
      width: { type: Number, default: 300 },
      height: { type: Number, default: 300 },
      rotation: { type: Number, default: 0 },
      scale: { type: Number, default: 1 }
    },
    // Preview/thumbnail of the customized product
    previewUrl: {
      type: String,
      default: null
    }
  },
  
  // Price at the time of adding to cart
  priceAtAdd: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  
  // Calculate total automatically
  totalItems: {
    type: Number,
    default: 0
  },
  totalPrice: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Calculate totals before saving
cartSchema.pre('save', function(next) {
  this.totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
  this.totalPrice = this.items.reduce((total, item) => total + (item.priceAtAdd * item.quantity), 0);
  next();
});

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;
