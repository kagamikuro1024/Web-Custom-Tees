import mailService from '../services/mail.service.js';
import logger from '../config/logger.js';

/**
 * Email queue processor
 * Handles all email sending jobs
 */
export default async function emailProcessor(job) {
  const { name, data } = job;

  logger.info(`Processing email job: ${name}`, { jobId: job.id });

  try {
    switch (name) {
      case 'send-payment-success-email':
        await mailService.sendPaymentSuccessEmail(data.email, data.orderData);
        break;

      case 'send-order-confirmation-email':
        await mailService.sendOrderConfirmationEmail(data.email, data.orderData);
        break;

      case 'send-order-cancelled-email':
        await mailService.sendOrderCancelledEmail(data.email, data.orderData);
        break;

      case 'send-order-status-email':
        await mailService.sendOrderStatusUpdateEmail(data.email, data.orderData);
        break;

      default:
        logger.warn(`Unknown email job type: ${name}`);
        break;
    }

    return { success: true, jobId: job.id };
  } catch (error) {
    logger.error(`Email job failed: ${name}`, error);
    throw error; // Let BullMQ handle retry
  }
}
