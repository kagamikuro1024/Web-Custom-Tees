import orderService from '../services/order.service.js';

class OrderController {
  // Create order
  async createOrder(req, res, next) {
    try {
      const order = await orderService.createOrder(req.user.id, req.body);

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: order
      });
    } catch (error) {
      next(error);
    }
  }

  // Get user's orders
  async getUserOrders(req, res, next) {
    try {
      const result = await orderService.getUserOrders(req.user.id, req.query);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Get order by ID
  async getOrderById(req, res, next) {
    try {
      const { orderId } = req.params;
      const order = await orderService.getOrderById(orderId, req.user.id);

      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      next(error);
    }
  }

  // Get order by order number
  async getOrderByNumber(req, res, next) {
    try {
      const { orderNumber } = req.params;
      const order = await orderService.getOrderByNumber(orderNumber, req.user.id);

      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      next(error);
    }
  }

  // Cancel order
  async cancelOrder(req, res, next) {
    try {
      const { orderId } = req.params;
      const { reason } = req.body;
      const order = await orderService.cancelOrder(orderId, req.user.id, reason);

      res.json({
        success: true,
        message: 'Order cancelled successfully',
        data: order
      });
    } catch (error) {
      next(error);
    }
  }

  // Update custom design
  async updateCustomDesign(req, res, next) {
    try {
      const { orderId, itemIndex } = req.params;
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No image file provided'
        });
      }

      const designData = {
        imageUrl: req.file.path // Cloudinary URL
      };

      const order = await orderService.updateCustomDesign(
        orderId,
        req.user.id,
        parseInt(itemIndex),
        designData
      );

      res.json({
        success: true,
        message: 'Design updated successfully',
        data: order
      });
    } catch (error) {
      next(error);
    }
  }

  // User confirms delivery
  async confirmDelivery(req, res, next) {
    try {
      const { orderId } = req.params;
      const order = await orderService.confirmDelivery(orderId, req.user.id);

      res.json({
        success: true,
        message: 'Order marked as delivered successfully',
        data: order
      });
    } catch (error) {
      next(error);
    }
  }

  // Get user order stats
  async getUserOrderStats(req, res, next) {
    try {
      const stats = await orderService.getUserOrderStats(req.user.id);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new OrderController();
