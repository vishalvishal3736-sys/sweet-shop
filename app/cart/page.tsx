// app/cart/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Trash2, Plus, Minus, AlertTriangle } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { SHOP_CONFIG } from '@/lib/config';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import dynamic from 'next/dynamic';

const BalloonBackground = dynamic(() => import('@/components/BalloonBackground'), { ssr: false });

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore();
  const [whatsappNumber, setWhatsappNumber] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  // New States for Delivery vs Pickup
  const [orderType, setOrderType] = useState<'pickup' | 'delivery'>('pickup');
  const [address, setAddress] = useState('');
  const [locating, setLocating] = useState(false);

  // Customer info (new)
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // Confirmation dialog (new)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

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
    setMounted(true);
  }, []);

  // ============================================
  // GPS Location handler
  // ============================================
  const handleUseLocation = () => {
    // Check for secure context — Geolocation API requires HTTPS on mobile
    if (typeof window !== 'undefined' && window.isSecureContext === false) {
      toast.error('Location requires HTTPS. Please access the site via HTTPS or localhost.', { duration: 5000 });
      return;
    }

    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }

    setLocating(true);
    toast.loading('Fetching your location...', { id: 'location-toast' });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000);

          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
            { signal: controller.signal }
          );
          clearTimeout(timeoutId);
          const data = await res.json();

          let newAddress = data.display_name || `Lat: ${lat}, Lon: ${lon}`;
          newAddress += `\n\n📌 Google Maps Link: https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;

          setAddress(newAddress);
          toast.success('Location fetched!', { id: 'location-toast' });
        } catch (err) {
          console.error('Error fetching address:', err);
          // Still set coordinates even if reverse geocoding fails
          setAddress(`Lat: ${lat}, Lon: ${lon}\n\n📌 Google Maps Link: https://www.google.com/maps/search/?api=1&query=${lat},${lon}`);
          toast.success('Location set (address lookup failed, coordinates used).', { id: 'location-toast' });
        } finally {
          setLocating(false);
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        setLocating(false);

        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error('Location permission denied. Please allow location access in your browser settings.', { id: 'location-toast', duration: 5000 });
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error('Location unavailable. Please check that GPS is enabled on your device.', { id: 'location-toast', duration: 5000 });
            break;
          case error.TIMEOUT:
            toast.error('Location request timed out. Please try again or enter address manually.', { id: 'location-toast', duration: 5000 });
            break;
          default:
            toast.error('Unable to retrieve your location. Please enter address manually.', { id: 'location-toast', duration: 5000 });
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000,
      }
    );
  };

  // ============================================
  // Trigger checkout confirmation
  // ============================================
  const handleCheckoutClick = () => {
    if (items.length === 0 || !whatsappNumber) return;

    // Validate address for delivery
    if (orderType === 'delivery' && !address.trim()) {
      toast.error("Please enter your delivery address.");
      return;
    }

    // Validate customer name
    if (!customerName.trim()) {
      toast.error("Please enter your name.");
      return;
    }

    // Show confirmation dialog
    setShowConfirmDialog(true);
  };

  // ============================================
  // WhatsApp Checkout – builds a formatted message and saves order
  // ============================================
  const handleWhatsAppCheckout = async () => {
    setShowConfirmDialog(false);

    if (items.length === 0 || !whatsappNumber) return;

    setCheckingOut(true);

    // 1. Save order to database
    const orderData = {
      customer_name: customerName.trim() || null,
      customer_phone: customerPhone.trim() || null,
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
      toast.error('Failed to save order. Please try again.');
      console.error('Error saving order:', error.message);
      setCheckingOut(false);
      // ✅ FIX: Don't proceed if order save fails — cart is NOT cleared
      return;
    }

    // 2. Build the message
    let message = `*${orderType === 'pickup' ? '🛍️ NEW ORDER (COLLECT FROM SHOP)' : '🛵 NEW ORDER (ORDER AT HOME)'}*\n\n`;

    // Customer info
    message += `*👤 Customer:* ${customerName}`;
    if (customerPhone.trim()) {
      message += ` | 📞 ${customerPhone}`;
    }
    message += `\n\n`;

    if (orderType === 'delivery') {
      message += `*📍 Delivery Address:*\n${address}\n\n`;
    }

    message += `*Order Details:*\n`;
    items.forEach((item, index) => {
      const itemTotal = (item.price * item.quantity).toFixed(2).replace(/\.00$/, '');
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

    // 4. Clear the cart after successful checkout
    clearCart();
    setCheckingOut(false);
    toast.success('Order sent! Check WhatsApp.');
  };

  // ============================================
  // SSR Guard
  // ============================================
  if (!mounted) return null;

  // ============================================
  // Empty cart view
  // ============================================
  if (items.length === 0) {
    return (
      <>
        <Navbar />
        {/* Floating balloons background (User Interface Only) */}
        <BalloonBackground />
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
      </>
    );
  }

  // Determine if the checkout button should be disabled
  const isCheckoutDisabled = loading || checkingOut || !whatsappNumber || !customerName.trim() || (orderType === 'delivery' && !address.trim());

  // ============================================
  // Cart with items
  // ============================================
  return (
    <>
      <Navbar />

      {/* Floating balloons background (User Interface Only) */}
      <BalloonBackground />

      {/* Confirmation Dialog Overlay */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowConfirmDialog(false)}>
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <AlertTriangle size={20} className="text-green-600" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900">Confirm Order</h3>
            </div>
            <p className="text-sm sm:text-base text-gray-600 mb-2">
              You are about to send an order for <strong>{SHOP_CONFIG.currency}{getTotal()}</strong> via WhatsApp.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              {items.length} item{items.length > 1 ? 's' : ''} • {orderType === 'delivery' ? 'Home Delivery' : 'Pickup from Shop'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleWhatsAppCheckout}
                className="flex-1 py-2.5 text-white rounded-lg font-bold transition-all hover:opacity-90"
                style={{ backgroundColor: "#25D366" }}
              >
                Send Order
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gray-50/90 py-6 sm:py-10 px-3 sm:px-4 relative z-10">
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 md:p-8">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 border-b pb-3 sm:pb-4 mb-4 sm:mb-6">Your Order</h1>

          {/* List of items */}
          <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
            {items.map((item) => (
              <div key={item.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-gray-50 p-3 sm:p-4 rounded-lg gap-2 sm:gap-0">
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-gray-800">{item.name}</h3>
                  <p className="text-gray-600 text-xs sm:text-sm mt-0.5 sm:mt-1">
                    {SHOP_CONFIG.currency}{item.price} / {item.unit}
                  </p>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  {/* Step-aware quantity controls */}
                  <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - (item.step_interval || 1))}
                      className="p-2.5 text-gray-500 hover:text-red-600 active:text-red-600 transition-colors cursor-pointer select-none"
                      aria-label={`Decrease ${item.name} quantity`}
                    >
                      <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </button>
                    <span className="px-2 text-sm font-bold text-gray-900 min-w-[2rem] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + (item.step_interval || 1))}
                      className="p-2.5 text-gray-500 hover:text-red-600 active:text-red-600 transition-colors cursor-pointer select-none"
                      aria-label={`Increase ${item.name} quantity`}
                    >
                      <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </button>
                  </div>

                  <p className="font-bold text-gray-900 min-w-[2.5rem] sm:min-w-[3.5rem] text-right text-sm sm:text-base">
                    {SHOP_CONFIG.currency}{(item.price * item.quantity).toFixed(2).replace(/\.00$/, '')}
                  </p>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-400 hover:text-red-600 active:text-red-600 transition-colors p-3 cursor-pointer select-none"
                    aria-label={`Remove ${item.name} from cart`}
                  >
                    <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* --- CUSTOMER INFO SECTION --- */}
          <div className="border-t pt-4 sm:pt-6 mb-4 sm:mb-6">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Your Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="customerName" className="block text-sm font-bold text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="customerName"
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition text-sm"
                  placeholder="Enter your name"
                  required
                />
              </div>
              <div>
                <label htmlFor="customerPhone" className="block text-sm font-bold text-gray-700 mb-1">
                  Phone <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  id="customerPhone"
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition text-sm"
                  placeholder="e.g., 9876543210"
                />
              </div>
            </div>
          </div>

          {/* --- SECTIONS FOR ORDER TYPE AND ADDRESS --- */}
          <div className="border-t pt-4 sm:pt-6 mb-6 sm:mb-8">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">How would you like your order?</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <label
                className={`cursor-pointer border rounded-xl p-4 flex items-center gap-3 transition-colors ${orderType === 'pickup'
                  ? 'border-red-500 bg-red-50/50 text-red-900'
                  : 'border-gray-200 hover:bg-gray-50'
                  }`}
              >
                <input
                  type="radio"
                  name="orderType"
                  value="pickup"
                  className="w-4 h-4 text-red-600"
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
                  ? 'border-red-500 bg-red-50/50 text-red-900'
                  : 'border-gray-200 hover:bg-gray-50'
                  }`}
              >
                <input
                  type="radio"
                  name="orderType"
                  value="delivery"
                  className="w-4 h-4 text-red-600"
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
                    onClick={handleUseLocation}
                    disabled={locating}
                    className="text-xs font-bold text-red-600 bg-red-50 px-4 py-2.5 rounded-md hover:bg-red-100 active:bg-red-200 transition-colors flex items-center gap-1 disabled:opacity-50 cursor-pointer select-none"
                  >
                    {locating ? 'Locating...' : '📍 Use Current Location'}
                  </button>
                </div>
                <textarea
                  id="address"
                  rows={4}
                  placeholder={"Enter your full home address and any landmark...\nOr click 'Use Current Location' above."}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition text-sm"
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
              onClick={handleCheckoutClick}
              disabled={isCheckoutDisabled}
              className="w-full py-3.5 sm:py-4 text-white text-base sm:text-lg font-bold rounded-xl transition-all hover:opacity-90 active:opacity-80 active:scale-[0.98] hover:shadow-lg flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none group"
              style={{ backgroundColor: "#25D366" }}
            >
              {loading ? 'Loading...' : checkingOut ? 'Sending Order...' : 'Send Order via WhatsApp'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}