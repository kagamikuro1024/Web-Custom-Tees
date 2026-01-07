import paymentService from '../services/payment.service.js';
import orderService from '../services/order.service.js';
import mailService from '../services/mail.service.js';
import Order from '../models/Order.model.js';
import Product from '../models/Product.model.js';

class PaymentController {
  /**
   * Tạo URL thanh toán VNPAY
   * POST /api/payment/create-payment-url
   * Body: { orderId, amount, orderInfo, bankCode }
   */
  async createPaymentUrl(req, res, next) {
    try {
      const { orderId, amount, orderInfo, bankCode } = req.body;

      if (!orderId || !amount) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: orderId, amount'
        });
      }

      // Lấy IP address của client
      let ipAddr = req.headers['x-forwarded-for'] || 
                   req.connection.remoteAddress || 
                   req.socket.remoteAddress ||
                   req.ip ||
                   '127.0.0.1';

      // Convert IPv6 localhost (::1) sang IPv4 (127.0.0.1)
      if (ipAddr === '::1' || ipAddr === '::ffff:127.0.0.1') {
        ipAddr = '127.0.0.1';
      }

      // Tạo payment URL
      const paymentUrl = paymentService.createPaymentUrl({
        amount: Number(amount),
        orderId: orderId,
        orderInfo: orderInfo || `Thanh toan don hang ${orderId}`,
        ipAddr: ipAddr,
        bankCode: bankCode
      });

      res.json({
        success: true,
        data: {
          paymentUrl
        }
      });
    } catch (error) {
      console.error('Error creating payment URL:', error);
      next(error);
    }
  }

  /**
   * Xử lý return URL từ VNPAY (User redirect về sau khi thanh toán)
   * GET /api/payment/vnpay-return
   * QUAN TRỌNG: Vì localhost không nhận được IPN, endpoint này sẽ kiêm cả việc cập nhật trạng thái
   */
  async vnpayReturn(req, res, next) {
    try {
      const vnpParams = req.query;

      // Verify signature
      const isValid = paymentService.verifyReturnUrl({ ...vnpParams });

      if (!isValid) {
        return res.json({
          success: false,
          message: 'Invalid signature'
        });
      }

      const orderId = vnpParams['vnp_TxnRef'];
      const responseCode = vnpParams['vnp_ResponseCode'];

      // Nếu thanh toán thành công, cập nhật đơn hàng (cho localhost)
      if (responseCode === '00') {
        try {
          const order = await Order.findOne({ orderNumber: orderId })
            .populate('user', 'email firstName lastName')
            .populate('items.product');

          if (order && order.paymentStatus !== 'paid') {
            // Cập nhật trạng thái đơn hàng
            order.paymentStatus = 'paid';
            order.orderStatus = 'confirmed';
            order.paidAt = new Date();
            
            // Lưu thông tin giao dịch VNPAY
            order.vnpayTransaction = {
              transactionNo: vnpParams['vnp_TransactionNo'],
              bankCode: vnpParams['vnp_BankCode'],
              cardType: vnpParams['vnp_CardType'],
              payDate: vnpParams['vnp_PayDate']
            };

            await order.save();
            console.log('✅ Order updated successfully:', orderId);

            // Trừ tồn kho
            for (const item of order.items) {
              const product = await Product.findById(item.product._id || item.product);
              if (product) {
                const sizeItem = product.sizes.find(s => s.name === item.size);
                if (sizeItem && sizeItem.stock >= item.quantity) {
                  sizeItem.stock -= item.quantity;
                  await product.save();
                  console.log(`Stock updated for ${product.name} - Size ${item.size}`);
                }
              }
            }

            // Gửi email xác nhận
            try {
              await mailService.sendOrderSuccessEmail(order.user.email, {
                orderNumber: order.orderNumber,
                totalAmount: order.totalAmount,
                items: order.items,
                shippingAddress: order.shippingAddress,
                paymentMethod: order.paymentMethod
              });
              console.log('📧 Confirmation email sent to:', order.user.email);
            } catch (emailError) {
              console.error('Email error:', emailError);
            }
          }
        } catch (updateError) {
          console.error('Error updating order:', updateError);
        }
      }

      // Trả về JSON thay vì redirect (để frontend xử lý)
      res.json({
        success: responseCode === '00',
        orderId: orderId,
        responseCode: responseCode,
        message: responseCode === '00' ? 'Payment successful' : 'Payment failed'
      });
    } catch (error) {
      console.error('Error handling return URL:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  /**
   * Xử lý IPN từ VNPAY (Server-to-server notification)
   * GET /api/payment/vnpay-ipn
   * QUAN TRỌNG: Đây là endpoint VNPAY gọi đến để xác nhận thanh toán
   */
  async vnpayIPN(req, res, next) {
    try {
      const vnpParams = req.query;

      // Xử lý IPN
      const ipnResult = paymentService.handleIPN(vnpParams);

      // Nếu signature không hợp lệ
      if (!ipnResult.isValid) {
        return res.status(200).json({
          RspCode: '97',
          Message: 'Invalid signature'
        });
      }

      const { orderId, responseCode, amount } = ipnResult;

      // Tìm đơn hàng
      const order = await Order.findOne({ orderNumber: orderId })
        .populate('user', 'email firstName lastName')
        .populate('items.product');

      if (!order) {
        console.error('Order not found:', orderId);
        return res.status(200).json({
          RspCode: '01',
          Message: 'Order not found'
        });
      }

      // Kiểm tra đơn hàng đã được xử lý chưa (tránh xử lý trùng)
      if (order.paymentStatus === 'paid') {
        console.log('Order already processed:', orderId);
        return res.status(200).json({
          RspCode: '00',
          Message: 'Order already confirmed'
        });
      }

      // Kiểm tra response code
      if (responseCode === '00') {
        // ✅ THANH TOÁN THÀNH CÔNG
        console.log('✅ Payment successful for order:', orderId);

        // 1. Cập nhật trạng thái đơn hàng
        order.paymentStatus = 'paid';
        order.orderStatus = 'confirmed';
        order.paymentMethod = 'vnpay';
        order.paidAt = new Date();
        
        // Lưu thông tin giao dịch
        order.vnpayTransaction = {
          transactionNo: ipnResult.transactionNo,
          bankCode: ipnResult.bankCode,
          cardType: ipnResult.cardType,
          payDate: ipnResult.payDate
        };

        await order.save();

        // 2. Trừ tồn kho sản phẩm
        try {
          for (const item of order.items) {
            const product = await Product.findById(item.product._id || item.product);
            if (product) {
              // Tìm size tương ứng
              const sizeItem = product.sizes.find(s => s.name === item.size);
              if (sizeItem) {
                sizeItem.stock -= item.quantity;
              }
              
              // Cập nhật sold
              product.sold += item.quantity;
              
              // Tính lại totalStock
              product.totalStock = product.sizes.reduce((sum, s) => sum + s.stock, 0);
              
              await product.save();
              console.log(`📦 Updated stock for product ${product.name}, size ${item.size}`);
            }
          }
        } catch (stockError) {
          console.error('Error updating stock:', stockError);
          // Không throw error để không ảnh hưởng đến flow thanh toán
        }

        // 3. Gửi email xác nhận
        try {
          if (order.user && order.user.email) {
            await mailService.sendOrderSuccessEmail(order.user.email, {
              orderNumber: order.orderNumber,
              totalAmount: order.totalAmount,
              items: order.items,
              shippingAddress: order.shippingAddress
            });
            console.log('📧 Sent confirmation email to:', order.user.email);
          }
        } catch (emailError) {
          console.error('Error sending email:', emailError);
          // Không throw error để không ảnh hưởng đến flow thanh toán
        }

        // Trả về success cho VNPAY
        return res.status(200).json({
          RspCode: '00',
          Message: 'Success'
        });

      } else {
        // ❌ THANH TOÁN THẤT BẠI
        console.log('❌ Payment failed for order:', orderId, 'Response code:', responseCode);

        // Cập nhật trạng thái failed
        order.paymentStatus = 'failed';
        order.orderStatus = 'cancelled';
        await order.save();

        // Gửi email thông báo hủy
        try {
          if (order.user && order.user.email) {
            await mailService.sendOrderCancelledEmail(order.user.email, {
              orderNumber: order.orderNumber
            });
          }
        } catch (emailError) {
          console.error('Error sending cancellation email:', emailError);
        }

        return res.status(200).json({
          RspCode: '00',
          Message: 'Success' // Vẫn trả success cho VNPAY để họ biết đã nhận được
        });
      }

    } catch (error) {
      console.error('❌ Error handling IPN:', error);
      return res.status(200).json({
        RspCode: '99',
        Message: 'Unknown error'
      });
    }
  }

  /**
   * Query transaction status từ VNPAY (Optional)
   * POST /api/payment/query-transaction
   */
  async queryTransaction(req, res, next) {
    try {
      const { orderId } = req.body;

      const order = await Order.findOne({ orderNumber: orderId });
      
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      res.json({
        success: true,
        data: {
          orderId: order.orderNumber,
          paymentStatus: order.paymentStatus,
          orderStatus: order.orderStatus,
          paidAt: order.paidAt,
          vnpayTransaction: order.vnpayTransaction
        }
      });
    } catch (error) {
      console.error('Error querying transaction:', error);
      next(error);
    }
  }
}

export default new PaymentController();
