# Girish Sweets Sweets Shop

A modern, responsive, and user-friendly e-commerce platform for Girish Sweets, specializing in authentic Indian sweets and namkeen. This application allows customers to browse products, manage a shopping cart, and place orders directly via WhatsApp.

## 🚀 Features

- **Storefront**: Clean and intuitive interface for browsing sweets and snacks.
- **Product Categories**: Easy filtering by categories like Sweets, Namkeen, Sugar-Free, and more.
- **WhatsApp Integration**: seamless checkout process where orders are sent directly to the shop's WhatsApp.
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
   cd girish-sweets
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

- **Admin Email**: admin@girishsweets.in
- **Management**: Authentication and user credentials are managed via the **Supabase Dashboard** under the **Authentication** section. To set or reset the password for the admin account, use the Supabase Auth UI.

## 📁 Project Structure

- app/: Next.js App Router pages and layouts.
- components/: Reusable UI components.
- lib/: Utility functions, configurations, and Supabase client.
- public/: Static assets like images and fonts.
- supabase/: Database migrations and seed scripts.

## 📄 License

This project is licensed under the MIT License.
