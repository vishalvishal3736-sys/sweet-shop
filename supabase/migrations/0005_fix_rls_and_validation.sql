-- Migration: 0005_fix_rls_and_validation
-- Description: Fixes overly permissive RLS policies, adds CHECK constraints,
-- and adds missing INSERT policy for shop_settings.

-- ============================================================
-- 1. Fix Products Policies: Only admin can modify products
-- ============================================================

-- Drop old overly-permissive policies
DROP POLICY IF EXISTS "Authenticated users can insert products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can update products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can delete products" ON public.products;

-- Recreate with admin-only restriction.
-- IMPORTANT: Replace 'your-admin@email.com' below with your actual admin email.
CREATE POLICY "Admin can insert products"
  ON public.products FOR INSERT TO authenticated
  WITH CHECK (auth.jwt() ->> 'email' = 'your-admin@email.com');

CREATE POLICY "Admin can update products"
  ON public.products FOR UPDATE TO authenticated
  USING (auth.jwt() ->> 'email' = 'your-admin@email.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'your-admin@email.com');

CREATE POLICY "Admin can delete products"
  ON public.products FOR DELETE TO authenticated
  USING (auth.jwt() ->> 'email' = 'your-admin@email.com');


-- ============================================================
-- 2. Fix Orders Policies: Remove duplicate INSERT policy
-- ============================================================

-- Drop duplicates (0001 and 0004 both create public insert policies)
DROP POLICY IF EXISTS "Anyone can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.orders;

-- Recreate a single clean policy
CREATE POLICY "Public can insert orders"
  ON public.orders FOR INSERT
  WITH CHECK (true);

-- Restrict order management to admin only
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can delete orders" ON public.orders;

CREATE POLICY "Admin can view orders"
  ON public.orders FOR SELECT TO authenticated
  USING (auth.jwt() ->> 'email' = 'your-admin@email.com');

CREATE POLICY "Admin can update orders"
  ON public.orders FOR UPDATE TO authenticated
  USING (auth.jwt() ->> 'email' = 'your-admin@email.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'your-admin@email.com');

CREATE POLICY "Admin can delete orders"
  ON public.orders FOR DELETE TO authenticated
  USING (auth.jwt() ->> 'email' = 'your-admin@email.com');


-- ============================================================
-- 3. Fix Shop Settings Policies: Add missing INSERT policy + admin restrict
-- ============================================================

DROP POLICY IF EXISTS "Authenticated users can update settings" ON public.shop_settings;

CREATE POLICY "Admin can update settings"
  ON public.shop_settings FOR UPDATE TO authenticated
  USING (auth.jwt() ->> 'email' = 'your-admin@email.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'your-admin@email.com');

CREATE POLICY "Admin can insert settings"
  ON public.shop_settings FOR INSERT TO authenticated
  WITH CHECK (auth.jwt() ->> 'email' = 'your-admin@email.com');


-- ============================================================
-- 4. Add CHECK constraints for data validation
-- ============================================================

ALTER TABLE public.products
  ADD CONSTRAINT products_price_positive CHECK (price > 0),
  ADD CONSTRAINT products_step_interval_positive CHECK (step_interval > 0),
  ADD CONSTRAINT products_min_quantity_positive CHECK (min_quantity > 0);

ALTER TABLE public.orders
  ADD CONSTRAINT orders_total_positive CHECK (total_amount >= 0);
