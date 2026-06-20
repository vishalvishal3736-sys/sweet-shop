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
  is_out_of_stock?: boolean;
  quantity_available?: number;
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
  min_quantity = 1,
  is_out_of_stock = false,
  quantity_available = 0,
}: ProductProps) {
  const addItem = useCartStore((state) => state.addItem);
  const cartItems = useCartStore((state) => state.items);

  const isOutOfStock = is_out_of_stock || quantity_available < min_quantity;
  const isLowStock = !isOutOfStock && quantity_available <= min_quantity * 3;

  // Start the selector at the product's minimum quantity
  const [selectedQuantity, setSelectedQuantity] = useState<number>(min_quantity);

  const handleDecrease = () => {
    setSelectedQuantity((prev) => Math.max(min_quantity, prev - step_interval));
  };

  const handleIncrease = () => {
    setSelectedQuantity((prev) => Math.min(quantity_available, MAX_QUANTITY, prev + step_interval));
  };

  const handleAddToCart = () => {
    const existingItem = cartItems.find((item) => item.id === id);
    const existingQty = existingItem ? existingItem.quantity : 0;
    const newQty = existingQty + selectedQuantity;

    if (newQty > quantity_available) {
      if (existingQty >= quantity_available) {
        toast.error(`Cannot add more. You already have all ${quantity_available} ${unit} in your cart.`);
      } else {
        const allowedToAdd = quantity_available - existingQty;
        addItem({
          id,
          name,
          price,
          quantity: allowedToAdd,
          unit,
          step_interval,
          min_quantity,
          quantity_available,
        });
        toast.success(`Added ${allowedToAdd} ${unit} (capped at stock limit of ${quantity_available} ${unit})`);
      }
      return;
    }

    addItem({
      id,
      name,
      price,
      quantity: selectedQuantity,
      unit,
      step_interval,
      min_quantity,
      quantity_available,
    });
    toast.success(`${selectedQuantity} ${unit} ${name} added to cart!`);
    // Reset back to minimum
    setSelectedQuantity(min_quantity);
  };

  // Safe Math to handle weird JS floating point issues (e.g. 0.1 + 0.2)
  const displayPrice = (price * selectedQuantity).toFixed(2).replace(/\.00$/, '');

  const hasImage = imageUrl && imageUrl !== '/placeholder-image.jpg';

  return (
    <div className={`border border-gray-100 rounded-lg sm:rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white flex flex-col h-full ${
      isOutOfStock ? 'opacity-80' : ''
    }`}>
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
        
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[1px]">
            <span className="text-white font-extrabold text-xs sm:text-sm tracking-wider uppercase bg-red-600/90 px-3 py-1 rounded-full shadow-md">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Details section */}
      <div className="p-2.5 sm:p-4 flex flex-col flex-grow">
        <h3 className="font-bold text-sm sm:text-lg text-gray-800 mb-0.5 sm:mb-1 leading-tight line-clamp-2">{name}</h3>
        
        <div className="flex flex-col gap-1 mb-2 sm:mb-4">
          <p className="text-gray-500 text-xs sm:text-sm">
            Base: {SHOP_CONFIG.currency}{price} / {unit}
          </p>
          {isLowStock && (
            <p className="text-amber-700 text-[10px] sm:text-xs font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 w-fit animate-pulse">
              ⚠️ Almost Over! Only {quantity_available} {unit} left
            </p>
          )}
        </div>

        {/* Quantity Selector & Add Button Pushed to Bottom */}
        <div className="mt-auto">
          {/* Quantity Controls */}
          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-0.5 sm:p-1 mb-2 sm:mb-3 border border-gray-200">
            <button
              onClick={handleDecrease}
              onTouchEnd={(e) => { e.preventDefault(); handleDecrease(); }}
              disabled={isOutOfStock || selectedQuantity <= min_quantity}
              aria-label="Decrease quantity"
              className="p-2 sm:p-3 text-gray-600 hover:text-red-600 active:text-red-600 disabled:opacity-30 disabled:hover:text-gray-600 transition-colors cursor-pointer select-none"
            >
              <Minus className="w-3.5 h-3.5 sm:w-[18px] sm:h-[18px]" />
            </button>

            <div className="font-bold text-gray-900 text-center flex-1 text-xs sm:text-base">
              {isOutOfStock ? 0 : selectedQuantity} <span className="text-[10px] sm:text-xs font-normal text-gray-500">{unit}</span>
            </div>

            <button
              onClick={handleIncrease}
              onTouchEnd={(e) => { e.preventDefault(); handleIncrease(); }}
              disabled={isOutOfStock || selectedQuantity >= Math.min(MAX_QUANTITY, quantity_available)}
              aria-label="Increase quantity"
              className="p-2 sm:p-3 text-gray-600 hover:text-red-600 active:text-red-600 disabled:opacity-30 transition-colors cursor-pointer select-none"
            >
              <Plus className="w-3.5 h-3.5 sm:w-[18px] sm:h-[18px]" />
            </button>
          </div>

          {/* Price & Add to Cart */}
          {isOutOfStock ? (
            <button
              disabled
              className="w-full flex items-center justify-center bg-gray-200 text-gray-400 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg font-bold text-xs sm:text-sm cursor-not-allowed select-none border border-gray-300"
            >
              <span>OUT OF STOCK</span>
            </button>
          ) : (
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
          )}
        </div>

      </div>
    </div>
  );
}