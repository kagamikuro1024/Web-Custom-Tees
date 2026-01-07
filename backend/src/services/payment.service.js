import crypto from 'crypto';
import qs from 'qs';
import dayjs from 'dayjs';

class PaymentService {
  constructor() {
    // Cấu hình VNPAY - Sandbox
    this.vnp_TmnCode = process.env.VNPAY_TMN_CODE;
    this.vnp_HashSecret = process.env.VNPAY_HASH_SECRET;
    this.vnp_Url = process.env.VNPAY_URL;
    this.vnp_ReturnUrl = process.env.VNPAY_RETURN_URL;
  }

  /**
   * Sắp xếp object theo key (A-Z) - Yêu cầu của VNPAY
   * Encode cả key và value, thay %20 thành +
   */
  sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        str.push(encodeURIComponent(key));
      }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
      sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
  }

  /**
   * Tạo chữ ký HMAC SHA512
   */
  createSignature(data, secretKey) {
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(Buffer.from(data, 'utf-8')).digest('hex');
    return signed;
  }

  /**
   * Tạo URL thanh toán VNPAY
   * @param {Object} params - { amount, orderId, orderInfo, ipAddr, bankCode }
   * @returns {string} URL thanh toán
   */
  createPaymentUrl(params) {
    try {
      const { amount, orderId, orderInfo, ipAddr, bankCode } = params;

      // Tạo thời gian
      const createDate = dayjs().format('YYYYMMDDHHmmss');
      const expireDate = dayjs().add(15, 'minutes').format('YYYYMMDDHHmmss');

      // Tạo vnp_Params
      let vnp_Params = {
        vnp_Version: '2.1.0',
        vnp_Command: 'pay',
        vnp_TmnCode: this.vnp_TmnCode,
        vnp_Locale: 'vn',
        vnp_CurrCode: 'VND',
        vnp_TxnRef: orderId, // Mã đơn hàng (unique)
        vnp_OrderInfo: orderInfo || `Thanh toan don hang ${orderId}`, // Không dấu
        vnp_OrderType: 'other',
        vnp_Amount: amount * 100, // VNPAY yêu cầu nhân 100
        vnp_ReturnUrl: this.vnp_ReturnUrl,
        vnp_IpAddr: ipAddr,
        vnp_CreateDate: createDate,
        vnp_ExpireDate: expireDate,
      };

      // Thêm bankCode nếu có (để chọn ngân hàng cụ thể)
      if (bankCode) {
        vnp_Params.vnp_BankCode = bankCode;
      }

      console.log('=== VNPAY BEFORE SORT ===');
      console.log('Params before sort:', JSON.stringify(vnp_Params, null, 2));

      // Sắp xếp params theo alphabet
      vnp_Params = this.sortObject(vnp_Params);

      console.log('Params after sort:', JSON.stringify(vnp_Params, null, 2));

      // Tạo query string KHÔNG ENCODE để ký
      const signData = qs.stringify(vnp_Params, { encode: false });

      // Tạo secure hash
      const secureHash = this.createSignature(signData, this.vnp_HashSecret);

      // Thêm hash vào params
      vnp_Params['vnp_SecureHash'] = secureHash;

      // Tạo URL thanh toán - KHÔNG ENCODE theo tài liệu VNPAY
      const paymentUrl = this.vnp_Url + '?' + qs.stringify(vnp_Params, { encode: false });

      // DEBUG: Log để kiểm tra
      console.log('=== VNPAY DEBUG ===');
      console.log('TmnCode:', this.vnp_TmnCode);
      console.log('HashSecret:', this.vnp_HashSecret);
      console.log('SignData:', signData);
      console.log('SecureHash:', secureHash);
      console.log('IpAddr:', ipAddr);
      console.log('Full Payment URL:', paymentUrl);
      console.log('==================');

      console.log('💳 Created VNPAY payment URL for order:', orderId);

      return paymentUrl;
    } catch (error) {
      console.error('❌ Error creating payment URL:', error);
      throw new Error('Failed to create payment URL');
    }
  }

  /**
   * Xác thực chữ ký từ VNPAY return URL
   * @param {Object} vnpParams - Query params từ VNPAY
   * @returns {boolean} true nếu hợp lệ
   */
  verifyReturnUrl(vnpParams) {
    try {
      const secureHash = vnpParams['vnp_SecureHash'];
      
      // Xóa các params không cần verify
      delete vnpParams['vnp_SecureHash'];
      delete vnpParams['vnp_SecureHashType'];

      // Sắp xếp params
      const sortedParams = this.sortObject(vnpParams);

      // Tạo sign data
      const signData = qs.stringify(sortedParams, { encode: false });

      // Tạo checksum
      const checkSum = this.createSignature(signData, this.vnp_HashSecret);

      // So sánh
      const isValid = secureHash === checkSum;

      console.log('🔐 VNPAY signature verification:', isValid ? '✅ Valid' : '❌ Invalid');

      return isValid;
    } catch (error) {
      console.error('❌ Error verifying return URL:', error);
      return false;
    }
  }

  /**
   * Xử lý IPN (Instant Payment Notification) từ VNPAY
   * @param {Object} vnpParams - Query params từ VNPAY IPN
   * @returns {Object} Response để trả về cho VNPAY
   */
  handleIPN(vnpParams) {
    try {
      // Verify signature
      const isValid = this.verifyReturnUrl({ ...vnpParams });

      if (!isValid) {
        console.error('❌ Invalid signature in IPN');
        return {
          RspCode: '97',
          Message: 'Invalid signature'
        };
      }

      const orderId = vnpParams['vnp_TxnRef'];
      const responseCode = vnpParams['vnp_ResponseCode'];
      const amount = vnpParams['vnp_Amount'] / 100; // Chia 100 để về số tiền thật

      console.log('📨 Received IPN for order:', orderId);
      console.log('💳 Response code:', responseCode);
      console.log('💰 Amount:', amount);

      // Return data để controller xử lý logic business
      return {
        isValid: true,
        orderId,
        responseCode,
        amount,
        transactionNo: vnpParams['vnp_TransactionNo'],
        bankCode: vnpParams['vnp_BankCode'],
        payDate: vnpParams['vnp_PayDate'],
        cardType: vnpParams['vnp_CardType'],
        orderInfo: vnpParams['vnp_OrderInfo'],
      };
    } catch (error) {
      console.error('❌ Error handling IPN:', error);
      return {
        RspCode: '99',
        Message: 'Unknown error'
      };
    }
  }

  /**
   * Get response message từ response code
   */
  getResponseMessage(responseCode) {
    const messages = {
      '00': 'Giao dịch thành công',
      '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
      '09': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.',
      '10': 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
      '11': 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.',
      '12': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.',
      '13': 'Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP).',
      '24': 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
      '51': 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.',
      '65': 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.',
      '75': 'Ngân hàng thanh toán đang bảo trì.',
      '79': 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định.',
      '99': 'Các lỗi khác',
    };

    return messages[responseCode] || 'Lỗi không xác định';
  }
}

export default new PaymentService();
