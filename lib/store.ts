// lib/store.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from './types';

// Re-export CartItem for convenience
export type { CartItem };

// Helper to round to 2 decimal places and avoid floating point issues
function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

// Define the store state and actions
interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}

// Create the store with persistence
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      // Initial state: empty cart
      items: [],

      // Add an item to the cart
      addItem: (newItem) => {
        const currentItems = get().items;
        const existingItem = currentItems.find((item) => item.id === newItem.id);

        if (existingItem) {
          // If the item already exists, increase its quantity by the new quantity
          set({
            items: currentItems.map((item) =>
              item.id === newItem.id
                ? { ...item, quantity: round2(item.quantity + newItem.quantity) }
                : item
            ),
          });
        } else {
          // Otherwise, add the new item
          set({ items: [...currentItems, newItem] });
        }
      },

      // Remove an item by its ID
      removeItem: (id) =>
        set({ items: get().items.filter((item) => item.id !== id) }),

      // Update the quantity of a specific item
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          // Remove the item if quantity hits zero
          set({ items: get().items.filter((item) => item.id !== id) });
        } else {
          set({
            items: get().items.map((item) =>
              item.id === id ? { ...item, quantity: round2(quantity) } : item
            ),
          });
        }
      },

      // Empty the cart
      clearCart: () => set({ items: [] }),

      // Calculate the total price of all items in the cart (rounded to avoid floating point)
      getTotal: () =>
        round2(get().items.reduce((total, item) => total + round2(item.price * item.quantity), 0)),
    }),
    {
      // Name of the storage key (used in localStorage)
      name: 'sweet-shop-cart',
    }
  )
);