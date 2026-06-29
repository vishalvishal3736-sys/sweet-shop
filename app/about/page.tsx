// app/about/page.tsx
import { SHOP_CONFIG } from '@/lib/config';
import Navbar from '@/components/Navbar';
import { Clock, MapPin, Phone, Mail, Heart, Award, Users } from 'lucide-react';

export const metadata = {
  title: `About Us | ${SHOP_CONFIG.name}`,
  description: `Learn about ${SHOP_CONFIG.name} - Your trusted source for authentic Indian sweets and snacks.`,
};

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50/90 pb-20">
        {/* Hero Section */}
        <div
          className="text-white py-12 sm:py-20 px-4 text-center shadow-md"
          style={{ backgroundColor: SHOP_CONFIG.themeColor }}
        >
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-3 sm:mb-4">
            About {SHOP_CONFIG.name}
          </h1>
          <p className="text-base sm:text-lg opacity-90 max-w-2xl mx-auto">
            Serving authentic Indian sweets with love and tradition since day one
          </p>
        </div>

        {/* Story Section */}
        <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Heart className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: SHOP_CONFIG.themeColor }} />
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Our Story</h2>
            </div>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                Welcome to <strong>{SHOP_CONFIG.name}</strong>, where tradition meets taste! We are passionate about 
                bringing you the most authentic and fresh Indian sweets, namkeen, and festive treats. Our journey 
                began with a simple mission: to make traditional Indian confectionery accessible to everyone while 
                maintaining the highest standards of quality and freshness.
              </p>
              <p>
                Every sweet in our store is carefully crafted using time-honored recipes passed down through 
                generations. We believe in using only the finest ingredients – pure ghee, premium dry fruits, 
                and natural flavors – to ensure that each bite takes you on a nostalgic journey to the heart 
                of Indian culinary heritage.
              </p>
              <p>
                Whether you&apos;re celebrating a festival, planning a special occasion, or simply craving something 
                sweet, we&apos;re here to make your moments sweeter. Our commitment to freshness, hygiene, and 
                customer satisfaction has made us a trusted name in the community.
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
              <Award className="w-12 h-12 mx-auto mb-4" style={{ color: SHOP_CONFIG.themeColor }} />
              <h3 className="font-bold text-lg text-gray-800 mb-2">Premium Quality</h3>
              <p className="text-sm text-gray-600">
                Only the finest ingredients and traditional recipes for authentic taste
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
              <Heart className="w-12 h-12 mx-auto mb-4" style={{ color: SHOP_CONFIG.themeColor }} />
              <h3 className="font-bold text-lg text-gray-800 mb-2">Made with Love</h3>
              <p className="text-sm text-gray-600">
                Each sweet is prepared fresh daily with care and attention to detail
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
              <Users className="w-12 h-12 mx-auto mb-4" style={{ color: SHOP_CONFIG.themeColor }} />
              <h3 className="font-bold text-lg text-gray-800 mb-2">Trusted by Many</h3>
              <p className="text-sm text-gray-600">
                Hundreds of happy customers trust us for their celebrations
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Get in Touch</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <MapPin className="w-6 h-6 flex-shrink-0 mt-1" style={{ color: SHOP_CONFIG.themeColor }} />
                <div>
                  <h3 className="font-bold text-gray-800 mb-1">Visit Us</h3>
                  <p className="text-gray-600">{SHOP_CONFIG.shopAddress}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Clock className="w-6 h-6 flex-shrink-0 mt-1" style={{ color: SHOP_CONFIG.themeColor }} />
                <div>
                  <h3 className="font-bold text-gray-800 mb-1">Business Hours</h3>
                  <p className="text-gray-600">{SHOP_CONFIG.businessHours}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Phone className="w-6 h-6 flex-shrink-0 mt-1" style={{ color: SHOP_CONFIG.themeColor }} />
                <div>
                  <h3 className="font-bold text-gray-800 mb-1">Call Us</h3>
                  <p className="text-gray-600">{SHOP_CONFIG.phoneNumber}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Mail className="w-6 h-6 flex-shrink-0 mt-1" style={{ color: SHOP_CONFIG.themeColor }} />
                <div>
                  <h3 className="font-bold text-gray-800 mb-1">Email Us</h3>
                  <p className="text-gray-600">{SHOP_CONFIG.contactEmail}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
