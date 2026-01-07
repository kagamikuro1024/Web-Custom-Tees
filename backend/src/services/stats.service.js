import Order from '../models/Order.model.js';
import Product from '../models/Product.model.js';
import User from '../models/User.model.js';
import Review from '../models/Review.model.js';

class StatsService {
  // Dashboard overview stats
  async getDashboardStats() {
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    const [
      totalRevenue,
      todayRevenue,
      monthRevenue,
      totalOrders,
      todayOrders,
      monthOrders,
      totalUsers,
      monthUsers,
      totalProducts,
      lowStockProducts,
      pendingOrders,
      avgOrderValue
    ] = await Promise.all([
      // Total revenue
      Order.aggregate([
        { $match: { orderStatus: { $in: ['delivered'] } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]).then(r => r[0]?.total || 0),
      
      // Today revenue
      Order.aggregate([
        { $match: { orderStatus: 'delivered', createdAt: { $gte: startOfToday } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]).then(r => r[0]?.total || 0),
      
      // Month revenue
      Order.aggregate([
        { $match: { orderStatus: 'delivered', createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]).then(r => r[0]?.total || 0),
      
      // Total orders
      Order.countDocuments(),
      
      // Today orders
      Order.countDocuments({ createdAt: { $gte: startOfToday } }),
      
      // Month orders
      Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
      
      // Total users
      User.countDocuments({ role: 'user' }),
      
      // Month new users
      User.countDocuments({ role: 'user', createdAt: { $gte: startOfMonth } }),
      
      // Total products
      Product.countDocuments({ status: 'active' }),
      
      // Low stock products
      Product.countDocuments({ 
        status: 'active',
        'stockBySize.quantity': { $lt: 10 }
      }),
      
      // Pending orders
      Order.countDocuments({ orderStatus: 'pending' }),
      
      // Average order value
      Order.aggregate([
        { $match: { orderStatus: { $in: ['delivered'] } } },
        { $group: { _id: null, avg: { $avg: '$totalAmount' } } }
      ]).then(r => r[0]?.avg || 0)
    ]);

    return {
      revenue: {
        total: totalRevenue,
        today: todayRevenue,
        month: monthRevenue
      },
      orders: {
        total: totalOrders,
        today: todayOrders,
        month: monthOrders,
        pending: pendingOrders,
        avgValue: Math.round(avgOrderValue)
      },
      users: {
        total: totalUsers,
        newThisMonth: monthUsers
      },
      products: {
        total: totalProducts,
        lowStock: lowStockProducts
      }
    };
  }

  // Revenue trend (last 30 days)
  async getRevenueTrend(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const revenueData = await Order.aggregate([
      {
        $match: {
          orderStatus: 'delivered',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
          },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.date': 1 }
      }
    ]);

    // Fill missing dates with 0
    const result = [];
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      const dateStr = date.toISOString().split('T')[0];
      
      const found = revenueData.find(d => d._id.date === dateStr);
      result.push({
        date: dateStr,
        revenue: found?.revenue || 0,
        orders: found?.orders || 0
      });
    }

    return result;
  }

  // Monthly revenue comparison (last 12 months)
  async getMonthlyRevenue() {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const monthlyData = await Order.aggregate([
      {
        $match: {
          orderStatus: 'delivered',
          createdAt: { $gte: twelveMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    return monthlyData.map(d => ({
      month: `${d._id.year}-${String(d._id.month).padStart(2, '0')}`,
      revenue: d.revenue,
      orders: d.orders
    }));
  }

  // Top selling products
  async getTopProducts(limit = 10) {
    const topProducts = await Order.aggregate([
      {
        $match: { orderStatus: 'delivered' }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      {
        $project: {
          name: '$productInfo.name',
          images: '$productInfo.images',
          totalSold: 1,
          revenue: 1
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: limit }
    ]);

    return topProducts.map(p => ({
      ...p,
      imageUrl: p.images && p.images.length > 0 ? p.images[0].url : null
    }));
  }

  // Order status distribution
  async getOrderStatusDistribution() {
    const distribution = await Order.aggregate([
      {
        $group: {
          _id: '$orderStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    const result = {
      pending: 0,
      confirmed: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0
    };

    distribution.forEach(d => {
      result[d._id] = d.count;
    });

    return result;
  }

  // Recent activities
  async getRecentActivities(limit = 10) {
    const [recentOrders, recentUsers, recentReviews] = await Promise.all([
      Order.find()
        .select('orderNumber totalAmount orderStatus createdAt user')
        .populate('user', 'firstName lastName')
        .sort('-createdAt')
        .limit(limit),
      
      User.find({ role: 'user' })
        .select('firstName lastName email createdAt')
        .sort('-createdAt')
        .limit(limit),
      
      Review.find()
        .select('product rating comment createdAt user')
        .populate('user', 'firstName lastName')
        .populate('product', 'name')
        .sort('-createdAt')
        .limit(limit)
    ]);

    // Merge and sort by date
    const activities = [
      ...recentOrders.map(o => ({
        type: 'order',
        id: o._id,
        title: `Đơn hàng mới #${o.orderNumber}`,
        description: `${o.user?.firstName} ${o.user?.lastName} - ${o.totalAmount.toLocaleString('vi-VN')}đ`,
        status: o.orderStatus,
        createdAt: o.createdAt
      })),
      ...recentUsers.map(u => ({
        type: 'user',
        id: u._id,
        title: 'Người dùng mới',
        description: `${u.firstName} ${u.lastName} (${u.email})`,
        createdAt: u.createdAt
      })),
      ...recentReviews.map(r => ({
        type: 'review',
        id: r._id,
        title: 'Đánh giá mới',
        description: `${r.user?.firstName} ${r.user?.lastName} - ${r.product?.name} (${r.rating}⭐)`,
        rating: r.rating,
        createdAt: r.createdAt
      }))
    ];

    return activities
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit);
  }

  // Low stock products alert
  async getLowStockProducts(threshold = 10) {
    const products = await Product.find({
      status: 'active',
      stockBySize: { $exists: true, $ne: [] }
    })
    .select('name images stockBySize price')
    .limit(50);

    // Filter and calculate stock manually
    const lowStockProducts = products
      .filter(p => {
        if (!Array.isArray(p.stockBySize) || p.stockBySize.length === 0) {
          return false;
        }
        const totalStock = p.stockBySize.reduce((sum, s) => sum + (s.quantity || 0), 0);
        return totalStock < threshold;
      })
      .map(p => ({
        _id: p._id,
        name: p.name,
        imageUrl: p.images && p.images.length > 0 ? p.images[0].url : null,
        price: p.price,
        totalStock: p.stockBySize.reduce((sum, s) => sum + (s.quantity || 0), 0),
        stockBySize: p.stockBySize
      }))
      .slice(0, 20);

    return lowStockProducts;
  }
}

export default new StatsService();
