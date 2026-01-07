import notificationService from '../services/notification.service.js';

class NotificationController {
  // Get user notifications
  async getUserNotifications(req, res, next) {
    try {
      const { page, limit, unreadOnly } = req.query;
      const result = await notificationService.getUserNotifications(req.user.id, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        unreadOnly: unreadOnly === 'true'
      });

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Get unread count
  async getUnreadCount(req, res, next) {
    try {
      const result = await notificationService.getUnreadCount(req.user.id);
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Mark as read
  async markAsRead(req, res, next) {
    try {
      const notification = await notificationService.markAsRead(
        req.params.notificationId,
        req.user.id
      );

      res.json({
        success: true,
        message: 'Notification marked as read',
        data: notification
      });
    } catch (error) {
      next(error);
    }
  }

  // Mark all as read
  async markAllAsRead(req, res, next) {
    try {
      const result = await notificationService.markAllAsRead(req.user.id);
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete notification
  async deleteNotification(req, res, next) {
    try {
      const result = await notificationService.deleteNotification(
        req.params.notificationId,
        req.user.id
      );

      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete all read
  async deleteAllRead(req, res, next) {
    try {
      const result = await notificationService.deleteAllRead(req.user.id);
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new NotificationController();
