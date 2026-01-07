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
                About CustomTees
              </h1>
              <p className="text-xl text-gray-100 max-w-2xl mx-auto leading-relaxed">
                Bringing your creative vision to life, one t-shirt at a time
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-center">Our Story</h2>
            <div className="space-y-4 text-gray-700 text-lg leading-relaxed">
              <p>
                CustomTees was born from a simple idea: everyone deserves to wear something unique that 
                expresses who they are. What started as a small project in 2020 has grown into a thriving 
                community of creative individuals who want to stand out from the crowd.
              </p>
              <p>
                We believe that fashion should be personal. That's why we've built an easy-to-use platform 
                that lets you design your own custom t-shirts with just a few clicks. Whether you're creating 
                merchandise for your brand, designing shirts for a special event, or just want to wear 
                something that's uniquely yours, we've got you covered.
              </p>
              <p>
                Our commitment to quality means we only use premium fabrics and state-of-the-art printing 
                technology. Every t-shirt that leaves our facility is inspected to ensure it meets our high 
                standards. Because when you wear CustomTees, you should feel confident and comfortable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <h2 className="text-3xl font-bold mb-12 text-center">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiHeart className="text-primary-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Customer First</h3>
              <p className="text-gray-600">
                Your satisfaction is our priority. We're here to make your experience seamless from design to delivery.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCheckCircle className="text-primary-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Quality Guaranteed</h3>
              <p className="text-gray-600">
                Premium materials, professional printing, and rigorous quality control on every single order.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiTrendingUp className="text-primary-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Innovation</h3>
              <p className="text-gray-600">
                Constantly improving our design tools and processes to give you the best customization experience.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiUsers className="text-primary-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Community</h3>
              <p className="text-gray-600">
                Building a community of creators and supporting local artists and designers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16">
        <div className="container-custom">
          <h2 className="text-3xl font-bold mb-12 text-center">Why Choose CustomTees?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="flex gap-4">
              <div className="text-primary-600 flex-shrink-0">
                <FiCheckCircle size={24} />
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-2">Easy Design Process</h4>
                <p className="text-gray-600">
                  Our intuitive design tool makes it simple to create professional-looking custom t-shirts in minutes.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="text-primary-600 flex-shrink-0">
                <FiCheckCircle size={24} />
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-2">Fast Turnaround</h4>
                <p className="text-gray-600">
                  We process and ship most orders within 3-5 business days, so you get your shirts quickly.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="text-primary-600 flex-shrink-0">
                <FiCheckCircle size={24} />
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-2">Affordable Pricing</h4>
                <p className="text-gray-600">
                  Competitive prices without compromising on quality. Bulk discounts available for larger orders.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="text-primary-600 flex-shrink-0">
                <FiCheckCircle size={24} />
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-2">100% Satisfaction</h4>
                <p className="text-gray-600">
                  If you're not happy with your order, we'll make it right. That's our promise to you.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Create Your Custom T-Shirt?</h2>
          <p className="text-xl mb-8 text-primary-100">
            Join thousands of satisfied customers who have brought their designs to life
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/customize" className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-medium transition">
              Start Designing
            </Link>
            <Link to="/products" className="border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-3 rounded-lg font-medium transition">
              Browse Products
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
