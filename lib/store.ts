// lib/store.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Define the shape of a cart item
export interface CartItem {
  id: string;          // Unique product ID (from Supabase)
  name: string;        // Product name
  price: number;       // Price per unit
  quantity: number;    // Number of units (e.g., 0.5 for half kg, 10 for pieces)
  unit: string;        // Unit type (kg, piece, dozen, etc.) – for display
}

// Define the store state and actions
interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
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
                ? { ...item, quantity: item.quantity + newItem.quantity }
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

      // Empty the cart
      clearCart: () => set({ items: [] }),

      // Calculate the total price of all items in the cart
      getTotal: () =>
        get().items.reduce((total, item) => total + item.price * item.quantity, 0),
    }),
    {
      // Name of the storage key (used in localStorage)
      name: 'sweet-shop-cart',
    }
  )
);