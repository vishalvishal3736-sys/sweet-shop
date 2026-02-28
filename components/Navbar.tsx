// components/Navbar.tsx
'use client';

import Link from 'next/link';
import { ShoppingCart, User } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { SHOP_CONFIG } from '@/lib/config';

export default function Navbar() {
  // Get cart items – show count of distinct products, not quantity sum (avoids decimals like "0.5")
  const items = useCartStore((state) => state.items);
  const totalItems = items.length;

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between">
        {/* Shop name – links to homepage */}
        <Link
          href="/"
          className="font-extrabold text-lg sm:text-2xl tracking-tight text-gray-900 hover:text-gray-700 transition-colors truncate max-w-[60%]"
        >
          {SHOP_CONFIG.name}
        </Link>

        {/* Action icons */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Admin link */}
          <Link
            href="/admin"
            className="p-3 text-gray-600 hover:text-gray-900 active:text-gray-900 transition-colors select-none"
            aria-label="Admin Login"
          >
            <User className="w-5 h-5 sm:w-6 sm:h-6" />
          </Link>

          {/* Cart link with badge */}
          <Link
            href="/cart"
            className="relative p-3 text-gray-600 hover:text-gray-900 active:text-gray-900 transition-colors select-none"
            aria-label="View cart"
          >
            <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
            {totalItems > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 text-[10px] sm:text-xs font-bold text-white rounded-full"
                style={{ backgroundColor: SHOP_CONFIG.themeColor }}
              >
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}