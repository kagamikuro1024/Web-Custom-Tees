import statsService from '../services/stats.service.js';

class StatsController {
  // Get dashboard overview
  async getDashboardStats(req, res, next) {
    try {
      const stats = await statsService.getDashboardStats();
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  // Get revenue trend
  async getRevenueTrend(req, res, next) {
    try {
      const { days = 30 } = req.query;
      const trend = await statsService.getRevenueTrend(parseInt(days));
      res.json({
        success: true,
        data: trend
      });
    } catch (error) {
      next(error);
    }
  }

  // Get monthly revenue
  async getMonthlyRevenue(req, res, next) {
    try {
      const revenue = await statsService.getMonthlyRevenue();
      res.json({
        success: true,
        data: revenue
      });
    } catch (error) {
      next(error);
    }
  }

  // Get top products
  async getTopProducts(req, res, next) {
    try {
      const { limit = 10 } = req.query;
      const products = await statsService.getTopProducts(parseInt(limit));
      res.json({
        success: true,
        data: products
      });
    } catch (error) {
      next(error);
    }
  }

  // Get order status distribution
  async getOrderStatusDistribution(req, res, next) {
    try {
      const distribution = await statsService.getOrderStatusDistribution();
      res.json({
        success: true,
        data: distribution
      });
    } catch (error) {
      next(error);
    }
  }

  // Get recent activities
  async getRecentActivities(req, res, next) {
    try {
      const { limit = 10 } = req.query;
      const activities = await statsService.getRecentActivities(parseInt(limit));
      res.json({
        success: true,
        data: activities
      });
    } catch (error) {
      next(error);
    }
  }

  // Get low stock products
  async getLowStockProducts(req, res, next) {
    try {
      const { threshold = 10 } = req.query;
      const products = await statsService.getLowStockProducts(parseInt(threshold));
      res.json({
        success: true,
        data: products
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new StatsController();
