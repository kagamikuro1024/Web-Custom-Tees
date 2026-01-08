import stripeService from '../services/stripe.service.js';
import Order from '../models/Order.model.js';
import mailService from '../services/mail.service.js';

/**
 * Verify and complete Stripe payment
 */
export const verifyPayment = async (req, res) => {
  try {
    const { sessionId, orderNumber } = req.query;

    if (!sessionId || !orderNumber) {
      return res.status(400).json({
        success: false,
        message: 'Missing sessionId or orderNumber'
      });
    }

    // Retrieve session from Stripe
    const session = await stripeService.stripe.checkout.sessions.retrieve(sessionId);

    console.log('🔍 Stripe session status:', session.payment_status);

    if (session.payment_status === 'paid') {
      // Find and update order
      const order = await Order.findOne({ orderNumber }).populate('user', 'email name');

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      // Update order if not already paid
      if (order.paymentStatus !== 'paid') {
        order.paymentStatus = 'paid';
        order.orderStatus = 'processing';
        order.paymentDetails = {
          ...order.paymentDetails,
          stripeSessionId: sessionId,
          stripePaymentIntentId: session.payment_intent,
          paidAt: new Date(),
          paymentMethod: 'stripe'
        };

        await order.save();

        console.log(`✅ Order ${orderNumber} marked as PAID`);

        // Send confirmation email
        try {
          await mailService.sendOrderSuccessEmail(
            order.user?.email || order.shippingAddress.email,
            {
              orderNumber: order.orderNumber,
              totalAmount: order.totalAmount,
              items: order.items,
              shippingAddress: order.shippingAddress
            }
          );
          console.log(`📧 Order confirmation email sent for: ${order.orderNumber}`);
        } catch (emailError) {
          console.error('❌ Failed to send confirmation email:', emailError);
        }
      }

      return res.json({
        success: true,
        message: 'Payment verified successfully',
        data: {
          orderNumber: order.orderNumber,
          paymentStatus: order.paymentStatus,
          orderStatus: order.orderStatus
        }
      });
    } else {
      return res.json({
        success: false,
        message: 'Payment not completed',
        paymentStatus: session.payment_status
      });
    }
  } catch (error) {
    console.error('❌ Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to verify payment'
    });
  }
};
