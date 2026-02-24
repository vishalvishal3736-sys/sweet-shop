// app/page.tsx

import { supabase } from '@/lib/supabase';
import { SHOP_CONFIG } from '@/lib/config';
import ProductCard from '@/components/ProductCard';

// Define the shape of a product coming from the database
interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  image_url: string | null;        // Allow null for products without images
  is_out_of_stock: boolean;
  step_interval?: number;
  min_quantity?: number;
}

export default async function Home() {
  // 1. Fetch products that are in stock
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_out_of_stock', false)
    .order('created_at', { ascending: false });

  // 2. Handle potential fetch error gracefully
  if (error) {
    console.error('Error fetching products:', error.message);
    // We'll show an error message to the user, but still render the UI shell.
  }

  // 3. Determine if we should show products or an appropriate message
  const showProducts = products && products.length > 0;
  const showEmptyState = !error && (!products || products.length === 0);
  const showErrorState = error;

  // 4. Render the page
  return (
    <main className="min-h-screen bg-gray-50 pb-20">

      {/* Hero Section – using semantic <header> */}
      <header
        className="text-white py-16 px-4 text-center shadow-md"
        style={{ backgroundColor: SHOP_CONFIG.themeColor }}
      >
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">
          Welcome to {SHOP_CONFIG.name}
        </h1>
        <p className="text-lg opacity-90 max-w-xl mx-auto">
          Authentic, fresh, and delicious. Add your favorite treats to the cart
          and order instantly via WhatsApp!
        </p>
      </header>

      {/* Product Grid Section */}
      <div className="max-w-5xl mx-auto px-4 mt-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
          Our Fresh Sweets
        </h2>

        {/* Error State */}
        {showErrorState && (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
            <p className="text-red-500 text-lg">
              ⚠️ Unable to load products at the moment.
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Please refresh the page or try again later.
            </p>
          </div>
        )}

        {/* Empty State */}
        {showEmptyState && (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-500 text-lg">
              No sweets available right now. Please check back later!
            </p>
            <p className="text-sm text-gray-400 mt-2">
              (Admin: Add some products in your Supabase database to see them here)
            </p>
          </div>
        )}

        {/* Product Grid */}
        {showProducts && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product: Product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                unit={product.unit}
                imageUrl={product.image_url || '/placeholder-image.jpg'} // Fallback for missing images
                step_interval={product.step_interval}
                min_quantity={product.min_quantity}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}