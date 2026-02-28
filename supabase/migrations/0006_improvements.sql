-- Migration: 0006_improvements
-- Description: Adds customer_name, customer_phone, and updated_at columns.
-- Also fixes the RLS policies to use TO authenticated instead of hardcoded email.
-- ============================================================
-- 1. Add customer_name and customer_phone to orders
-- ============================================================
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS customer_name TEXT,
    ADD COLUMN IF NOT EXISTS customer_phone TEXT;
-- ============================================================
-- 2. Add updated_at column to products and orders
-- ============================================================
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
-- Auto-update the updated_at column on products when a row is modified
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = timezone('utc'::text, now());
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER set_products_updated_at BEFORE
UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_orders_updated_at BEFORE
UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- ============================================================
-- 3. Fix RLS Policies — revert to "any authenticated user" approach
--    (The hardcoded email in 0005 likely blocks all admin operations)
-- ============================================================
-- Products: drop ALL possible policy names (from 0001 and 0005), then recreate
DROP POLICY IF EXISTS "Admin can insert products" ON public.products;
DROP POLICY IF EXISTS "Admin can update products" ON public.products;
DROP POLICY IF EXISTS "Admin can delete products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can insert products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can update products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can delete products" ON public.products;
CREATE POLICY "Authenticated users can insert products" ON public.products FOR
INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update products" ON public.products FOR
UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete products" ON public.products FOR DELETE TO authenticated USING (true);
-- Orders: drop ALL possible policy names (from 0001 and 0005), then recreate
DROP POLICY IF EXISTS "Admin can view orders" ON public.orders;
DROP POLICY IF EXISTS "Admin can update orders" ON public.orders;
DROP POLICY IF EXISTS "Admin can delete orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can delete orders" ON public.orders;
DROP POLICY IF EXISTS "Authenticated users can view orders" ON public.orders;
DROP POLICY IF EXISTS "Authenticated users can update orders" ON public.orders;
DROP POLICY IF EXISTS "Authenticated users can delete orders" ON public.orders;
CREATE POLICY "Authenticated users can view orders" ON public.orders FOR
SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can update orders" ON public.orders FOR
UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete orders" ON public.orders FOR DELETE TO authenticated USING (true);
-- Shop Settings: drop ALL possible policy names, then recreate
DROP POLICY IF EXISTS "Admin can update settings" ON public.shop_settings;
DROP POLICY IF EXISTS "Admin can insert settings" ON public.shop_settings;
DROP POLICY IF EXISTS "Authenticated users can update settings" ON public.shop_settings;
DROP POLICY IF EXISTS "Authenticated users can insert settings" ON public.shop_settings;
CREATE POLICY "Authenticated users can update settings" ON public.shop_settings FOR
UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can insert settings" ON public.shop_settings FOR
INSERT TO authenticated WITH CHECK (true);