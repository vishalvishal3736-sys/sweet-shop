// app/cart/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { SHOP_CONFIG } from '@/lib/config';
import { supabase } from '@/lib/supabase'; // <-- Added Supabase import

export default function CartPage() {
  const { items, removeItem, getTotal, clearCart } = useCartStore();
  const [whatsappNumber, setWhatsappNumber] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // New States for Delivery vs Pickup
  const [orderType, setOrderType] = useState<'pickup' | 'delivery'>('pickup');
  const [address, setAddress] = useState('');

  // Fetch the actual WhatsApp number from the database
  useEffect(() => {
    async function fetchWhatsAppNumber() {
      try {
        const { data, error } = await supabase
          .from('shop_settings')
          .select('whatsapp_number')
          .eq('id', 1)
          .single();

        if (error) throw error;
        if (data) setWhatsappNumber(data.whatsapp_number);
      } catch (err) {
        console.error('Error fetching WhatsApp number:', err);
        // Fallback to config value if fetch fails
        setWhatsappNumber(SHOP_CONFIG.fallbackWhatsAppNumber);
      } finally {
        setLoading(false);
      }
    }

    fetchWhatsAppNumber();
  }, []);

  // ============================================
  // WhatsApp Checkout – builds a formatted message and saves order
  // ============================================
  const handleWhatsAppCheckout = async () => {
    if (items.length === 0 || !whatsappNumber) return;

    // Validate address if delivery is selected
    if (orderType === 'delivery' && !address.trim()) {
      alert("Please enter your delivery address.");
      return;
    }

    // 1. Save order to database (we append order details to the json for now)
    const orderData = {
      items: {
        itemsList: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          unit: item.unit
        })),
        orderType: orderType,
        address: orderType === 'delivery' ? address : null
      },
      total_amount: getTotal(),
      status: 'pending'
    };

    const { error } = await supabase.from('orders').insert([orderData]);

    if (error) {
      console.error('Error saving order:', error.message);
      // We could show a toast here, but we'll still send the user to WhatsApp
    }

    // 2. Build the message
    let message = `*${orderType === 'pickup' ? '🛍️ NEW ORDER (COLLECT FROM SHOP)' : '🛵 NEW ORDER (ORDER AT HOME)'}*\n\n`;

    if (orderType === 'delivery') {
      message += `*📍 Delivery Address:*\n${address}\n\n`;
    }

    message += `*Order Details:*\n`;
    items.forEach((item, index) => {
      const itemTotal = item.price * item.quantity;
      message += `${index + 1}. *${item.name}*\n`;
      message += `   ${item.quantity} ${item.unit} x ${SHOP_CONFIG.currency}${item.price} = ${SHOP_CONFIG.currency}${itemTotal}\n`;
    });

    message += `\n*Total Bill: ${SHOP_CONFIG.currency}${getTotal()}* (Excluding Delivery)\n\n`;
    message += `Please share your QR code so I can make the payment.`;

    // Add required bilingual reminder for home deliveries
    if (orderType === 'delivery') {
      message += `\n\n------------------------------`;
      message += `\n⚠️ *REMINDER FOR SHOP OWNER:*\n*Please tell the customer the Delivery Charges based on their location.*\n*(दुकानदार: कृपया ग्राहक को उनकी लोकेशन के अनुसार डिलीवरी चार्ज बताएं।)*`;
    }

    // 3. Encode for URL safety and open WhatsApp
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');

    // 4. Clear the cart after checkout
    clearCart();
  };

  // ============================================
  // Empty cart view
  // ============================================
  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Looks like you haven&apos;t added any sweets yet!</p>
        <Link
          href="/"
          className="px-6 py-3 text-white rounded-lg font-medium transition-colors hover:opacity-90"
          style={{ backgroundColor: SHOP_CONFIG.themeColor }}
        >
          Browse Sweets
        </Link>
      </div>
    );
  }

  // Determine if the checkout button should be disabled
  const isCheckoutDisabled = loading || !whatsappNumber || (orderType === 'delivery' && !address.trim());

  // ============================================
  // Cart with items
  // ============================================
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-gray-900 border-b pb-4 mb-6">Your Order</h1>

        {/* List of items */}
        <div className="space-y-4 mb-8">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
              <div>
                <h3 className="font-bold text-gray-800">{item.name}</h3>
                <p className="text-gray-600 text-sm mt-1">
                  {item.quantity} {item.unit} x {SHOP_CONFIG.currency}{item.price}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <p className="font-bold text-gray-900">
                  {SHOP_CONFIG.currency}{item.price * item.quantity}
                </p>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-red-400 hover:text-red-600 transition-colors p-2"
                  aria-label={`Remove ${item.name} from cart`}
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* --- NEW SECTIONS FOR ORDER TYPE AND ADDRESS --- */}
        <div className="border-t pt-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">How would you like your order?</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <label
              className={`cursor-pointer border rounded-xl p-4 flex items-center gap-3 transition-colors ${orderType === 'pickup'
                ? 'border-blue-500 bg-blue-50/50 text-blue-900'
                : 'border-gray-200 hover:bg-gray-50'
                }`}
            >
              <input
                type="radio"
                name="orderType"
                value="pickup"
                className="w-4 h-4 text-blue-600"
                checked={orderType === 'pickup'}
                onChange={() => setOrderType('pickup')}
              />
              <div>
                <span className="font-bold block">Collect from Shop</span>
                <span className="text-sm text-gray-500">Pick up your fresh sweets yourself.</span>
              </div>
            </label>

            <label
              className={`cursor-pointer border rounded-xl p-4 flex items-center gap-3 transition-colors ${orderType === 'delivery'
                ? 'border-blue-500 bg-blue-50/50 text-blue-900'
                : 'border-gray-200 hover:bg-gray-50'
                }`}
            >
              <input
                type="radio"
                name="orderType"
                value="delivery"
                className="w-4 h-4 text-blue-600"
                checked={orderType === 'delivery'}
                onChange={() => setOrderType('delivery')}
              />
              <div>
                <span className="font-bold block">Order at Home</span>
                <span className="text-sm text-gray-500">Fast delivery right to your door.</span>
              </div>
            </label>
          </div>

          {/* Address Input (Only visible if Delivery) */}
          {orderType === 'delivery' && (
            <div className="mt-4 transition-all duration-300 ease-in-out">
              <div className="flex justify-between items-end mb-2">
                <label htmlFor="address" className="block text-sm font-bold text-gray-700">
                  Delivery Address <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    if (!navigator.geolocation) {
                      alert('Geolocation is not supported by your browser.');
                      return;
                    }

                    const btn = document.getElementById('gps-btn');
                    if (btn) btn.innerText = 'Locating...';

                    navigator.geolocation.getCurrentPosition(
                      async (position) => {
                        const lat = position.coords.latitude;
                        const lon = position.coords.longitude;

                        try {
                          // Reverse Geocoding using OpenStreetMap (Free, requires user-agent but browser sends it)
                          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
                          const data = await res.json();

                          let newAddress = data.display_name || `Lat: ${lat}, Lon: ${lon}`;
                          newAddress += `\n\n📌 Google Maps Link: https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;

                          setAddress(newAddress);
                        } catch (err) {
                          console.error('Error fetching address:', err);
                          setAddress(`Lat: ${lat}, Lon: ${lon}\n\n📌 Google Maps Link: https://www.google.com/maps/search/?api=1&query=${lat},${lon}`);
                        } finally {
                          if (btn) btn.innerText = '📍 Use Current Location';
                        }
                      },
                      (error) => {
                        console.error('Error getting location:', error);
                        alert('Unable to retrieve your location. Please ensure location services are enabled.');
                        if (btn) btn.innerText = '📍 Use Current Location';
                      }
                    );
                  }}
                  id="gps-btn"
                  className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-md hover:bg-blue-100 transition-colors flex items-center gap-1"
                >
                  📍 Use Current Location
                </button>
              </div>
              <textarea
                id="address"
                rows={4}
                placeholder="Enter your full home address and any landmark...&#10;Or click 'Use Current Location' above."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>
          )}
        </div>

        {/* Total & Checkout */}
        <div className="border-t pt-6 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-2">
            <h2 className="text-xl font-bold text-gray-900">Total</h2>
            <div className="text-right">
              <h2 className="text-3xl font-extrabold" style={{ color: SHOP_CONFIG.themeColor }}>
                {SHOP_CONFIG.currency}{getTotal()}
              </h2>
              {orderType === 'delivery' && (
                <p className="text-sm text-gray-500 font-medium">+ Delivery Charges (Pay later)</p>
              )}
            </div>
          </div>

          <button
            onClick={handleWhatsAppCheckout}
            disabled={isCheckoutDisabled}
            className="w-full py-4 text-white text-lg font-bold rounded-xl transition-all hover:opacity-90 hover:shadow-lg flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
            style={{ backgroundColor: "#25D366" }}
          >
            {loading ? 'Loading...' : 'Send Order via WhatsApp'}
          </button>
        </div>
      </div>
    </div>
  );
}