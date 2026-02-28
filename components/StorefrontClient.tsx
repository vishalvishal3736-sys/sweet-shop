'use client';

import { useState, useMemo } from 'react';
import ProductCard from './ProductCard';
import { Search } from 'lucide-react';
import { SHOP_CONFIG } from '@/lib/config';
import { useCartStore } from '@/lib/store';
import Link from 'next/link';

interface Product {
    id: string;
    name: string;
    price: number;
    unit: string;
    category?: string;
    image_url: string | null;
    is_out_of_stock: boolean;
    step_interval?: number;
    min_quantity?: number;
}

export default function StorefrontClient({ products }: { products: Product[] }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');

    // Cart state for sticky bar
    const cartItems = useCartStore((state) => state.items);
    const getTotal = useCartStore((state) => state.getTotal);

    // Extract unique categories from products
    const categories = useMemo(() => {
        const cats = new Set(products.map(p => p.category || 'Sweets'));
        return ['All', ...Array.from(cats)];
    }, [products]);

    // Filter products based on search and category
    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === 'All' || (product.category || 'Sweets') === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [products, searchQuery, selectedCategory]);

    return (
        <div className="max-w-5xl mx-auto px-3 sm:px-4 mt-4 sm:mt-8 pb-24">
            {/* Search and Filter Section */}
            <div className="mb-4 sm:mb-8 space-y-3 sm:space-y-4">
                {/* Search Bar */}
                <div className="relative max-w-md mx-auto md:mx-0">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2.5 sm:py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:border-blue-500 text-sm sm:text-sm transition-shadow shadow-sm focus:shadow-md"
                        placeholder="Search for sweets, snacks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Category Filters */}
                <div className="flex overflow-x-auto pb-2 -mx-3 px-3 sm:-mx-4 sm:px-4 md:mx-0 md:px-0 hide-scrollbar gap-1.5 sm:gap-2">
                    {categories.map(category => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            onTouchEnd={(e) => { e.preventDefault(); setSelectedCategory(category); }}
                            className={`chip-btn whitespace-nowrap px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer select-none ${selectedCategory === category
                                ? 'text-white shadow-md'
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 active:bg-gray-100 hover:border-gray-300'
                                }`}
                            style={selectedCategory === category ? { backgroundColor: SHOP_CONFIG.themeColor } : {}}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 border-b pb-2">
                {selectedCategory === 'All' ? 'Our Fresh Selection' : selectedCategory}
            </h2>

            {/* Product Grid */}
            {filteredProducts.length > 0 ? (
                <div className="product-grid grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                    {filteredProducts.map((product) => (
                        <ProductCard
                            key={product.id}
                            id={product.id}
                            name={product.name}
                            price={product.price}
                            unit={product.unit}
                            imageUrl={product.image_url}
                            step_interval={product.step_interval}
                            min_quantity={product.min_quantity}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
                    <p className="text-gray-500 text-lg">
                        No items found matching your criteria.
                    </p>
                    <button
                        onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                        className="mt-4 text-blue-600 hover:underline font-medium"
                    >
                        Clear filters
                    </button>
                </div>
            )}

            {/* Sticky Mobile Cart Bar */}
            {cartItems.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
                    <Link href="/cart">
                        <div
                            className="mx-3 sm:mx-4 mb-3 sm:mb-4 rounded-xl shadow-lg px-4 sm:px-5 py-3 sm:py-3.5 flex items-center justify-between text-white"
                            style={{ backgroundColor: SHOP_CONFIG.themeColor }}
                        >
                            <div className="flex items-center gap-2">
                                <span className="bg-white/20 px-1.5 sm:px-2 py-0.5 rounded-md text-xs sm:text-sm font-bold">
                                    {cartItems.length} item{cartItems.length > 1 ? 's' : ''}
                                </span>
                                <span className="text-xs sm:text-sm opacity-90">in cart</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-base sm:text-lg">{SHOP_CONFIG.currency}{getTotal()}</span>
                                <span className="text-xs sm:text-sm bg-white/20 px-2 sm:px-2.5 py-1 rounded-md font-medium">View →</span>
                            </div>
                        </div>
                    </Link>
                </div>
            )}
        </div>
    );
}
