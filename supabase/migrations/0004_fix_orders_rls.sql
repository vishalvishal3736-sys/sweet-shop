-- Allow public inserts for new orders
CREATE POLICY "Enable insert for all users" ON "public"."orders"
FOR INSERT WITH CHECK (true);
