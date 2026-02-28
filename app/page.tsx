// app/page.tsx

import { supabaseServer } from '@/lib/supabase-server';
import { SHOP_CONFIG } from '@/lib/config';
import StorefrontClient from '@/components/StorefrontClient';
import Navbar from '@/components/Navbar';
import BalloonBackground from '@/components/BalloonBackground';

// Revalidate product data every 60 seconds instead of caching indefinitely
export const revalidate = 60;

// Fallback sample products shown when Supabase is unreachable
const FALLBACK_PRODUCTS = [
  { id: 'sample-1', name: 'Kaju Katli', price: 600, unit: '500g', category: 'Sweets', image_url: null, is_out_of_stock: false, created_at: '2025-01-01' },
  { id: 'sample-2', name: 'Gulab Jamun', price: 350, unit: '1kg', category: 'Sweets', image_url: null, is_out_of_stock: false, created_at: '2025-01-02' },
  { id: 'sample-3', name: 'Rasgulla', price: 300, unit: '1kg', category: 'Sweets', image_url: null, is_out_of_stock: false, created_at: '2025-01-03' },
  { id: 'sample-4', name: 'Soan Papdi', price: 250, unit: '500g', category: 'Sweets', image_url: null, is_out_of_stock: false, created_at: '2025-01-04' },
  { id: 'sample-5', name: 'Aloo Bhujia', price: 200, unit: '500g', category: 'Namkeen', image_url: null, is_out_of_stock: false, created_at: '2025-01-05' },
  { id: 'sample-6', name: 'Moong Dal', price: 220, unit: '500g', category: 'Namkeen', image_url: null, is_out_of_stock: false, created_at: '2025-01-06' },
  { id: 'sample-7', name: 'Sugar-Free Barfi', price: 500, unit: '250g', category: 'Sugar-Free', image_url: null, is_out_of_stock: false, created_at: '2025-01-07' },
  { id: 'sample-8', name: 'Dry Fruit Laddu', price: 450, unit: '500g', category: 'Festive Specials', image_url: null, is_out_of_stock: false, created_at: '2025-01-08' },
];

export default async function Home() {
  // 1. Fetch products that are in stock
  const { data: products, error } = await supabaseServer
    .from('products')
    .select('*')
    .eq('is_out_of_stock', false)
    .order('created_at', { ascending: false });

  // 2. Handle potential fetch error gracefully — use fallback data
  if (error) {
    console.error('Error fetching products:', error.message);
  }

  // 3. Use real products if available, fallback sample data if DB is down, or empty state
  const displayProducts = (products && products.length > 0) ? products : (error ? FALLBACK_PRODUCTS : []);
  const showProducts = displayProducts.length > 0;
  const showEmptyState = !error && (!products || products.length === 0);
  const showErrorState = false; // Never show error state — we always have fallback data

  // 4. Build JSON-LD structured data for SEO
  const jsonLd = showProducts ? {
    "@context": "https://schema.org",
    "@type": "Store",
    "name": SHOP_CONFIG.name,
    "description": "Order fresh, authentic sweets online and checkout via WhatsApp.",
    "currenciesAccepted": "INR",
    "makesOffer": displayProducts.map(p => ({
      "@type": "Offer",
      "itemOffered": {
        "@type": "Product",
        "name": p.name,
        "category": p.category || "Sweets",
        ...(p.image_url ? { "image": p.image_url } : {}),
      },
      "price": p.price,
      "priceCurrency": "INR",
      "availability": "https://schema.org/InStock",
      "unitText": p.unit,
    })),
  } : null;

  // 5. Render the page
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50/90 pb-20 relative z-10">
        {/* Floating balloons background (User Interface Only) */}
        <BalloonBackground />

        {/* JSON-LD Structured Data for SEO */}
        {jsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        )}

        {/* Hero Section – using semantic <header> */}
        <header
          className="text-white py-10 sm:py-16 px-4 text-center shadow-md"
          style={{ backgroundColor: SHOP_CONFIG.themeColor }}
        >
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-1 sm:mb-2">
            Welcome to {SHOP_CONFIG.name}
          </h1>
          <p className="text-sm sm:text-lg opacity-90 max-w-xl mx-auto">
            Authentic, fresh, and delicious. Add your favorite treats to the cart
            and order instantly via WhatsApp!
          </p>
        </header>

        {/* Error State */}
        {showErrorState && (
          <div className="max-w-5xl mx-auto px-4 mt-12">
            <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
              <p className="text-red-500 text-lg">
                ⚠️ Unable to load products at the moment.
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Please refresh the page or try again later.
              </p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {showEmptyState && (
          <div className="max-w-5xl mx-auto px-4 mt-12">
            <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
              <p className="text-gray-500 text-lg">
                No sweets available right now. Please check back later!
              </p>
              <p className="text-sm text-gray-400 mt-2">
                (Admin: Add some products in your Supabase database to see them here)
              </p>
            </div>
          </div>
        )}

        {/* Search, Categories, and Product Grid */}
        {showProducts && <StorefrontClient products={displayProducts} />}
      </main>
    </>
  );
}