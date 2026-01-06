import orderService from '../services/order.service.js';
import productService from '../services/product.service.js';
import Category from '../models/Category.model.js';

class AdminController {
  // Get all orders
  async getAllOrders(req, res, next) {
    try {
      const result = await orderService.getAllOrders(req.query);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Get order by ID (Admin view)
  async getOrderById(req, res, next) {
    try {
      const { orderId } = req.params;
      const order = await orderService.getOrderById(orderId);

      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      next(error);
    }
  }

  // Update order status
  async updateOrderStatus(req, res, next) {
    try {
      const { orderId } = req.params;
      const { status, note } = req.body;

      const order = await orderService.updateOrderStatus(
        orderId,
        status,
        note,
        req.user.id
      );

      res.json({
        success: true,
        message: 'Order status updated',
        data: order
      });
    } catch (error) {
      next(error);
    }
  }

  // Update tracking info
  async updateTrackingInfo(req, res, next) {
    try {
      const { orderId } = req.params;
      const order = await orderService.updateTrackingInfo(orderId, req.body);

      res.json({
        success: true,
        message: 'Tracking info updated',
        data: order
      });
    } catch (error) {
      next(error);
    }
  }

  // Get order statistics
  async getOrderStatistics(req, res, next) {
    try {
      const stats = await orderService.getOrderStatistics();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  // Get order custom designs
  async getOrderDesigns(req, res, next) {
    try {
      const { orderId } = req.params;
      const order = await orderService.getOrderById(orderId);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      // Extract all custom designs from order items
      const designs = order.items
        .filter(item => item.customDesign?.imageUrl)
        .map(item => ({
          imageUrl: item.customDesign.imageUrl,
          publicId: item.customDesign.publicId,
          productName: item.productName,
          placement: item.customDesign.placement
        }));

      res.json({
        success: true,
        data: {
          orderNumber: order.orderNumber,
          designs
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get all products (Admin)
  async getAllProducts(req, res, next) {
    try {
      const filters = { ...req.query };
      delete filters.status; // Allow viewing all statuses
      
      const result = await productService.getAllProducts(filters);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Create category
  async createCategory(req, res, next) {
    try {
      const category = await Category.create(req.body);

      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: category
      });
    } catch (error) {
      next(error);
    }
  }

  // Get all categories
  async getAllCategories(req, res, next) {
    try {
      const categories = await Category.find().sort('name');

      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AdminController();
