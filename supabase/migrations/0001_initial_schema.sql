-- Migration: 0001_initial_schema
-- Description: Creates the initial schema for products, shop settings, and orders.

-- 1. Create `products` table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    price NUMERIC NOT NULL,
    unit TEXT NOT NULL,
    image_url TEXT,
    is_out_of_stock BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Product Policies
-- Anyone can read products
CREATE POLICY "Public profiles are viewable by everyone."
  ON public.products FOR SELECT
  USING (true);

-- Only authenticated users (admins) can modify products
CREATE POLICY "Authenticated users can insert products"
  ON public.products FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update products"
  ON public.products FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete products"
  ON public.products FOR DELETE TO authenticated USING (true);


-- 2. Create `shop_settings` table
CREATE TABLE IF NOT EXISTS public.shop_settings (
    id INTEGER PRIMARY KEY,
    whatsapp_number TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Basic row data for settings (id = 1)
INSERT INTO public.shop_settings (id, whatsapp_number) 
VALUES (1, '918619418106')
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on shop_settings
ALTER TABLE public.shop_settings ENABLE ROW LEVEL SECURITY;

-- Shop Settings Policies
-- Anyone can read settings
CREATE POLICY "Settings viewable by everyone"
  ON public.shop_settings FOR SELECT
  USING (true);

-- Only authenticated users (admins) can modify settings
CREATE POLICY "Authenticated users can update settings"
  ON public.shop_settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);


-- 3. Create `orders` table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    items JSONB NOT NULL,
    total_amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Orders Policies
-- Anyone can insert an order (when checking out via cart)
CREATE POLICY "Anyone can insert orders"
  ON public.orders FOR INSERT
  WITH CHECK (true);

-- Only authenticated users (admins) can view order history and update statuses
CREATE POLICY "Admins can view all orders"
  ON public.orders FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can update orders"
  ON public.orders FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
  
CREATE POLICY "Admins can delete orders"
  ON public.orders FOR DELETE TO authenticated USING (true);


-- 4. Set up Storage for Product Images
-- Note: Replace with actual code to create a bucket if doing this from dashboard or SQL
-- insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true);
-- CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'product-images' );
-- CREATE POLICY "Admin Upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK ( bucket_id = 'product-images' );
-- CREATE POLICY "Admin Delete" ON storage.objects FOR DELETE TO authenticated USING ( bucket_id = 'product-images' );
