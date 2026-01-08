import { Link } from 'react-router-dom';
import { FiFacebook, FiInstagram, FiTwitter } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-4">
              Custom<span className="text-primary-400">Tees</span>
            </h3>
            <p className="text-sm">
              Tạo áo phông tùy chỉnh của riêng bạn với công cụ thiết kế dễ sử dụng.
              In ấn chất lượng cao, giao hàng nhanh chóng.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Liên kết nhanh</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/products" className="hover:text-primary-400 transition">
                  Cửa hàng
                </Link>
              </li>
              <li>
                <Link to="/products?isCustomizable=true" className="hover:text-primary-400 transition">
                  Customize
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-primary-400 transition">
                  Giỏ hàng
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-white font-semibold mb-4">Hỗ trợ khách hàng</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-primary-400 transition">
                  Câu hỏi thường gặp
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-400 transition">
                  Thông tin vận chuyển
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-400 transition">
                  Đổi trả hàng
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-400 transition">
                  Liên hệ
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-white font-semibold mb-4">Theo dõi chúng tôi</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary-400 transition">
                <FiFacebook size={24} />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-400 transition">
                <FiInstagram size={24} />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-400 transition">
                <FiTwitter size={24} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} CustomTees. Bảo lưu mọi quyền.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
