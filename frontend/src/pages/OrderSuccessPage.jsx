import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaSpinner, FaHome, FaShoppingBag } from 'react-icons/fa';
import api from '../utils/api';

const OrderSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { orderNumber } = useParams(); // For COD orders
  const [loading, setLoading] = useState(true);
  const [orderInfo, setOrderInfo] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        // Check if this is VNPAY callback
        const vnpResponseCode = searchParams.get('vnp_ResponseCode');
        const vnpOrderId = searchParams.get('vnp_TxnRef');
        const vnpTransactionNo = searchParams.get('vnp_TransactionNo');
        const vnpAmount = searchParams.get('vnp_Amount');

        console.log('=== ORDER SUCCESS PAGE ===');
        console.log('VNPAY Params:', {
          vnpResponseCode,
          vnpOrderId,
          vnpTransactionNo,
          vnpAmount,
          allParams: Object.fromEntries(searchParams)
        });

        if (vnpResponseCode && vnpOrderId) {
          // This is VNPAY callback
          console.log('VNPAY callback received:', { vnpResponseCode, vnpOrderId });

          if (vnpResponseCode === '00') {
            // Success - Call backend to verify and update order status
            setPaymentStatus('success');
            
            try {
              // Gọi API để verify và cập nhật trạng thái đơn hàng
              const verifyResponse = await api.get('/payment/vnpay-return', {
                params: Object.fromEntries(searchParams)
              });
              
              console.log('Verify response:', verifyResponse.data);

              // Fetch order details by order number
              const { data } = await api.get(`/orders/number/${vnpOrderId}`);
              console.log('Order data:', data);
              setOrderInfo(data.data);
            } catch (err) {
              console.error('Error verifying payment or fetching order:', err);
              // Set basic info even if fetch fails
              setOrderInfo({ 
                orderNumber: vnpOrderId,
                transactionNo: vnpTransactionNo,
                amount: vnpAmount ? parseInt(vnpAmount) / 100 : 0,
                paymentStatus: 'paid'
              });
            }
          } else {
            // Failed
            setPaymentStatus('failed');
            setOrderInfo({ orderNumber: vnpOrderId });
          }
        } else if (searchParams.get('session_id') && searchParams.get('payment') === 'stripe_success') {
          // Stripe payment - verify session
          const sessionId = searchParams.get('session_id');
          try {
            console.log('Verifying Stripe payment:', sessionId, orderNumber);
            const { data } = await api.get('/stripe/verify-payment', {
              params: { sessionId, orderNumber }
            });
            
            console.log('Stripe verification response:', data);
            
            if (data.success) {
              setPaymentStatus('success');
              // Fetch full order details
              const orderResponse = await api.get(`/orders/number/${orderNumber}`);
              setOrderInfo(orderResponse.data.data);
            } else {
              setPaymentStatus('failed');
              setOrderInfo({ orderNumber });
            }
          } catch (err) {
            console.error('Error verifying Stripe payment:', err);
            setPaymentStatus('error');
          }
        } else if (orderNumber) {
          // COD order - direct access
          setPaymentStatus('cod');
          try {
            const { data } = await api.get(`/orders/number/${orderNumber}`);
            setOrderInfo(data.data);
          } catch (err) {
            console.error('Error fetching order:', err);
          }
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
        setPaymentStatus('error');
      } finally {
        setLoading(false);
      }
    };

    checkPaymentStatus();
  }, [searchParams, orderNumber]);

  if (loading) {
    return (
      <div className="container-custom py-16">
        <div className="max-w-2xl mx-auto text-center">
          <FaSpinner className="animate-spin text-6xl text-primary-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Đang xử lý...</h2>
          <p className="text-gray-600">Vui lòng đợi trong khi chúng tôi xác nhận thanh toán của bạn</p>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'success' || paymentStatus === 'cod') {
    return (
      <div className="container-custom py-16">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaCheckCircle className="text-5xl text-green-600" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {paymentStatus === 'success' ? '🎉 Thanh toán thành công!' : '✅ Đặt hàng thành công!'}
            </h1>
            
            <p className="text-gray-600 mb-6">
              {paymentStatus === 'success' 
                ? 'Thanh toán của bạn đã được xử lý thành công. Cảm ơn bạn đã đặt hàng!'
                : 'Đơn hàng của bạn đã được đặt thành công. Bạn sẽ thanh toán khi nhận hàng.'}
            </p>

            {orderInfo && (
              <div className="bg-gray-50 rounded-xl p-6 mb-6 text-left">
                <h3 className="font-bold text-lg mb-4">Chi tiết đơn hàng</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mã đơn hàng:</span>
                    <span className="font-semibold">#{orderInfo.orderNumber || orderInfo.orderId}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trạng thái thanh toán:</span>
                    <span className={`font-semibold ${
                      orderInfo.paymentStatus === 'paid' ? 'text-green-600' : 'text-orange-600'
                    }`}>
                      {orderInfo.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chờ thanh toán'}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Trạng thái đơn hàng:</span>
                    <span className="font-semibold capitalize">
                      {orderInfo.orderStatus || orderInfo.status || 'Pending'}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Tổng tiền:</span>
                    <span className="font-semibold text-lg text-primary-600">
                      {(orderInfo.totalAmount || orderInfo.amount || 0).toLocaleString('vi-VN')} ₫
                    </span>
                  </div>

                  {orderInfo.paidAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ngày thanh toán:</span>
                      <span className="font-semibold">
                        {new Date(orderInfo.paidAt).toLocaleString('vi-VN')}
                      </span>
                    </div>
                  )}

                  {orderInfo.vnpayTransaction && (
                    <div className="pt-3 border-t">
                      <p className="text-sm text-gray-500 mb-2">Chi tiết giao dịch:</p>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Mã giao dịch:</span>
                          <span className="font-mono">{orderInfo.vnpayTransaction.transactionNo}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Ngân hàng:</span>
                          <span>{orderInfo.vnpayTransaction.bankCode}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Loại thẻ:</span>
                          <span>{orderInfo.vnpayTransaction.cardType}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                📧 Email xác nhận đã được gửi đến địa chỉ email của bạn kèm theo thông tin đơn hàng.
              </p>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate('/orders')}
                className="btn btn-primary flex items-center gap-2"
              >
                <FaShoppingBag />
                Xem đơn hàng
              </button>
              
              <button
                onClick={() => navigate('/')}
                className="btn btn-outline flex items-center gap-2"
              >
                <FaHome />
                Về trang chủ
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'failed') {
    return (
      <div className="container-custom py-16">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaTimesCircle className="text-5xl text-red-600" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Thanh toán thất bại
            </h1>
            
            <p className="text-gray-600 mb-6">
              Rất tiếc, thanh toán của bạn không thể được xử lý. Vui lòng thử lại hoặc sử dụng phương thức thanh toán khác.
            </p>

            {orderInfo && (
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-600">
                  Đơn hàng: <span className="font-semibold">#{orderInfo.orderId}</span>
                </p>
              </div>
            )}

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate('/checkout')}
                className="btn btn-primary"
              >
                Thử lại
              </button>
              
              <button
                onClick={() => navigate('/')}
                className="btn btn-outline"
              >
                Về trang chủ
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  return (
    <div className="container-custom py-16">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-3xl font-bold mb-4">Đã có lỗi xảy ra</h1>
        <p className="text-gray-600 mb-6">Vui lòng liên hệ hỗ trợ nếu bạn cần trợ giúp.</p>
        <button
          onClick={() => navigate('/')}
          className="btn btn-primary"
        >
          Về trang chủ
        </button>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
