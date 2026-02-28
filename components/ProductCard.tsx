'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useCartStore } from '../lib/store';
import { SHOP_CONFIG } from '../lib/config';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProductProps {
  id: string;
  name: string;
  price: number;
  unit: string;
  imageUrl?: string | null;
  step_interval?: number;
  min_quantity?: number;
}

// Maximum quantity a customer can select (prevents absurd orders)
const MAX_QUANTITY = 100;

export default function ProductCard({
  id,
  name,
  price,
  unit,
  imageUrl,
  step_interval = 1,
  min_quantity = 1
}: ProductProps) {
  const addItem = useCartStore((state) => state.addItem);

  // Start the selector at the product's minimum quantity
  const [selectedQuantity, setSelectedQuantity] = useState<number>(min_quantity);

  const handleDecrease = () => {
    setSelectedQuantity((prev) => Math.max(min_quantity, prev - step_interval));
  };

  const handleIncrease = () => {
    setSelectedQuantity((prev) => Math.min(MAX_QUANTITY, prev + step_interval));
  };

  const handleAddToCart = () => {
    addItem({
      id,
      name,
      price,
      quantity: selectedQuantity,
      unit,
      step_interval,
      min_quantity,
    });
    toast.success(`${selectedQuantity} ${unit} ${name} added to cart!`);
    // Reset back to minimum
    setSelectedQuantity(min_quantity);
  };

  // Safe Math to handle weird JS floating point issues (e.g. 0.1 + 0.2)
  const displayPrice = (price * selectedQuantity).toFixed(2).replace(/\.00$/, '');

  const hasImage = imageUrl && imageUrl !== '/placeholder-image.jpg';

  return (
    <div className="border border-gray-100 rounded-lg sm:rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white flex flex-col h-full">
      {/* Image section */}
      <div className="aspect-[4/3] sm:aspect-square bg-gray-50 relative border-b border-gray-100">
        {hasImage ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, 25vw"
            className="object-cover"
            loading="lazy"
            priority={false}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-gray-400 font-medium text-sm">
            No Image
          </div>
        )}
      </div>

      {/* Details section */}
      <div className="p-2.5 sm:p-4 flex flex-col flex-grow">
        <h3 className="font-bold text-sm sm:text-lg text-gray-800 mb-0.5 sm:mb-1 leading-tight line-clamp-2">{name}</h3>
        <p className="text-gray-500 text-xs sm:text-sm mb-2 sm:mb-4">
          Base: {SHOP_CONFIG.currency}{price} / {unit}
        </p>

        {/* Quantity Selector & Add Button Pushed to Bottom */}
        <div className="mt-auto">
          {/* Quantity Controls */}
          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-0.5 sm:p-1 mb-2 sm:mb-3 border border-gray-200">
            <button
              onClick={handleDecrease}
              onTouchEnd={(e) => { e.preventDefault(); handleDecrease(); }}
              disabled={selectedQuantity <= min_quantity}
              aria-label="Decrease quantity"
              className="p-2 sm:p-3 text-gray-600 hover:text-red-600 active:text-red-600 disabled:opacity-30 disabled:hover:text-gray-600 transition-colors cursor-pointer select-none"
            >
              <Minus className="w-3.5 h-3.5 sm:w-[18px] sm:h-[18px]" />
            </button>

            <div className="font-bold text-gray-900 text-center flex-1 text-xs sm:text-base">
              {selectedQuantity} <span className="text-[10px] sm:text-xs font-normal text-gray-500">{unit}</span>
            </div>

            <button
              onClick={handleIncrease}
              onTouchEnd={(e) => { e.preventDefault(); handleIncrease(); }}
              disabled={selectedQuantity >= MAX_QUANTITY}
              aria-label="Increase quantity"
              className="p-2 sm:p-3 text-gray-600 hover:text-red-600 active:text-red-600 disabled:opacity-30 transition-colors cursor-pointer select-none"
            >
              <Plus className="w-3.5 h-3.5 sm:w-[18px] sm:h-[18px]" />
            </button>
          </div>

          {/* Price & Add to Cart */}
          <button
            onClick={handleAddToCart}
            onTouchEnd={(e) => { e.preventDefault(); handleAddToCart(); }}
            className="w-full flex items-center justify-between text-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg font-bold transition-all hover:opacity-90 active:scale-95 active:opacity-90 shadow-sm cursor-pointer select-none text-xs sm:text-sm"
            style={{ backgroundColor: SHOP_CONFIG.themeColor }}
          >
            <span>{SHOP_CONFIG.currency}{displayPrice}</span>
            <span className="flex items-center gap-1 text-[10px] sm:text-sm bg-white/20 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md">
              <ShoppingCart className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Add
            </span>
          </button>
        </div>

      </div>
    </div>
  );
}