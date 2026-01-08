import stripeService from '../services/stripe.service.js';
import Order from '../models/Order.model.js';
import mailService from '../services/mail.service.js';

/**
 * Create Stripe Checkout Session (Redirects to Stripe hosted page)
 */
export const createCheckoutSession = async (req, res) => {
  try {
    const { orderNumber } = req.body;

    if (!orderNumber) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: orderNumber'
      });
    }

    // Find order WITHOUT populate to avoid circular reference
    const order = await Order.findOne({ orderNumber });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Prepare order data for Stripe (use plain item data)
    const orderData = {
      orderNumber: order.orderNumber,
      amount: order.totalAmount,
      orderInfo: `Thanh toan don hang ${order.orderNumber}`,
      customerEmail: order.user?.email || order.shippingAddress?.email,
      items: order.items.map(item => ({
        productName: item.productName,
        price: item.price,
        quantity: item.quantity,
        size: item.size || 'N/A',
        color: item.color || 'N/A',
        image: item.image || null // Use image from order item directly
      }))
    };

    // Create Stripe checkout session
    const session = await stripeService.createCheckoutSession(orderData);

    // Save Stripe session ID to order
    order.paymentDetails = {
      ...order.paymentDetails,
      stripeSessionId: session.sessionId
    };
    await order.save();

    console.log(`💳 Created Stripe checkout session for order: ${orderNumber}`);

    res.json({
      success: true,
      message: 'Checkout session created successfully',
      data: {
        sessionId: session.sessionId,
        checkoutUrl: session.checkoutUrl
      }
    });
  } catch (error) {
    console.error('❌ Create Stripe checkout error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create checkout session'
    });
  }
};

/**
 * Handle Stripe Webhook
 */
export const handleWebhook = async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'];
    
    console.log('📨 Stripe Webhook received');

    // Verify webhook signature
    let event;
    try {
      event = stripeService.verifyWebhook(req.body, signature);
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log('✅ Checkout session completed:', session.id);

        // Find order by session ID
        const order = await Order.findOne({
          'paymentDetails.stripeSessionId': session.id
        }).populate('user', 'email name');

        if (order) {
          order.paymentStatus = 'paid';
          order.orderStatus = 'confirmed';  // Changed from 'processing' to 'confirmed'
          order.paymentDetails = {
            ...order.paymentDetails,
            stripePaymentIntentId: session.payment_intent,
            paidAt: new Date(),
            paymentMethod: 'stripe'
          };

          await order.save();

          console.log(`✅ Order ${order.orderNumber} marked as PAID (status: confirmed)`);

          // Send payment success email via queue
          try {
            const queueManager = (await import('../config/queue.js')).default;
            await queueManager.addEmailJob('send-payment-success-email', {
              email: order.user?.email || order.shippingAddress.email,
              orderData: {
                orderNumber: order.orderNumber,
                totalAmount: order.totalAmount,
                items: order.items,
                shippingAddress: order.shippingAddress,
                paymentMethod: order.paymentMethod
              }
            }).catch(() => {
              // Fallback to direct send if queue fails
              return mailService.sendPaymentSuccessEmail(
                order.user?.email || order.shippingAddress.email,
                {
                  orderNumber: order.orderNumber,
                  totalAmount: order.totalAmount,
                  items: order.items,
                  shippingAddress: order.shippingAddress,
                  paymentMethod: order.paymentMethod
                }
              );
            });
            console.log(`📧 Payment success email queued for: ${order.orderNumber}`);
          } catch (emailError) {
            console.error('❌ Failed to send confirmation email:', emailError);
          }
        }
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        console.log('💰 Payment succeeded:', paymentIntent.id);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        console.log('❌ Payment failed:', paymentIntent.id);
        
        // Update order status to failed
        const order = await Order.findOne({
          'paymentDetails.stripePaymentIntentId': paymentIntent.id
        });
        
        if (order) {
          order.paymentStatus = 'failed';
          order.paymentDetails = {
            ...order.paymentDetails,
            failureReason: paymentIntent.last_payment_error?.message || 'Payment failed'
          };
          await order.save();
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('❌ Stripe webhook error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Webhook processing failed'
    });
  }
};

/**
 * Check payment status
 */
export const checkPaymentStatus = async (req, res) => {
  try {
    const { orderNumber } = req.params;

    const order = await Order.findOne({ orderNumber });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: {
        orderNumber: order.orderNumber,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        paymentDetails: order.paymentDetails
      }
    });
  } catch (error) {
    console.error('❌ Check payment status error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to check payment status'
    });
  }
};
