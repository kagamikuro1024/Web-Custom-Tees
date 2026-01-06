import Order from '../models/Order.model.js';
import Cart from '../models/Cart.model.js';
import productService from './product.service.js';
import cartService from './cart.service.js';

class OrderService {
  // Generate unique order number
  async generateOrderNumber() {
    const prefix = 'ORD';
    const timestamp = Date.now().toString().slice(-8); // Last 8 digits of timestamp
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const orderNumber = `${prefix}${timestamp}${random}`;
    
    // Check if order number already exists (very unlikely)
    const exists = await Order.findOne({ orderNumber });
    if (exists) {
      return this.generateOrderNumber(); // Recursively generate new number
    }
    
    return orderNumber;
  }

  // Create order from cart
  async createOrder(userId, orderData) {
    const { items, subtotal, shippingFee, totalAmount, shippingAddress, paymentMethod, notes } = orderData;

    // Generate unique order number
    const orderNumber = await this.generateOrderNumber();

    // Create order
    const order = await Order.create({
      orderNumber,
      user: userId,
      items,
      subtotal,
      shippingFee,
      tax: 0, // No tax for now
      totalAmount,
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
      customerNote: notes,
      statusHistory: [{
        status: 'pending',
        timestamp: new Date(),
        note: 'Order placed'
      }]
    });

    // Clear cart
    await cartService.clearCart(userId);

    return order;
  }

  // Get user's orders
  async getUserOrders(userId, filters = {}) {
    const { status, page = 1, limit = 10 } = filters;

    const query = { user: userId };
    if (status) {
      query.orderStatus = status;
    }

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort('-createdAt')
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(query)
    ]);

    return {
      orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Get order by ID
  async getOrderById(orderId, userId = null) {
    const query = { _id: orderId };
    if (userId) {
      query.user = userId;
    }

    const order = await Order.findOne(query)
      .populate('user', 'firstName lastName email phone');

    if (!order) {
      throw new Error('Order not found');
    }

    return order;
  }

  // Get order by order number
  async getOrderByNumber(orderNumber, userId = null) {
    const query = { orderNumber };
    if (userId) {
      query.user = userId;
    }

    const order = await Order.findOne(query)
      .populate('user', 'firstName lastName email phone');

    if (!order) {
      throw new Error('Order not found');
    }

    return order;
  }

  // Admin: Get all orders
  async getAllOrders(filters = {}) {
    const {
      status,
      hasCustomItems,
      paymentStatus,
      search,
      page = 1,
      limit = 20,
      sortBy = '-createdAt'
    } = filters;

    const query = {};

    if (status) {
      query.orderStatus = status;
    }

    if (hasCustomItems !== undefined) {
      query.hasCustomItems = hasCustomItems === 'true';
    }

    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'shippingAddress.fullName': { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('user', 'firstName lastName email')
        .sort(sortBy)
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(query)
    ]);

    return {
      orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Admin: Update order status
  async updateOrderStatus(orderId, status, note = '', updatedBy = null) {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    order.orderStatus = status;
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      note,
      updatedBy
    });

    // Update payment status if delivered
    if (status === 'delivered' && order.paymentMethod === 'cod') {
      order.paymentStatus = 'paid';
      order.paymentDetails.paidAt = new Date();
    }

    // Set delivery date
    if (status === 'delivered' && !order.actualDelivery) {
      order.actualDelivery = new Date();
    }

    await order.save();

    return order;
  }

  // Admin: Update tracking info
  async updateTrackingInfo(orderId, trackingData) {
    const { trackingNumber, shippingCarrier, estimatedDelivery } = trackingData;

    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        trackingNumber,
        shippingCarrier,
        estimatedDelivery,
        orderStatus: 'shipped'
      },
      { new: true }
    );

    if (!order) {
      throw new Error('Order not found');
    }

    return order;
  }

  // Helper: Calculate shipping fee
  calculateShippingFee(subtotal) {
    if (subtotal >= 500000) return 0; // Free shipping for orders > 500k VND
    return 30000; // Standard shipping fee
  }

  // Helper: Calculate tax
  calculateTax(subtotal) {
    return Math.round(subtotal * 0.1); // 10% VAT
  }

  // Get order statistics (Admin)
  async getOrderStatistics() {
    const Product = (await import('../models/Product.model.js')).default;
    const User = (await import('../models/User.model.js')).default;
    
    const [
      totalOrders,
      pendingOrders,
      processingOrders,
      deliveredOrders,
      cancelledOrders,
      customOrders,
      totalProducts,
      customizableProducts,
      totalUsers,
      newUsersThisMonth
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ orderStatus: 'pending' }),
      Order.countDocuments({ orderStatus: { $in: ['confirmed', 'processing', 'printing', 'shipped'] } }),
      Order.countDocuments({ orderStatus: 'delivered' }),
      Order.countDocuments({ orderStatus: 'cancelled' }),
      Order.countDocuments({ hasCustomItems: true }),
      Product.countDocuments(),
      Product.countDocuments({ isCustomizable: true }),
      User.countDocuments(),
      User.countDocuments({ 
        createdAt: { 
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) 
        } 
      })
    ]);

    const revenue = await Order.aggregate([
      { $match: { orderStatus: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    return {
      totalOrders,
      pendingOrders,
      processingOrders,
      deliveredOrders,
      cancelledOrders,
      customOrders,
      totalRevenue: revenue[0]?.total || 0,
      totalProducts,
      customizableProducts,
      totalUsers,
      newUsersThisMonth
    };
  }
}

export default new OrderService();
