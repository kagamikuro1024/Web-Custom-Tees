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
}

export default new OrderController();
