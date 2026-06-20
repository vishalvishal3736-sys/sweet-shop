-- Insert sample products into the active Supabase database
-- Run this in your Supabase Dashboard -> SQL Editor
INSERT INTO products (
        name,
        price,
        unit,
        category,
        image_url,
        is_out_of_stock,
        step_interval,
        min_quantity
    )
VALUES
    ('Kaju Katli', 600, '500g', 'Sweets', '/images/kaju_katli.png', false, 1, 1),
    ('Gulab Jamun', 350, 'kg', 'Sweets', '/images/gulab_jamun.png', false, 1, 1),
    ('Rasgulla', 300, 'kg', 'Sweets', '/images/rasgulla.png', false, 1, 1),
    ('Soan Papdi', 250, '500g', 'Sweets', '/images/soan_papdi.png', false, 1, 1),
    ('Aloo Bhujia', 200, '500g', 'Namkeen', '/images/aloo_bhujia.png', false, 1, 1),
    ('Moong Dal', 220, '500g', 'Namkeen', '/images/moong_dal.png', false, 1, 1),
    ('Sugar-Free Barfi', 500, '250g', 'Sugar-Free', '/images/sugar_free_barfi.png', false, 1, 1),
    ('Dry Fruit Laddu', 450, '500g', 'Festive Specials', '/images/dry_fruit_laddu.png', false, 1, 1)
ON CONFLICT DO NOTHING;
