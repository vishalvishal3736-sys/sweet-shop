// app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Toast } from "@/components/Toast";
import { SHOP_CONFIG } from "@/lib/config";

// Load the Inter font (clean, modern sans‑serif)
const inter = Inter({ subsets: ["latin"] });

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
        {/* Navbar appears on every page */}
        <Navbar />

        {/* Page‑specific content (homepage, cart, etc.) */}
        {children}

        {/* Global Toast Notification */}
        <Toast />
      </body>
    </html>
  );
}