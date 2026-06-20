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
    ('Kaju Katli', 600, '500g', 'Sweets', 'https://images.unsplash.com/photo-1589119908995-c6837fa14848?w=800&q=80', false, 1, 1),
    ('Gulab Jamun', 350, 'kg', 'Sweets', 'https://images.unsplash.com/photo-1593708602862-cf4594d27c17?w=800&q=80', false, 1, 1),
    ('Rasgulla', 300, 'kg', 'Sweets', 'https://images.unsplash.com/photo-1623934199716-bc044bbbd39c?w=800&q=80', false, 1, 1),
    ('Soan Papdi', 250, '500g', 'Sweets', 'https://images.unsplash.com/photo-1610450532271-24619f71c4c9?w=800&q=80', false, 1, 1),
    ('Aloo Bhujia', 200, '500g', 'Namkeen', 'https://images.unsplash.com/photo-1601050690597-df056fb1ce24?w=800&q=80', false, 1, 1),
    ('Moong Dal', 220, '500g', 'Namkeen', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80', false, 1, 1),
    ('Sugar-Free Barfi', 500, '250g', 'Sugar-Free', 'https://images.unsplash.com/photo-1541088514152-332e18585c57?w=800&q=80', false, 1, 1),
    ('Dry Fruit Laddu', 450, '500g', 'Festive Specials', 'https://images.unsplash.com/photo-1589119634710-0906231a473c?w=800&q=80', false, 1, 1)
ON CONFLICT DO NOTHING;
