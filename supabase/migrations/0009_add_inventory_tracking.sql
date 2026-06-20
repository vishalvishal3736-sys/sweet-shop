-- Migration: 0009_add_inventory_tracking
-- Description: Adds quantity tracking to products and sets up automated stock deduction/restoration triggers on orders.

-- 1. Add quantity_available column to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS quantity_available NUMERIC DEFAULT 10 NOT NULL;

-- 2. Create or replace the stock handler function
CREATE OR REPLACE FUNCTION public.handle_order_stock_change()
RETURNS TRIGGER AS $$
DECLARE
    item jsonb;
    item_id uuid;
    item_qty numeric;
BEGIN
    -- Case 1: New order placed (INSERT)
    IF TG_OP = 'INSERT' THEN
        FOR item IN SELECT * FROM jsonb_array_elements(NEW.items->'itemsList') LOOP
            item_id := (item->>'id')::uuid;
            item_qty := (item->>'quantity')::numeric;
            
            -- Deduct stock (COALESCE to ensure safe subtraction)
            UPDATE public.products
            SET quantity_available = COALESCE(quantity_available, 0) - item_qty
            WHERE id = item_id;
        END LOOP;
        
    -- Case 2: Order status changed (UPDATE)
    ELSIF TG_OP = 'UPDATE' THEN
        -- If status changes to 'cancelled', restore stock
        IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
            FOR item IN SELECT * FROM jsonb_array_elements(NEW.items->'itemsList') LOOP
                item_id := (item->>'id')::uuid;
                item_qty := (item->>'quantity')::numeric;
                
                UPDATE public.products
                SET quantity_available = COALESCE(quantity_available, 0) + item_qty
                WHERE id = item_id;
            END LOOP;
            
        -- If status changes FROM 'cancelled' back to something else, deduct stock again
        ELSIF NEW.status != 'cancelled' AND OLD.status = 'cancelled' THEN
            FOR item IN SELECT * FROM jsonb_array_elements(NEW.items->'itemsList') LOOP
                item_id := (item->>'id')::uuid;
                item_qty := (item->>'quantity')::numeric;
                
                UPDATE public.products
                SET quantity_available = COALESCE(quantity_available, 0) - item_qty
                WHERE id = item_id;
            END LOOP;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create the trigger on orders table
DROP TRIGGER IF EXISTS trg_order_stock_change ON public.orders;

CREATE TRIGGER trg_order_stock_change
AFTER INSERT OR UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.handle_order_stock_change();
