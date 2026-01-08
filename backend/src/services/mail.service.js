import { Resend } from 'resend';

class MailService {
  constructor() {
    // Use Resend for production (Railway blocks SMTP)
    console.log('🔍 Checking env vars:', {
      hasResendKey: !!process.env.RESEND_API_KEY,
      keyPrefix: process.env.RESEND_API_KEY?.substring(0, 10),
      allEnvKeys: Object.keys(process.env).filter(k => k.includes('RESEND'))
    });
    // TEMPORARY: Hardcode for testing
    const apiKey = process.env.RESEND_API_KEY || 're_c79WvVFS_DXjL8JUEXekja6ZNPHVuju7i';
    if (!apiKey) {
      console.warn('⚠️ RESEND_API_KEY not found in environment variables');
      this.resend = null;
      this.initialized = false;
      return;
    }
    this.resend = new Resend(apiKey);
    this.fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    this.initialized = true;
    console.log('📧 Mail service initialized with Resend');
  }

  /**
   * Gửi email xác nhận đơn hàng thành công (CHO COD - Đặt hàng thành công)
   * @param {string} email - Email người nhận
   * @param {Object} orderData - Thông tin đơn hàng
   */
  async sendOrderConfirmationEmail(email, orderData) {
    try {
      if (!this.resend) {
        console.log('⚠️ Email service not initialized, skipping email send');
        return { success: false, message: 'Email service not initialized' };
      }
      
      const { orderNumber, totalAmount, items, shippingAddress } = orderData;

      // Tạo HTML email content
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              border: 1px solid #ddd;
              border-radius: 10px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              padding: 20px;
            }
            .order-info {
              background: #f8f9fa;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
            }
            .item {
              border-bottom: 1px solid #eee;
              padding: 10px 0;
            }
            .total {
              font-size: 20px;
              font-weight: bold;
              color: #667eea;
              text-align: right;
              margin-top: 20px;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📦 Đặt hàng thành công!</h1>
            </div>
            <div class="content">
              <p>Xin chào <strong>${shippingAddress?.fullName || 'Quý khách'}</strong>,</p>
              <p>Cảm ơn bạn đã đặt hàng tại <strong>Custom T-Shirt Shop</strong>!</p>
              <p>Chúng tôi đã nhận được đơn hàng của bạn và sẽ xử lý trong thời gian sớm nhất.</p>
              
              <div class="order-info">
                <h3>📦 Thông tin đơn hàng</h3>
                <p><strong>Mã đơn hàng:</strong> #${orderNumber}</p>
                <p><strong>Ngày đặt:</strong> ${new Date().toLocaleDateString('vi-VN')}</p>
                <p><strong>Phương thức thanh toán:</strong> Thanh toán khi nhận hàng (COD)</p>
                <p><strong>Địa chỉ giao hàng:</strong></p>
                <p>${shippingAddress?.addressLine1 || ''}</p>
                ${shippingAddress?.addressLine2 ? `<p>${shippingAddress.addressLine2}</p>` : ''}
                <p>${shippingAddress?.city || ''}, ${shippingAddress?.state || ''} ${shippingAddress?.postalCode || ''}</p>
                <p>${shippingAddress?.country || ''}</p>
                <p><strong>Số điện thoại:</strong> ${shippingAddress?.phone || ''}</p>
              </div>

              <h3>🛍️ Chi tiết đơn hàng</h3>
              ${items?.map(item => `
                <div class="item">
                  <strong>${item.productName || 'Sản phẩm'}</strong><br/>
                  Size: ${item.selectedSize || 'N/A'} | Số lượng: ${item.quantity}<br/>
                  Giá: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                </div>
              `).join('') || '<p>Không có thông tin sản phẩm</p>'}

              <div class="total">
                Tổng cộng: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount)}
              </div>

              <p style="margin-top: 30px;">Đơn hàng của bạn sẽ được giao trong vòng 3-5 ngày làm việc.</p>
              <p>Mọi thắc mắc vui lòng liên hệ: <strong>support@customtshirt.com</strong></p>
            </div>
            <div class="footer">
              <p>Cảm ơn bạn đã mua hàng! 💜</p>
              <p>Custom T-Shirt Shop</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: `📦 Xác nhận đơn hàng #${orderNumber} - Đặt hàng thành công`,
        html: htmlContent,
      });

      if (error) {
        console.error('❌ Resend error:', error);
        throw error;
      }

      console.log('📧 Order confirmation email sent to:', email);
      console.log('📧 Message ID:', data.id);

      return {
        success: true,
        messageId: data.id,
        recipient: email
      };
    } catch (error) {
      console.error('❌ Failed to send order confirmation email:', error);
      throw new Error('Failed to send order confirmation email');
    }
  }

  /**
   * Gửi email thanh toán thành công (CHO ONLINE PAYMENT - Thanh toán thành công)
   * @param {string} email - Email người nhận
   * @param {Object} orderData - Thông tin đơn hàng
   */
  async sendPaymentSuccessEmail(email, orderData) {
    try {
      if (!this.resend) {
        console.log('⚠️ Email service not initialized, skipping email send');
        return { success: false, message: 'Email service not initialized' };
      }
      
      const { orderNumber, totalAmount, items, shippingAddress, paymentMethod } = orderData;

      // Tạo HTML email content
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              border: 1px solid #ddd;
              border-radius: 10px;
            }
            .header {
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              padding: 20px;
            }
            .order-info {
              background: #f0fdf4;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
              border-left: 4px solid #10b981;
            }
            .item {
              border-bottom: 1px solid #eee;
              padding: 10px 0;
            }
            .total {
              font-size: 20px;
              font-weight: bold;
              color: #10b981;
              text-align: right;
              margin-top: 20px;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              color: #666;
            }
            .success-badge {
              background: #10b981;
              color: white;
              padding: 5px 15px;
              border-radius: 20px;
              display: inline-block;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Thanh toán thành công!</h1>
              <p style="margin: 10px 0;"><span class="success-badge">ĐÃ THANH TOÁN</span></p>
            </div>
            <div class="content">
              <p>Xin chào <strong>${shippingAddress?.fullName || 'Quý khách'}</strong>,</p>
              <p>Cảm ơn bạn đã thanh toán thành công đơn hàng tại <strong>Custom T-Shirt Shop</strong>!</p>
              <p>Chúng tôi đã nhận được thanh toán và đơn hàng của bạn đang được xử lý.</p>
              
              <div class="order-info">
                <h3>💳 Thông tin thanh toán</h3>
                <p><strong>Mã đơn hàng:</strong> #${orderNumber}</p>
                <p><strong>Ngày thanh toán:</strong> ${new Date().toLocaleDateString('vi-VN')}</p>
                <p><strong>Phương thức thanh toán:</strong> ${paymentMethod === 'vnpay' ? 'VNPAY' : paymentMethod === 'stripe' ? 'Stripe' : 'Online Payment'}</p>
                <p><strong>Trạng thái:</strong> <span style="color: #10b981; font-weight: bold;">Đã thanh toán thành công</span></p>
              </div>

              <div class="order-info">
                <h3>📦 Thông tin đơn hàng</h3>
                <p><strong>Địa chỉ giao hàng:</strong></p>
                <p>${shippingAddress?.addressLine1 || ''}</p>
                ${shippingAddress?.addressLine2 ? `<p>${shippingAddress.addressLine2}</p>` : ''}
                <p>${shippingAddress?.city || ''}, ${shippingAddress?.state || ''} ${shippingAddress?.postalCode || ''}</p>
                <p>${shippingAddress?.country || ''}</p>
                <p><strong>Số điện thoại:</strong> ${shippingAddress?.phone || ''}</p>
              </div>

              <h3>🛍️ Chi tiết đơn hàng</h3>
              ${items?.map(item => `
                <div class="item">
                  <strong>${item.productName || 'Sản phẩm'}</strong><br/>
                  Size: ${item.selectedSize || 'N/A'} | Số lượng: ${item.quantity}<br/>
                  Giá: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                </div>
              `).join('') || '<p>Không có thông tin sản phẩm</p>'}

              <div class="total">
                Tổng thanh toán: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount)}
              </div>

              <p style="margin-top: 30px; background: #fef3c7; padding: 15px; border-radius: 5px;">
                <strong>📝 Lưu ý:</strong> Nếu đơn hàng có thiết kế custom, bạn vẫn có thể cập nhật hình ảnh cho đến khi đơn hàng chuyển sang trạng thái "Đang xử lý".
              </p>

              <p>Đơn hàng của bạn sẽ được giao trong vòng 3-5 ngày làm việc.</p>
              <p>Mọi thắc mắc vui lòng liên hệ: <strong>support@customtshirt.com</strong></p>
            </div>
            <div class="footer">
              <p>Cảm ơn bạn đã tin tưởng và mua hàng! 💜</p>
              <p>Custom T-Shirt Shop</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: `✅ Thanh toán thành công #${orderNumber} - Custom T-Shirt Shop`,
        html: htmlContent,
      });

      if (error) {
        console.error('❌ Resend error:', error);
        throw error;
      }

      console.log('📧 Payment success email sent to:', email);
      console.log('📧 Message ID:', data.id);

      return {
        success: true,
        messageId: data.id,
        recipient: email
      };
    } catch (error) {
      console.error('❌ Failed to send payment success email:', error);
      throw new Error('Failed to send payment success email');
    }
  }

  /**
   * DEPRECATED: Kept for backward compatibility, use sendOrderConfirmationEmail or sendPaymentSuccessEmail instead
   * Gửi email xác nhận đơn hàng thành công
   * @param {string} email - Email người nhận
   * @param {Object} orderData - Thông tin đơn hàng
   */
  async sendOrderSuccessEmail(email, orderData) {
    // Redirect to the appropriate method based on payment method
    if (orderData.paymentMethod === 'cod') {
      return this.sendOrderConfirmationEmail(email, orderData);
    } else {
      return this.sendPaymentSuccessEmail(email, orderData);
    }
  }

  /**
   * Gửi email thông báo cập nhật trạng thái đơn hàng
   */
  async sendOrderStatusUpdateEmail(email, orderData) {
    try {
      if (!this.resend) {
        console.log('⚠️ Email service not initialized, skipping email send');
        return { success: false, message: 'Email service not initialized' };
      }

      const { orderNumber, orderStatus, trackingNumber, shippingCarrier } = orderData;

      let statusText = '';
      let statusColor = '#667eea';

      switch (orderStatus) {
        case 'processing':
          statusText = 'Đang xử lý';
          statusColor = '#f59e0b';
          break;
        case 'shipped':
          statusText = 'Đã gửi hàng';
          statusColor = '#3b82f6';
          break;
        case 'delivered':
          statusText = 'Đã giao hàng';
          statusColor = '#10b981';
          break;
        default:
          statusText = orderStatus;
      }

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; }
            .header { background: ${statusColor}; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { padding: 20px; }
            .status-badge { background: ${statusColor}; color: white; padding: 8px 20px; border-radius: 20px; display: inline-block; font-weight: bold; }
            .tracking-info { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📦 Cập nhật trạng thái đơn hàng</h1>
            </div>
            <div class="content">
              <p>Đơn hàng <strong>#${orderNumber}</strong> của bạn đã được cập nhật:</p>
              <div style="text-align: center; margin: 20px 0;">
                <span class="status-badge">${statusText.toUpperCase()}</span>
              </div>
              ${trackingNumber ? `
                <div class="tracking-info">
                  <h3>🚚 Thông tin vận chuyển</h3>
                  <p><strong>Mã vận đơn:</strong> ${trackingNumber}</p>
                  ${shippingCarrier ? `<p><strong>Đơn vị vận chuyển:</strong> ${shippingCarrier}</p>` : ''}
                </div>
              ` : ''}
              <p>Cảm ơn bạn đã mua hàng tại Custom T-Shirt Shop!</p>
            </div>
            <div class="footer">
              <p>Custom T-Shirt Shop</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: `📦 Cập nhật đơn hàng #${orderNumber} - ${statusText}`,
        html: htmlContent,
      });

      if (error) throw error;

      console.log('📧 Order status update email sent to:', email);
      return { success: true, messageId: data.id };
    } catch (error) {
      console.error('❌ Failed to send order status email:', error);
      throw new Error('Failed to send order status update email');
    }
  }

  /**
   * Gửi email thông báo đơn hàng bị hủy
   */
  async sendOrderCancelledEmail(email, orderData) {
    try {
      if (!this.transporter) {
        await this.initializeTransporter();
      }

      const { orderNumber } = orderData;

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; }
            .header { background: #dc3545; color: white; padding: 20px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>❌ Đơn hàng đã bị hủy</h1>
            </div>
            <div style="padding: 20px;">
              <p>Đơn hàng <strong>#${orderNumber}</strong> của bạn đã bị hủy do thanh toán không thành công.</p>
              <p>Vui lòng thử lại hoặc liên hệ hỗ trợ nếu cần giúp đỡ.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const mailOptions = {
        from: '"Custom T-Shirt Shop" <noreply@customtshirt.com>',
        to: email,
        subject: `❌ Đơn hàng #${orderNumber} đã bị hủy`,
        html: htmlContent,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('📧 Cancellation email sent:', info.messageId);

      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Failed to send cancellation email:', error);
      throw new Error('Failed to send cancellation email');
    }
  }

  /**
   * Gửi email xác thực tài khoản
   * @param {string} email - Email người nhận
   * @param {string} firstName - Tên người dùng
   * @param {string} verificationToken - Token xác thực
   */
  async sendVerificationEmail(email, firstName, verificationToken) {
    try {
      if (!this.resend) {
        console.log('⚠️ Email service not initialized, skipping email send');
        return { success: false, message: 'Email service not initialized' };
      }
      
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              border: 1px solid #ddd;
              border-radius: 10px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px 20px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              padding: 30px 20px;
              background: white;
            }
            .button {
              display: inline-block;
              padding: 15px 40px;
              background: #667eea;
              color: white !important;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
              font-weight: bold;
            }
            .footer {
              text-align: center;
              padding: 20px;
              color: #666;
              font-size: 12px;
            }
            .warning {
              background: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Chào mừng đến với Custom T-Shirt Store!</h1>
            </div>
            
            <div class="content">
              <h2>Xin chào ${firstName},</h2>
              <p>Cảm ơn bạn đã đăng ký tài khoản tại Custom T-Shirt Store! 🎨👕</p>
              
              <p>Để hoàn tất đăng ký và bắt đầu thiết kế áo thun độc đáo của riêng bạn, vui lòng xác thực địa chỉ email bằng cách click vào nút bên dưới:</p>
              
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">✉️ Xác thực Email</a>
              </div>
              
              <div class="warning">
                <strong>⚠️ Lưu ý:</strong> Link xác thực này chỉ có hiệu lực trong vòng <strong>24 giờ</strong>. Nếu link hết hạn, bạn có thể yêu cầu gửi lại email xác thực.
              </div>
              
              <p>Hoặc copy link sau vào trình duyệt:</p>
              <p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 5px;">
                <a href="${verificationUrl}">${verificationUrl}</a>
              </p>
              
              <p><strong>Sau khi xác thực, bạn sẽ có thể:</strong></p>
              <ul>
                <li>✅ Đăng nhập vào tài khoản</li>
                <li>🎨 Thiết kế áo thun độc đáo</li>
                <li>🛒 Đặt hàng và thanh toán</li>
                <li>📦 Theo dõi đơn hàng</li>
              </ul>
              
              <p>Nếu bạn không tạo tài khoản này, vui lòng bỏ qua email này.</p>
              
              <p>Trân trọng,<br><strong>Custom T-Shirt Store Team</strong></p>
            </div>
            
            <div class="footer">
              <p>© 2026 Custom T-Shirt Store. All rights reserved.</p>
              <p>Email này được gửi tự động, vui lòng không trả lời.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: '✉️ Xác thực email - Custom T-Shirt Store',
        html: htmlContent,
      });

      if (error) throw error;

      console.log('📧 Verification email sent to:', email);

      return { success: true, messageId: data.id };
    } catch (error) {
      console.error('❌ Failed to send verification email:', error);
      throw new Error('Failed to send verification email');
    }
  }
}

export default new MailService();
