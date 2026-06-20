# 🏪 The Sweets Shop

[![Next.js](https://img.shields.io/badge/Framework-Next.js%2015-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Database-Supabase-blueviolet?style=flat-square&logo=supabase)](https://supabase.com/)
[![React](https://img.shields.io/badge/Frontend-React%2019-blue?style=flat-square&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS%204-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

A modern, highly-responsive, and visually stunning e-commerce web application built for **The Sweets Shop**, specializing in premium authentic Indian sweets, namkeen, and festive treats. Customers can easily browse products by category, manage a dynamic shopping cart, and place orders directly to the store via WhatsApp integration.

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

## 🏁 Step-by-Step Personal Setup & Database Configuration

Follow these comprehensive steps to clone the repository and connect it to your own Supabase project:

### 1. Prerequisites
Ensure you have the following installed locally:
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- npm, yarn, pnpm, or bun package manager
- A free account on [Supabase](https://supabase.com/)

### 2. Local Installation
Clone the repository and install all dependencies:
```bash
git clone https://github.com/vishalvishal3736-sys/sweet-shop.git
cd sweet-shop
npm install
```

### 3. Create a Supabase Project
1. Log into your [Supabase Dashboard](https://supabase.com/dashboard) and click **New Project**.
2. Set a project name, choose a database password, select the nearest hosting region, and click **Create New Project**.
3. Wait a few minutes for the database instance to spin up.

### 4. Database Schema Setup
To build the required database tables (`products`, `orders`, `shop_settings`) and set up Row Level Security (RLS) policies:
1. In your Supabase Project Sidebar, click on the **SQL Editor** icon.
2. Click **New query**.
3. Copy the SQL statements from each migration script located in the `supabase/migrations/` folder, paste them into the SQL editor, and run them sequentially from **0001 to 0008**.
4. *(Optional)* To populate your storefront with the default sweet items, open a new SQL editor query, paste the contents of `supabase/seed_products.sql`, and run it.

### 5. Setup Storage Bucket (Product Images)
To allow the admin panel to upload images:
1. Navigate to the **Storage** tab in your Supabase dashboard.
2. Click **New bucket**.
3. Enter `product-images` as the bucket name.
4. **Important:** Enable the **Public** toggle so that customers can view the images without needing authentication.
5. Storage RLS policies (from `supabase/migrations/0007_storage_bucket.sql`) will automatically govern security once created.

### 6. Admin Authentication Credentials
To log into the `/admin` portal:
1. Go to the **Authentication** tab in your Supabase dashboard.
2. Under the **Users** section, click **Add User** -> **Create User**.
3. Enter the email `admin@sweetshop.com` (or any other custom email) and specify a secure password.
4. Ensure the **Confirm User** toggle is checked (so that no email verification is required), then click **Create User**.

### 7. Configure Environment Variables
Create a file named `.env.local` in the root of your project directory and add your unique project API parameters:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anonymous-key
```
*Note: You can retrieve these values in Supabase under **Project Settings** -> **API**.*

### 8. Run the App
Launch the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to see your personal storefront, and go to `/admin` to log into your dashboard!

---

## 📱 Mobile Compatibility & Camera Uploads

This application is built with mobile-first responsiveness in mind:
- **Responsive Layout**: Designed to display a 2-column product grid on smaller screens and automatically expand to 3 or 4 columns on desktops.
- **Horizontal Categories Swiping**: Swipe through product categories easily on mobile touchscreens.
- **Mobile Admin Sidebar**: Includes a responsive slide-out hamburger navigation menu for the admin page.
- **Direct Camera Photo Uploads**: Tapping the upload area in the admin panel on a mobile device automatically prompts the operating system to offer options for opening the **Camera** to capture a fresh photo, or selecting from the **Photo Library**. Uploaded images are automatically compressed on-device using the HTML5 Canvas API before sending them to Supabase to save network bandwidth.

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
