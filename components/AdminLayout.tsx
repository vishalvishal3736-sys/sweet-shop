'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { SHOP_CONFIG } from '@/lib/config';
import { LayoutDashboard, ShoppingBag, Settings, LogOut, Menu, X } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      // Use getUser() instead of getSession() — validates with the auth server
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        router.push('/admin');
        return;
      }

      setLoading(false);
    };
    checkUser();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/admin');
  }

  const navLinks = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 font-medium">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-sm border border-gray-200"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } flex flex-col`}
      >
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-xl font-bold tracking-tight text-gray-900" style={{ color: SHOP_CONFIG.themeColor }}>
            {SHOP_CONFIG.name}
          </h1>
          <p className="text-xs text-gray-400 mt-1">Admin Panel</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                  ? 'bg-red-50 text-red-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                style={isActive ? { backgroundColor: `${SHOP_CONFIG.themeColor}15`, color: SHOP_CONFIG.themeColor } : {}}
              >
                <Icon size={20} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className={`flex-1 min-w-0 transition-all duration-200 ease-in-out ${sidebarOpen ? 'md:ml-64' : 'ml-0 md:ml-64'}`}>
        {/* Overlay for mobile when sidebar is open */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/20 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <div className="p-4 sm:p-8 pt-16 md:pt-8 w-full max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
