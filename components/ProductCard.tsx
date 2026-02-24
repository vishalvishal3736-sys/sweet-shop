'use client';

import React, { useState } from 'react';
import { useCartStore } from '../lib/store';
import { SHOP_CONFIG } from '../lib/config';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { useToastStore } from './Toast';

interface ProductProps {
  id: string;
  name: string;
  price: number;
  unit: string;
  imageUrl?: string | null;
  step_interval?: number;
  min_quantity?: number;
}

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
  const showToast = useToastStore((state) => state.showToast);

  // Start the selector at the product's minimum quantity
  const [selectedQuantity, setSelectedQuantity] = useState<number>(min_quantity);

  const handleDecrease = () => {
    setSelectedQuantity((prev) => Math.max(min_quantity, prev - step_interval));
  };

  const handleIncrease = () => {
    setSelectedQuantity((prev) => prev + step_interval);
  };

  const handleAddToCart = () => {
    addItem({ id, name, price, quantity: selectedQuantity, unit });
    showToast(`${selectedQuantity} ${unit} ${name} added to cart!`);
    // Optionally reset back to minimum
    setSelectedQuantity(min_quantity);
  };

  // Safe Math to handle weird JS floating point issues (e.g. 0.1 + 0.2)
  const displayPrice = (price * selectedQuantity).toFixed(2).replace(/\.00$/, '');

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white flex flex-col h-full">
      {/* Image section */}
      <div className="aspect-square bg-gray-50 relative border-b border-gray-100">
        {imageUrl && imageUrl !== '/placeholder-image.jpg' ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={name}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-gray-400 font-medium text-sm">
            No Image
          </div>
        )}
      </div>

      {/* Details section */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-bold text-lg text-gray-800 mb-1 leading-tight">{name}</h3>
        <p className="text-gray-500 text-sm mb-4">
          Base: {SHOP_CONFIG.currency}{price} / {unit}
        </p>

        {/* Quantity Selector & Add Button Pushed to Bottom */}
        <div className="mt-auto">
          {/* Quantity Controls */}
          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-1 mb-3 border border-gray-200">
            <button
              onClick={handleDecrease}
              disabled={selectedQuantity <= min_quantity}
              className="p-2 text-gray-600 hover:text-blue-600 disabled:opacity-30 disabled:hover:text-gray-600 transition-colors"
            >
              <Minus size={18} />
            </button>

            <div className="font-bold text-gray-900 text-center flex-1">
              {selectedQuantity} <span className="text-xs font-normal text-gray-500">{unit}</span>
            </div>

            <button
              onClick={handleIncrease}
              className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Plus size={18} />
            </button>
          </div>

          {/* Price & Add to Cart */}
          <button
            onClick={handleAddToCart}
            className="w-full flex items-center justify-between text-white px-4 py-2.5 rounded-lg font-bold transition-all hover:opacity-90 active:scale-95 shadow-sm"
            style={{ backgroundColor: SHOP_CONFIG.themeColor }}
          >
            <span>{SHOP_CONFIG.currency}{displayPrice}</span>
            <span className="flex items-center gap-1 text-sm bg-white/20 px-2.5 py-1 rounded-md">
              <ShoppingCart size={14} /> Add
            </span>
          </button>
        </div>

      </div>
    </div>
  );
}