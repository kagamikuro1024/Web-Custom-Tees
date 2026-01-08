import { Link } from 'react-router-dom';
import { FiCheckCircle, FiHeart, FiTrendingUp, FiUsers } from 'react-icons/fi';

const AboutPage = () => {
  return (
    <div>
      {/* Hero Section with Image */}
      <section className="relative h-[500px] bg-gray-900 overflow-hidden">
        <img 
          src="/assets/2.png" 
          alt="About CustomTees" 
          className="w-full h-full object-cover scale-105 animate-subtle-zoom"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="container-custom text-center text-white">
            <div className="backdrop-blur-sm bg-white/5 rounded-3xl p-12 border border-white/10 shadow-2xl animate-fade-in-up">
              <h1 className="text-6xl font-extrabold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Về chúng tôi
              </h1>
              <p className="text-xl text-gray-100 max-w-2xl mx-auto leading-relaxed">
                Biến tầm nhìn sáng tạo của bạn thành hiện thực, từng chiếc áo một
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-center">Câu chuyện của chúng tôi</h2>
            <div className="space-y-4 text-gray-700 text-lg leading-relaxed">
              <p>
                CustomTees ra đời từ một ý tưởng đơn giản: mọi người đều xứng đáng được mặc thứ gì đó độc đáo để thể hiện bản thân mình. Điều bắt đầu như một dự án nhỏ năm 2020 đã phát triển thành một cộng đồng sôi động của những người sáng tạo muốn nổi bật.
              </p>
              <p>
                Chúng tôi tin rằng thời trang nên mang tính cá nhân. Đó là lý do chúng tôi xây dựng một nền tảng dễ sử dụng cho phép bạn thiết kế áo phông tùy chỉnh của riêng mình chỉ với vài cú nhấp chuột. Dù bạn đang tạo sản phẩm cho thương hiệu, thiết kế áo cho sự kiện đặc biệt, hay chỉ muốn mặc thứ gì đó thực sự độc đáo, chúng tôi đều hỗ trợ bạn.
              </p>
              <p>
                Cam kết về chất lượng có nghĩa là chúng tôi chỉ sử dụng vải cao cấp và công nghệ in ấn tiên tiến. Mỗi chiếc áo rời khỏi xưởng đều được kiểm tra để đảm bảo đáp ứng tiêu chuẩn cao của chúng tôi. Bởi vì khi bạn mặc CustomTees, bạn nên cảm thấy tự tin và thoải mái.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <h2 className="text-3xl font-bold mb-12 text-center">Giá trị cốt lõi</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiHeart className="text-primary-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Khách hàng là số một</h3>
              <p className="text-gray-600">
                Sự hài lòng của bạn là ưu tiên của chúng tôi. Chúng tôi luôn sẵn sàng giúp trải nghiệm của bạn suôn sẻ từ thiết kế đến giao hàng.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCheckCircle className="text-primary-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Đảm bảo chất lượng</h3>
              <p className="text-gray-600">
                Nguyên liệu cao cấp, in ấn chuyên nghiệp và kiểm soát chất lượng nghiêm ngặt trên từng đơn hàng.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiTrendingUp className="text-primary-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Đổi mới</h3>
              <p className="text-gray-600">
                Liên tục cải tiến công cụ thiết kế và quy trình để mang đến trải nghiệm tùy chỉnh tốt nhất.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiUsers className="text-primary-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Cộng đồng</h3>
              <p className="text-gray-600">
                Xây dựng cộng đồng nhà sáng tạo và hỗ trợ nghệ sĩ, nhà thiết kế địa phương.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16">
        <div className="container-custom">
          <h2 className="text-3xl font-bold mb-12 text-center">Tại sao chọn chúng tôi?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="flex gap-4">
              <div className="text-primary-600 flex-shrink-0">
                <FiCheckCircle size={24} />
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-2">Quy trình thiết kế dễ dàng</h4>
                <p className="text-gray-600">
                  Công cụ thiết kế trực quan giúp bạn tạo áo phông chuyên nghiệp chỉ trong vài phút.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="text-primary-600 flex-shrink-0">
                <FiCheckCircle size={24} />
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-2">Xử lý nhanh chóng</h4>
                <p className="text-gray-600">
                  Chúng tôi xử lý và vận chuyển hầu hết đơn hàng trong vòng 3-5 ngày làm việc.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="text-primary-600 flex-shrink-0">
                <FiCheckCircle size={24} />
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-2">Giá cả hợp lý</h4>
                <p className="text-gray-600">
                  Giá cạnh tranh mà không ảnh hưởng đến chất lượng. Giảm giá cho đơn hàng số lượng lớn.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="text-primary-600 flex-shrink-0">
                <FiCheckCircle size={24} />
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-2">Hài lòng 100%</h4>
                <p className="text-gray-600">
                  Nếu bạn không hài lòng với đơn hàng, chúng tôi sẽ giải quyết. Đó là lời hứa của chúng tôi.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-bold mb-4">Sẵn sàng tạo áo phông tùy chỉnh?</h2>
          <p className="text-xl mb-8 text-primary-100">
            Tham gia cùng hàng nghìn khách hàng hài lòng đã biến thiết kế thành hiện thực
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/customize" className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-medium transition">
              Bắt đầu thiết kế
            </Link>
            <Link to="/products" className="border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-3 rounded-lg font-medium transition">
              Xem sản phẩm
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
