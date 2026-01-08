import Stripe from 'stripe';

class StripeService {
  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16'
    });
    
    console.log('✅ Stripe Service initialized');
  }

  /**
   * Create Payment Intent
   * @param {Object} orderData - Order information
   * @returns {Promise<Object>} Payment Intent with client secret
   */
  async createPaymentIntent(orderData) {
    try {
      const { orderNumber, amount, orderInfo, customerEmail } = orderData;

      // Create Payment Intent
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount), // VND has no subunit (not like USD cents)
        currency: 'vnd',
        description: orderInfo || `Order ${orderNumber}`,
        metadata: {
          orderNumber: orderNumber,
          integration: 'custom_tshirt_store'
        },
        receipt_email: customerEmail || null,
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never' // For embedded checkout
        }
      });

      console.log('✅ Stripe Payment Intent created:', paymentIntent.id);

      return {
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount
      };
    } catch (error) {
      console.error('❌ Stripe createPaymentIntent error:', error);
      throw error;
    }
  }

  /**
   * Retrieve Payment Intent
   * @param {String} paymentIntentId - Payment Intent ID
   * @returns {Promise<Object>} Payment Intent details
   */
  async retrievePaymentIntent(paymentIntentId) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      console.log('📋 Payment Intent retrieved:', paymentIntent.id);
      return paymentIntent;
    } catch (error) {
      console.error('❌ Retrieve Payment Intent error:', error);
      throw error;
    }
  }

  /**
   * Handle Stripe Webhook
   * @param {Object} rawBody - Raw request body
   * @param {String} signature - Stripe signature header
   * @returns {Object} Verified event
   */
  verifyWebhook(rawBody, signature) {
    try {
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      
      if (!webhookSecret) {
        console.warn('⚠️ STRIPE_WEBHOOK_SECRET not configured, skipping verification');
        return JSON.parse(rawBody);
      }

      const event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret
      );

      console.log('✅ Stripe webhook verified:', event.type);
      return event;
    } catch (error) {
      console.error('❌ Webhook verification failed:', error);
      throw error;
    }
  }

  /**
   * Create Checkout Session (alternative method - redirects to Stripe hosted page)
   * @param {Object} orderData - Order information
   * @returns {Promise<Object>} Checkout session URL
   */
  async createCheckoutSession(orderData) {
    try {
      const { orderNumber, amount, orderInfo, customerEmail, items } = orderData;

      const lineItems = items?.map(item => ({
        price_data: {
          currency: 'vnd',
          product_data: {
            name: item.productName || 'Product',
            description: `Size: ${item.size || 'N/A'}, Color: ${item.color || 'N/A'}`,
            images: item.image ? [item.image] : []
          },
          unit_amount: Math.round(item.price) // VND has no subunit
        },
        quantity: item.quantity || 1
      })) || [{
        price_data: {
          currency: 'vnd',
          product_data: {
            name: orderInfo || `Order ${orderNumber}`
          },
          unit_amount: Math.round(amount) // VND has no subunit
        },
        quantity: 1
      }];

      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL}/order-success/${orderNumber}?payment=stripe_success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/checkout?payment=cancelled`,
        customer_email: customerEmail,
        metadata: {
          orderNumber: orderNumber
        }
      });

      console.log('✅ Stripe Checkout Session created:', session.id);

      return {
        success: true,
        sessionId: session.id,
        checkoutUrl: session.url
      };
    } catch (error) {
      console.error('❌ Create Checkout Session error:', error);
      throw error;
    }
  }
}

const stripeServiceInstance = new StripeService();
export default stripeServiceInstance;
