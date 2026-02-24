'use client';

import { useState, useEffect } from 'react';
import { create } from 'zustand';
import { ShoppingBag } from 'lucide-react';

interface ToastState {
    message: string | null;
    isVisible: boolean;
    showToast: (message: string) => void;
    hideToast: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
    message: null,
    isVisible: false,
    showToast: (message) => {
        set({ message, isVisible: true });
        setTimeout(() => {
            set({ isVisible: false });
        }, 3000);
    },
    hideToast: () => set({ isVisible: false }),
}));

export function Toast() {
    const { message, isVisible } = useToastStore();
    const [shouldRender, setShouldRender] = useState(false);
    useEffect(() => {
        if (isVisible) {
            // Use setTimeout to avoid synchronous cascading renders during effect cleanup/setup
            const timer = setTimeout(() => setShouldRender(true), 0);
            return () => clearTimeout(timer);
        }
    }, [isVisible]);

    if (!shouldRender) return null;

    return (
        <div
            className={`fixed bottom-4 right-4 z-[100] bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 transition-all duration-300 ease-in-out ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                }`}
            onTransitionEnd={() => {
                if (!isVisible) setShouldRender(false);
            }}
        >
            <div className="bg-green-500 rounded-full p-1">
                <ShoppingBag size={14} className="text-white" />
            </div>
            <span className="font-medium text-sm">{message}</span>
        </div>
    );
}
