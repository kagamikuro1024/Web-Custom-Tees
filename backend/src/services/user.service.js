import User from '../models/User.model.js';
import Order from '../models/Order.model.js';

class UserService {
  // Get all users with order statistics (Admin only)
  async getAllUsersWithStats(filters = {}) {
    const { tier, sortBy = 'createdAt', sortOrder = -1, page = 1, limit = 20 } = filters;

    // Build match query
    const matchQuery = { role: 'user' };
    if (tier && tier !== 'all') {
      matchQuery.tier = tier;
    }

    // Calculate skip
    const skip = (page - 1) * limit;

    // Aggregate user data with order statistics
    const users = await User.aggregate([
      { $match: matchQuery },
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'user',
          as: 'orders'
        }
      },
      {
        $addFields: {
          orderCount: {
            $size: {
              $filter: {
                input: '$orders',
                as: 'order',
                cond: { $eq: ['$$order.orderStatus', 'delivered'] }
              }
            }
          },
          totalSpent: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: '$orders',
                    as: 'order',
                    cond: { $eq: ['$$order.orderStatus', 'delivered'] }
                  }
                },
                as: 'order',
                in: '$$order.totalAmount'
              }
            }
          }
        }
      },
      {
        $project: {
          firstName: 1,
          lastName: 1,
          email: 1,
          phone: 1,
          avatar: 1,
          tier: 1,
          isActive: 1,
          createdAt: 1,
          orderCount: 1,
          totalSpent: 1
        }
      },
      { $sort: { [sortBy]: sortOrder } },
      { $skip: skip },
      { $limit: limit }
    ]);

    // Get total count for pagination
    const totalCount = await User.countDocuments(matchQuery);

    return {
      users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalUsers: totalCount,
        limit
      }
    };
  }

  // Get single user with detailed stats
  async getUserWithStats(userId) {
    const user = await User.findById(userId).select('-password -refreshToken');
    if (!user) {
      throw new Error('User not found');
    }

    // Get order statistics
    const orderStats = await Order.aggregate([
      { $match: { user: user._id, orderStatus: 'delivered' } },
      {
        $group: {
          _id: null,
          orderCount: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' }
        }
      }
    ]);

    const stats = orderStats[0] || { orderCount: 0, totalSpent: 0 };

    return {
      ...user.toObject(),
      orderCount: stats.orderCount,
      totalSpent: stats.totalSpent
    };
  }

  // Update user tier manually (Admin only)
  async updateUserTier(userId, tier) {
    const validTiers = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
    if (!validTiers.includes(tier)) {
      throw new Error('Invalid tier');
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { tier },
      { new: true }
    ).select('-password -refreshToken');

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }
}

export default new UserService();
