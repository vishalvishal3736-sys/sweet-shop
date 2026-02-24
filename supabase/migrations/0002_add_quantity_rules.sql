-- Add step_interval and min_quantity to products table for dynamic pricing and fractional quantities

ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS step_interval NUMERIC DEFAULT 1 NOT NULL,
ADD COLUMN IF NOT EXISTS min_quantity NUMERIC DEFAULT 1 NOT NULL;

-- Example: For an item sold in kg but customers can buy 0.5kg, 1kg, 1.5kg:
-- step_interval = 0.5, min_quantity = 0.5
-- Example: For an item sold in pieces:
-- step_interval = 1, min_quantity = 1
