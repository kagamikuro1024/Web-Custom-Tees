import mongoose from 'mongoose';

// Reusable Order Item Schema
const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  productImage: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true
  },
  
  // Variant details
  selectedSize: {
    type: String,
    required: true
  },
  selectedColor: {
    name: String,
    hexCode: String
  },
  
  // CRITICAL: Custom Design Information (for customizable products)
  customDesign: {
    // High-quality design image URL for printing
    imageUrl: {
      type: String,
      default: null
    },
    publicId: {
      type: String,
      default: null
    },
    // Original file metadata
    originalFileName: String,
    fileSize: Number, // in bytes
    dimensions: {
      width: Number,
      height: Number
    },
    // Placement configuration
    placement: {
      location: {
        type: String,
        enum: ['front', 'back'],
        default: 'front'
      },
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
      width: { type: Number, default: 300 },
      height: { type: Number, default: 300 },
      rotation: { type: Number, default: 0 },
      scale: { type: Number, default: 1 }
    },
    // Preview thumbnail for display
    previewUrl: String,
    // Flag to mark if design needs processing
    isCustomized: {
      type: Boolean,
      default: false
    }
  },
  
  // Subtotal for this item
  subtotal: {
    type: Number,
    required: true
  }
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Order Items
  items: [orderItemSchema],
  
  // Pricing
  subtotal: {
    type: Number,
    required: true
  },
  shippingFee: {
    type: Number,
    default: 0
  },
  tax: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true
  },
  
  // Shipping Address
  shippingAddress: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true }
  },
  
  // Payment Information
  paymentMethod: {
    type: String,
    enum: ['cod', 'stripe', 'zalopay', 'momo', 'vnpay'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentDetails: {
    transactionId: String,
    paidAt: Date,
    paymentIntent: String
  },
  paidAt: Date,
  
  // VNPAY Transaction Info
  vnpayTransaction: {
    transactionNo: String,
    bankCode: String,
    cardType: String,
    payDate: String
  },
  
  // Order Status
  orderStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  
  // Status Timeline
  statusHistory: [{
    status: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  // Shipping Info
  trackingNumber: String,
  shippingCarrier: String,
  estimatedDelivery: Date,
  actualDelivery: Date,
  
  // Notes
  customerNote: String,
  adminNote: String,
  
  // Flags for special handling
  hasCustomItems: {
    type: Boolean,
    default: false
  },
  isPriority: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Auto-generate order number
orderSchema.pre('save', function(next) {
  if (!this.orderNumber) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.orderNumber = `ORD-${timestamp}-${random}`;
  }
  
  // Check if order contains custom items
  this.hasCustomItems = this.items.some(item => item.customDesign?.isCustomized);
  
  // Add status to history if status changed
  if (this.isModified('orderStatus')) {
    this.statusHistory.push({
      status: this.orderStatus,
      timestamp: new Date()
    });
  }
  
  next();
});

// Indexes
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ hasCustomItems: 1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;
