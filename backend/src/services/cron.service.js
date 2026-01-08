import cron from 'node-cron';
import Order from '../models/Order.model.js';
import logger from '../config/logger.js';

class CronJobs {
  /**
   * Khởi tạo tất cả các cron jobs
   */
  static initialize() {
    // Chạy mỗi 15 phút để kiểm tra đơn hàng quá hạn
    cron.schedule('*/15 * * * *', async () => {
      await this.cancelExpiredOrders();
    });

    logger.info('✅ Cron jobs initialized');
  }

  /**
   * Hủy các đơn hàng awaiting_payment quá 1 giờ chưa thanh toán
   */
  static async cancelExpiredOrders() {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

      const result = await Order.updateMany(
        {
          orderStatus: 'awaiting_payment',
          paymentStatus: 'pending',
          createdAt: { $lt: oneHourAgo }
        },
        {
          $set: {
            orderStatus: 'cancelled',
            updatedAt: new Date()
          },
          $push: {
            statusHistory: {
              status: 'cancelled',
              timestamp: new Date(),
              note: 'Auto-cancelled: Payment timeout (1 hour)'
            }
          }
        }
      );

      if (result.modifiedCount > 0) {
        logger.info(`🗑️ Auto-cancelled ${result.modifiedCount} expired order(s)`);
      }
    } catch (error) {
      logger.error('Error in cancelExpiredOrders cron:', error);
    }
  }

  /**
   * Tự động chuyển đơn hàng shipped quá 7 ngày thành delivered
   * (Nếu user không xác nhận)
   */
  static async autoConfirmDelivery() {
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const result = await Order.updateMany(
        {
          orderStatus: 'shipped',
          createdAt: { $lt: sevenDaysAgo }
        },
        {
          $set: {
            orderStatus: 'delivered',
            actualDelivery: new Date(),
            updatedAt: new Date()
          },
          $push: {
            statusHistory: {
              status: 'delivered',
              timestamp: new Date(),
              note: 'Auto-confirmed: 7 days after shipping'
            }
          }
        }
      );

      if (result.modifiedCount > 0) {
        logger.info(`📦 Auto-confirmed delivery for ${result.modifiedCount} order(s)`);
      }
    } catch (error) {
      logger.error('Error in autoConfirmDelivery cron:', error);
    }
  }
}

export default CronJobs;
