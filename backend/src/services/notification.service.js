import Notification from '../models/Notification.model.js';
import User from '../models/User.model.js';

class NotificationService {
  // Create notification
  async createNotification(recipientId, notificationData) {
    const notification = await Notification.create({
      recipient: recipientId,
      ...notificationData
    });

    // TODO: Send push notification via web push API
    // this.sendWebPush(recipientId, notification);

    return notification;
  }

  // Notify admin about new order
  async notifyAdminNewOrder(order) {
    const admins = await User.find({ role: 'admin', isActive: true });
    
    const notifications = admins.map(admin => ({
      recipient: admin._id,
      type: 'order_created',
      title: 'Đơn hàng mới',
      message: `Đơn hàng #${order.orderNumber} vừa được tạo`,
      relatedOrder: order._id,
      link: `/admin/orders/${order._id}`,
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        total: order.totalPrice,
        customerName: `${order.shippingAddress.fullName}`
      }
    }));

    await Notification.insertMany(notifications);
  }

  // Notify user about order status update
  async notifyUserOrderStatusUpdate(order, oldStatus, newStatus) {
    const statusMessages = {
      pending: 'đang chờ xác nhận',
      awaiting_payment: 'đang chờ thanh toán',
      confirmed: 'đã được xác nhận',
      processing: 'đang được xử lý',
      shipped: 'đang được giao',
      delivered: 'đã được giao thành công',
      cancelled: 'đã bị hủy'
    };

    await this.createNotification(order.user, {
      type: 'order_status_updated',
      title: 'Cập nhật đơn hàng',
      message: `Đơn hàng #${order.orderNumber} ${statusMessages[newStatus]}`,
      relatedOrder: order._id,
      link: `/orders/${order.orderNumber}`,
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        oldStatus,
        newStatus,
        total: order.totalPrice
      }
    });
  }

  // Notify user about order cancellation
  async notifyUserOrderCancelled(order, reason) {
    await this.createNotification(order.user, {
      type: 'order_cancelled',
      title: 'Đơn hàng đã hủy',
      message: `Đơn hàng #${order.orderNumber} đã bị hủy. ${reason ? `Lý do: ${reason}` : ''}`,
      relatedOrder: order._id,
      link: `/orders/${order.orderNumber}`,
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        reason,
        total: order.totalPrice
      }
    });
  }

  // Notify admin about new review
  async notifyAdminNewReview(review) {
    const admins = await User.find({ role: 'admin', isActive: true });
    
    const product = await review.populate('product', 'name');
    const user = await review.populate('user', 'firstName lastName');

    const notifications = admins.map(admin => ({
      recipient: admin._id,
      type: 'review_added',
      title: 'Đánh giá mới',
      message: `${user.firstName} ${user.lastName} đã đánh giá sản phẩm ${product.name} với ${review.rating} sao`,
      relatedReview: review._id,
      relatedProduct: review.product,
      data: {
        reviewId: review._id,
        productId: review.product,
        rating: review.rating
      }
    }));

    await Notification.insertMany(notifications);
  }

  // Get user notifications
  async getUserNotifications(userId, options = {}) {
    const { page = 1, limit = 20, unreadOnly = false } = options;
    const skip = (page - 1) * limit;

    const query = { recipient: userId };
    if (unreadOnly) {
      query.isRead = false;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query)
        .sort('-createdAt')
        .skip(skip)
        .limit(limit)
        .populate('relatedOrder', '_id orderNumber totalPrice orderStatus')
        .populate('relatedProduct', 'name images'),
      Notification.countDocuments(query),
      Notification.countDocuments({ recipient: userId, isRead: false })
    ]);

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      unreadCount
    };
  }

  // Mark notification as read
  async markAsRead(notificationId, userId) {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      throw new Error('Notification not found');
    }

    return notification;
  }

  // Mark all as read
  async markAllAsRead(userId) {
    await Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    return { message: 'All notifications marked as read' };
  }

  // Delete notification
  async deleteNotification(notificationId, userId) {
    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      recipient: userId
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    return { message: 'Notification deleted' };
  }

  // Delete all read notifications
  async deleteAllRead(userId) {
    await Notification.deleteMany({
      recipient: userId,
      isRead: true
    });

    return { message: 'All read notifications deleted' };
  }

  // Get unread count
  async getUnreadCount(userId) {
    const count = await Notification.countDocuments({
      recipient: userId,
      isRead: false
    });

    return { count };
  }

  // Notify all admins about new review
  async notifyAdminNewReview(review, product, user) {
    const admins = await User.find({ role: 'admin', isActive: true });
    
    const notifications = admins.map(admin => ({
      recipient: admin._id,
      type: 'new_review_admin',
      title: '⭐ Đánh giá mới',
      message: `${user.firstName} ${user.lastName} đã đánh giá ${product.name} (${review.rating}⭐)`,
      relatedProduct: product._id,
      relatedReview: review._id,
      link: `/admin/reviews`,
      data: {
        reviewId: review._id,
        productId: product._id,
        productName: product.name,
        userName: `${user.firstName} ${user.lastName}`,
        rating: review.rating
      }
    }));

    await Notification.insertMany(notifications);
  }
}

export default new NotificationService();
