import express from 'express';
import notificationController from '../controllers/notification.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get('/notifications', notificationController.getUserNotifications);
router.get('/notifications/unread-count', notificationController.getUnreadCount);
router.put('/notifications/:notificationId/read', notificationController.markAsRead);
router.put('/notifications/mark-all-read', notificationController.markAllAsRead);
router.delete('/notifications/:notificationId', notificationController.deleteNotification);
router.delete('/notifications/read/all', notificationController.deleteAllRead);

export default router;
