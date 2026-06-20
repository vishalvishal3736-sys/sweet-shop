# sweet shop

A modern, responsive, and user-friendly e-commerce platform for sweet shop, specializing in authentic Indian sweets and namkeen. This application allows customers to browse products, manage a shopping cart, and place orders directly via WhatsApp.

## 🚀 Features

- **Storefront**: Clean and intuitive interface for browsing sweets and snacks.
- **Product Categories**: Easy filtering by categories like Sweets, Namkeen, Sugar-Free, and more.
- **WhatsApp Integration**: Seamless checkout process where orders are sent directly to the shop's WhatsApp.
- **Admin Dashboard**: Secure area for shop owners to manage products, view orders, and update shop settings.
- **Responsive Design**: Optimized for mobile, tablet, and desktop devices.
- **Real-time Updates**: Powered by Supabase for instant data synchronization.

## 🛠️ Tech Stack

- **Frontend**: [Next.js 15](https://nextjs.org/) (App Router), [React](https://reactjs.org/), [Tailwind CSS](https://tailwindcss.com/)
- **Backend**: [Supabase](https://supabase.com/) (PostgreSQL, Auth, Storage)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Notifications**: [React Hot Toast](https://react-hot-toast.com/)

## 🏁 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm, yarn, pnpm, or bun
- A Supabase project

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd sweets-shop
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a .env.local file in the root directory and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) to view the site.

## 🗄️ Database Setup (Supabase)

To use this project personally, you need to set up your own Supabase project:

1. **Create a Supabase Project**: Go to [supabase.com](https://supabase.com/) and create a new project.
2. **Run Migrations**: Open the **SQL Editor** in your Supabase dashboard and run the scripts found in `supabase/migrations/` in order (0001 to 0008). This will create the necessary tables (products, orders, shop_settings) and set up Row Level Security (RLS) policies.
3. **Storage Bucket**:
   - Go to **Storage** in Supabase.
   - Create a new public bucket named `product-images`.
   - Ensure the RLS policies for storage allow public read access and authenticated upload/delete (refer to `supabase/migrations/0007_storage_bucket.sql`).
4. **Seed Data (Optional)**: Run the script in `supabase/seed_products.sql` to populate your shop with initial items.

## 🔐 Admin Access

The admin dashboard is located at /admin.

- **Admin Email**: admin@sweetshop.com (You can change this in the database or during initial setup).
- **Management**: Authentication and user credentials are managed via the **Supabase Dashboard** under the **Authentication** section. Create a user with the admin email and set a password.

## 📁 Project Structure

- app/: Next.js App Router pages and layouts.
- components/: Reusable UI components.
- lib/: Utility functions, configurations, and Supabase client.
- public/: Static assets.
- supabase/: Database migrations and seed scripts.

## 📱 Mobile Compatibility

The site is fully responsive and optimized for mobile devices. The admin panel supports mobile photo uploads directly from your phone's camera or gallery when adding new products.

## 📄 License

This project is licensed under the MIT License.
