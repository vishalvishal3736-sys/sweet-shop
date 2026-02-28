// app/admin/(authenticated)/orders/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { SHOP_CONFIG } from '@/lib/config';
import { Clock, CheckCircle2, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Order } from '@/lib/types';

const ORDERS_PER_PAGE = 20;

export default function AdminOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalCount, setTotalCount] = useState(0);

    const fetchOrders = useCallback(async () => {
        setLoading(true);

        // Get total count for pagination
        const { count } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true });

        setTotalCount(count || 0);

        // Fetch current page
        const from = page * ORDERS_PER_PAGE;
        const to = from + ORDERS_PER_PAGE - 1;

        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false })
            .range(from, to);

        if (error) console.error('Error fetching orders:', error.message);
        else setOrders(data || []);

        setLoading(false);
    }, [page]);

    useEffect(() => {
        const timeoutId = setTimeout(() => fetchOrders(), 0);

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
            clearTimeout(timeoutId);
            supabase.removeChannel(channel);
        };
    }, [fetchOrders]);

    async function updateOrderStatus(id: string, newStatus: string) {
        const { error } = await supabase
            .from('orders')
            .update({ status: newStatus })
            .eq('id', id);

        if (error) toast.error('Error updating order: ' + error.message);
        else fetchOrders();
    }

    const totalPages = Math.ceil(totalCount / ORDERS_PER_PAGE);

    // Loading skeleton
    if (loading) {
        return (
            <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-800">Order History</h2>
                <div className="grid gap-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <div className="skeleton h-4 w-32 mb-2"></div>
                                    <div className="skeleton h-6 w-24"></div>
                                </div>
                                <div className="skeleton h-8 w-24 rounded-full"></div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                <div className="skeleton h-4 w-48"></div>
                                <div className="skeleton h-4 w-36"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Order History</h2>
                {totalCount > 0 && (
                    <span className="text-sm text-gray-500">{totalCount} total order{totalCount !== 1 ? 's' : ''}</span>
                )}
            </div>

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
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <span className="text-sm font-mono text-gray-500">#{order.id.split('-')[0]}</span>
                                        <span className="text-xs text-gray-400">
                                            {new Date(order.created_at).toLocaleString()}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-lg text-gray-800 mt-1">
                                        Total: {SHOP_CONFIG.currency}{order.total_amount}
                                    </h3>
                                    {/* Customer info */}
                                    {(order.customer_name || order.customer_phone) && (
                                        <p className="text-sm text-gray-600 mt-1">
                                            {order.customer_name && <span className="font-medium">👤 {order.customer_name}</span>}
                                            {order.customer_phone && <span className="ml-2">📞 {order.customer_phone}</span>}
                                        </p>
                                    )}
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
                                <h4 className="text-sm font-bold text-gray-700 mb-2">
                                    Order Items
                                    <span className="ml-2 text-xs font-normal text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                                        Type: {order.items.orderType}
                                    </span>
                                </h4>
                                {order.items.address && (
                                    <div className="mb-3 text-sm text-gray-600 bg-white p-2 rounded border border-gray-100">
                                        <strong>Address:</strong><br />
                                        <span className="whitespace-pre-wrap">{order.items.address}</span>
                                    </div>
                                )}
                                <div className="space-y-2">
                                    {(order.items.itemsList || []).map((item, idx) => (
                                        <div key={idx} className="flex justify-between text-sm">
                                            <span className="text-gray-600">
                                                <span className="font-medium mr-2 text-gray-800">{item.quantity} {item.unit}</span>
                                                x {item.name}
                                            </span>
                                            <span className="text-gray-900 font-medium whitespace-nowrap">
                                                {SHOP_CONFIG.currency}{(item.price * item.quantity).toFixed(2).replace(/\.00$/, '')}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 pt-4 border-t">
                    <button
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        disabled={page === 0}
                        className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft size={16} /> Previous
                    </button>
                    <span className="text-sm text-gray-500">
                        Page {page + 1} of {totalPages}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                        disabled={page >= totalPages - 1}
                        className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        Next <ChevronRight size={16} />
                    </button>
                </div>
            )}
        </div>
    );
}
