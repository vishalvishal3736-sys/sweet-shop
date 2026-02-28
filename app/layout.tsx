// app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { SHOP_CONFIG } from "@/lib/config";

// Load the Inter font (clean, modern sans‑serif) — swap prevents invisible text during load
const inter = Inter({ subsets: ["latin"], display: "swap" });

// Set the page title and description for SEO / browser tabs
export const metadata: Metadata = {
  title: `${SHOP_CONFIG.name} | Fresh Sweets Online`,
  description: "Order fresh, authentic sweets online and checkout via WhatsApp.",
  openGraph: {
    title: `${SHOP_CONFIG.name} | Delicious Sweets Delivered`,
    description: "Browse our authentic selection of fresh sweets and snacks. Order easily via WhatsApp today!",
    type: "website",
    locale: "en_IN",
    siteName: SHOP_CONFIG.name,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SHOP_CONFIG.name} | Fresh Sweets Online`,
    description: "Order fresh, authentic sweets online and checkout via WhatsApp.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>

        {/* Page‑specific content (homepage, cart, admin, etc.) */}
        {children}

        {/* Global Toast Notification */}
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: '#333',
              color: '#fff',
              borderRadius: '10px',
            },
            success: {
              iconTheme: { primary: '#4ade80', secondary: '#fff' },
            },
          }}
        />
      </body>
    </html>
  );
}