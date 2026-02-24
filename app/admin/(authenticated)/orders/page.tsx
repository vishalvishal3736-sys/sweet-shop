// app/admin/(authenticated)/orders/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { SHOP_CONFIG } from '@/lib/config';
import { Clock, CheckCircle2, XCircle } from 'lucide-react';

interface OrderItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    unit: string;
}

interface Order {
    id: string;
    items: OrderItem[];
    total_amount: number;
    status: 'pending' | 'completed' | 'cancelled';
    created_at: string;
}

export default function AdminOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) console.error('Error fetching orders:', error.message);
        else setOrders(data || []);

        setLoading(false);
    }, []);

    useEffect(() => {
        fetchOrders();

        // Optional: Realtime subscription for new orders
        const channel = supabase
            .channel('custom-all-channel')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'orders' },
                () => {
                    fetchOrders();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchOrders]);

    async function updateOrderStatus(id: string, newStatus: string) {
        const { error } = await supabase
            .from('orders')
            .update({ status: newStatus })
            .eq('id', id);

        if (error) alert('Error updating order: ' + error.message);
        else fetchOrders();
    }

    if (loading) return <div className="text-gray-500">Loading orders...</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800">Order History</h2>

            {orders.length === 0 ? (
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center text-gray-500">
                    No orders yet. They will appear here when customers checkout!
                </div>
            ) : (
                <div className="grid gap-4">
                    {orders.map((order) => (
                        <div key={order.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition hover:shadow-md">
                            <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-4 mb-4 gap-4">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-mono text-gray-500">#{order.id.split('-')[0]}</span>
                                        <span className="text-xs text-gray-400">
                                            {new Date(order.created_at).toLocaleString()}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-lg text-gray-800 mt-1">
                                        Total: {SHOP_CONFIG.currency}{order.total_amount}
                                    </h3>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${order.status === 'completed' ? 'bg-green-100 text-green-700' :
                                        order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                            'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {order.status === 'completed' ? <CheckCircle2 size={14} /> :
                                            order.status === 'cancelled' ? <XCircle size={14} /> :
                                                <Clock size={14} />}
                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                    </span>

                                    {/* Status Action Buttons */}
                                    {order.status === 'pending' && (
                                        <div className="flex gap-2 ml-2">
                                            <button
                                                onClick={() => updateOrderStatus(order.id, 'completed')}
                                                className="p-1.5 text-green-600 bg-green-50 hover:bg-green-100 rounded-md transition"
                                                title="Mark Completed"
                                            >
                                                <CheckCircle2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => updateOrderStatus(order.id, 'cancelled')}
                                                className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition"
                                                title="Cancel Order"
                                            >
                                                <XCircle size={18} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Items List */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="text-sm font-bold text-gray-700 mb-2">Order Items</h4>
                                <div className="space-y-2">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between text-sm">
                                            <span className="text-gray-600">
                                                <span className="font-medium mr-2 text-gray-800">{item.quantity} {item.unit}</span>
                                                x {item.name}
                                            </span>
                                            <span className="text-gray-900 font-medium whitespace-nowrap">
                                                {SHOP_CONFIG.currency}{item.price * item.quantity}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
