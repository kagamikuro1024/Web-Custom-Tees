import nodemailer from 'nodemailer';

class MailService {
  constructor() {
    // Cấu hình SMTP - Sử dụng Gmail hoặc Ethereal để test
    // Để test nhanh, dùng Ethereal (tạo tài khoản test tự động)
    this.transporter = null;
    this.initializeTransporter();
  }

  async initializeTransporter() {
    try {
      // Sử dụng Gmail để gửi mail thật
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASSWORD,
        },
      });
      
      // Verify connection
      await this.transporter.verify();
      console.log('📧 Mail service initialized with Gmail');
      console.log('📧 Gmail account:', process.env.GMAIL_USER);

      // Option: Sử dụng Ethereal (Test mode - không gửi thật)
      /*
      const testAccount = await nodemailer.createTestAccount();
      
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      console.log('📧 Mail service initialized with Ethereal (Test mode)');
      console.log('📧 Test account:', testAccount.user);
      */
    } catch (error) {
      console.error('❌ Failed to initialize mail service:', error);
    }
  }

  /**
   * Gửi email xác nhận đơn hàng thành công
   * @param {string} email - Email người nhận
   * @param {Object} orderData - Thông tin đơn hàng
   */
  async sendOrderSuccessEmail(email, orderData) {
    try {
      if (!this.transporter) {
        await this.initializeTransporter();
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
              <h1>✅ Thanh toán thành công!</h1>
            </div>
            <div class="content">
              <p>Xin chào <strong>${shippingAddress?.fullName || 'Quý khách'}</strong>,</p>
              <p>Cảm ơn bạn đã đặt hàng tại <strong>Custom T-Shirt Shop</strong>!</p>
              <p>Chúng tôi đã nhận được thanh toán của bạn và đơn hàng đang được xử lý.</p>
              
              <div class="order-info">
                <h3>📦 Thông tin đơn hàng</h3>
                <p><strong>Mã đơn hàng:</strong> #${orderNumber}</p>
                <p><strong>Ngày đặt:</strong> ${new Date().toLocaleDateString('vi-VN')}</p>
                <p><strong>Địa chỉ giao hàng:</strong></p>
                <p>${shippingAddress?.address}, ${shippingAddress?.ward}, ${shippingAddress?.district}, ${shippingAddress?.province}</p>
                <p><strong>Số điện thoại:</strong> ${shippingAddress?.phone}</p>
              </div>

              <h3>🛍️ Chi tiết đơn hàng</h3>
              ${items?.map(item => `
                <div class="item">
                  <strong>${item.product?.name || 'Sản phẩm'}</strong><br/>
                  Size: ${item.size} | Số lượng: ${item.quantity}<br/>
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

      const mailOptions = {
        from: '"Custom T-Shirt Shop" <noreply@customtshirt.com>',
        to: email,
        subject: `✅ Xác nhận đơn hàng #${orderNumber} - Thanh toán thành công`,
        html: htmlContent,
      };

      const info = await this.transporter.sendMail(mailOptions);

      console.log('📧 Email sent successfully to:', email);
      console.log('📧 Message ID:', info.messageId);

      return {
        success: true,
        messageId: info.messageId,
        recipient: email
      };
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      throw new Error('Failed to send order confirmation email');
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
}

export default new MailService();
