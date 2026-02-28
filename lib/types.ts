// lib/types.ts
// Shared types used across the application

export interface Product {
    id: string;
    name: string;
    price: number;
    unit: string;
    category: string;
    image_url: string | null;
    is_out_of_stock: boolean;
    step_interval: number;
    min_quantity: number;
    created_at: string;
    updated_at?: string;
}

export interface CartItem {
    id: string;          // Unique product ID (from Supabase)
    name: string;        // Product name
    price: number;       // Price per unit
    quantity: number;    // Number of units (e.g., 0.5 for half kg, 10 for pieces)
    unit: string;        // Unit type (kg, piece, dozen, etc.) – for display
    step_interval: number; // Step size for quantity controls
    min_quantity: number;  // Minimum allowed quantity
}

export interface OrderItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    unit: string;
}

export interface Order {
    id: string;
    customer_name: string | null;
    customer_phone: string | null;
    items: {
        itemsList: OrderItem[];
        orderType: string;
        address: string | null;
    };
    total_amount: number;
    status: 'pending' | 'completed' | 'cancelled';
    created_at: string;
    updated_at?: string;
}
