# 🏪 Girish Sweets Sweets Shop

[![Next.js](https://img.shields.io/badge/Framework-Next.js%2015-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Database-Supabase-blueviolet?style=flat-square&logo=supabase)](https://supabase.com/)
[![React](https://img.shields.io/badge/Frontend-React%2019-blue?style=flat-square&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS%204-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

A modern, highly-responsive, and visually stunning e-commerce web application built for **Girish Sweets Sweets Shop**, specializing in premium authentic Indian sweets, namkeen, and festive treats. Customers can easily browse products by category, manage a dynamic shopping cart, and place orders directly to the store via WhatsApp integration.

---

## ✨ Features

- 🍯 **Premium Storefront**: Clean, interactive, and responsive UI highlighting fresh Indian sweets.
- 📂 **Smart Categories**: Instant client-side filtering (Sweets, Namkeen, Sugar-Free, Festive Specials, Gifts).
- 💬 **WhatsApp Checkout Integration**: Seamless order compilation that formats the shopping cart and sends a pre-filled direct message to the shop's WhatsApp line.
- 🔐 **Admin Control Panel**: Secure management dashboard (`/admin`) for shop owners to create, edit, or delete products, update inventory states, and view customer orders.
- ⚡ **Real-time Synchronization**: Powered by Supabase database & storage for near-instant data updates.
- 📱 **Mobile Optimized**: Adaptive design featuring mobile-first layouts, optimized layouts, and direct camera uploads for product additions on mobile devices.

---

## 🛠️ Tech Stack

- **Frontend Framework**: [Next.js 15](https://nextjs.org/) (App Router & React Server Components)
- **Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Database & Authentication**: [Supabase](https://supabase.com/) (PostgreSQL & Supabase Auth)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) (Persistent Local Storage)
- **Notifications**: [React Hot Toast](https://react-hot-toast.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🏁 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- npm, yarn, pnpm, or bun package manager

### Local Installation

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/vishalvishal3736-sys/sweet-shop.git
   cd sweet-shop
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory and insert your Supabase project parameters:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anonymous-key
   ```

4. **Launch the Development Server:**
   ```bash
   npm run dev
   ```

5. **Access the Application:**
   Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 🗄️ Database & Storage Setup (Supabase)

To link this application to your personal database instance:

1. **Create a Supabase Project:**
   Register and launch a new project on [supabase.com](https://supabase.com/).

2. **Database Migrations:**
   Run the SQL scripts located under `supabase/migrations/` sequentially (0001 through 0008) inside the **Supabase SQL Editor** to construct the tables (`products`, `orders`, `shop_settings`) and initialize Row-Level Security (RLS) policies.

3. **Storage Bucket Setup:**
   - Navigate to the **Storage** tab in your Supabase dashboard.
   - Create a new public bucket named `product-images`.
   - Set the bucket privacy to **Public**.
   - Make sure storage policies allow read access to all users, and write/delete privileges to authenticated users (refer to `supabase/migrations/0007_storage_bucket.sql`).

4. **Seed Sample Data:**
   Run the contents of `supabase/seed_products.sql` in the **SQL Editor** to populate your storefront with authentic product items and local image paths.

---

## 🔐 Admin Dashboard Access

The administrative dashboard can be accessed by navigating to `/admin`.

> [!IMPORTANT]
> **Admin Credentials & Authentication**
> - **Authorized Email:** `admin@girishsweets.in`
> - **Authentication Method:** This project utilizes **Supabase Auth` for administration security. To set up or reset the login password, navigate to the **Authentication** section on your **Supabase Dashboard**, select **Add User** or **Reset Password** for the email `admin@girishsweets.in`.
> - **Rogue Policies Check:** Migrations have been updated so that any authenticated account (such as `admin@girishsweets.in`) can safely edit products and manage settings once logged in.

---

## 📁 Directory Structure

```text
├── app/                  # Next.js App Router (layout, pages, opengraph tags)
│   ├── admin/            # Admin login and dashboard interfaces
│   ├── cart/             # Shopping cart page
│   └── page.tsx          # Storefront homepage
├── components/           # Reusable React components (Navbar, Product Cards, layouts)
├── lib/                  # Utilities, configuration parameters, and Supabase client
│   ├── config.ts         # Central shop configuration (name, theme, etc.)
│   ├── store.ts          # Zustand state store
│   └── supabase.ts       # SSR Supabase client
├── public/               # Static assets
│   └── images/           # High-resolution sweet images
└── supabase/             # Database initialization (migrations and seed SQL)
```

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
