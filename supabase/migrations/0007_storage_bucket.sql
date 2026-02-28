-- Migration: 0007_storage_bucket
-- Description: Creates the 'product-images' storage bucket and makes it public so customers can see product images.
-- 1. Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true) ON CONFLICT (id) DO NOTHING;
-- 2. Drop existing policies (if any) to avoid duplication errors
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Admin Upload" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update" ON storage.objects;
-- 3. Create policies for the bucket
-- Anyone can view the images
CREATE POLICY "Public Access" ON storage.objects FOR
SELECT USING (bucket_id = 'product-images');
-- Only authenticated admins can upload images
CREATE POLICY "Admin Upload" ON storage.objects FOR
INSERT TO authenticated WITH CHECK (bucket_id = 'product-images');
-- Only authenticated admins can update images
CREATE POLICY "Admin Update" ON storage.objects FOR
UPDATE TO authenticated USING (bucket_id = 'product-images');
-- Only authenticated admins can delete images
CREATE POLICY "Admin Delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'product-images');