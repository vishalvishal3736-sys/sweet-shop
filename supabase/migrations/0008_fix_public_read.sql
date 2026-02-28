-- Migration: 0008_fix_public_read
-- Description: Ensures that unauthenticated (anon) users can read products and shop settings on the homepage.
-- 1. Ensure Products are readable by anyone (including unauthenticated users)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.products;
DROP POLICY IF EXISTS "Public products are viewable by everyone" ON public.products;
DROP POLICY IF EXISTS "Anyone can read products" ON public.products;
CREATE POLICY "Anyone can read products" ON public.products FOR
SELECT USING (true);
-- 2. Ensure Shop Settings are readable by anyone (used on homepage/cart for WhatsApp info)
DROP POLICY IF EXISTS "Settings viewable by everyone" ON public.shop_settings;
DROP POLICY IF EXISTS "Anyone can read settings" ON public.shop_settings;
CREATE POLICY "Anyone can read settings" ON public.shop_settings FOR
SELECT USING (true);