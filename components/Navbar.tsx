// components/Navbar.tsx
'use client';

import Link from 'next/link';
import { ShoppingCart, User } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { SHOP_CONFIG } from '@/lib/config';

export default function Navbar() {
  // Get cart items and calculate total quantity
  const items = useCartStore((state) => state.items);
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Shop name – links to homepage */}
        <Link
          href="/"
          className="font-extrabold text-2xl tracking-tight text-gray-900 hover:text-gray-700 transition-colors"
        >
          {SHOP_CONFIG.name}
        </Link>

        {/* Action icons */}
        <div className="flex items-center gap-2">
          {/* Admin link */}
          <Link
            href="/admin"
            className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
            aria-label="Admin Login"
          >
            <User size={24} />
          </Link>

          {/* Cart link with badge */}
          <Link
            href="/cart"
            className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
            aria-label="View cart"
          >
            <ShoppingCart size={24} />
            {totalItems > 0 && (
              <span
                className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white rounded-full"
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