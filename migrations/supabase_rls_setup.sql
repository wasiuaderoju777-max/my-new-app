-- RUN THIS IN SUPABASE SQL EDITOR

-- 1. Enable RLS on all tables
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 2. BUSINESSES Policies
-- Allow anyone to read (needed for public store page)
DROP POLICY IF EXISTS "Public read businesses" ON businesses;
CREATE POLICY "Public read businesses" ON businesses FOR SELECT TO public USING (true);

-- Allow authenticated users to insert their own business
DROP POLICY IF EXISTS "Users can insert their own business" ON businesses;
CREATE POLICY "Users can insert their own business" ON businesses FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = user_id);

-- Allow users to update their own business
DROP POLICY IF EXISTS "Users can update their own business" ON businesses;
CREATE POLICY "Users can update their own business" ON businesses FOR UPDATE TO authenticated USING (auth.uid()::text = user_id);

-- 3. PRODUCTS Policies
DROP POLICY IF EXISTS "Public read products" ON products;
CREATE POLICY "Public read products" ON products FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Users manage products via business ownership" ON products;
CREATE POLICY "Users manage products via business ownership" ON products FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM businesses WHERE id = products.business_id AND user_id = auth.uid()::text)
);

-- 4. SERVICES Policies
DROP POLICY IF EXISTS "Public read services" ON services;
CREATE POLICY "Public read services" ON services FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Users manage services via business ownership" ON services;
CREATE POLICY "Users manage services via business ownership" ON services FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM businesses WHERE id = services.business_id AND user_id = auth.uid()::text)
);

-- 5. CATEGORIES Policies
DROP POLICY IF EXISTS "Public read categories" ON categories;
CREATE POLICY "Public read categories" ON categories FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Users manage categories via business ownership" ON categories;
CREATE POLICY "Users manage categories via business ownership" ON categories FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM businesses WHERE id = categories.business_id AND user_id = auth.uid()::text)
);

-- 6. ORDERS Policies
-- Allow public to insert orders (customers)
DROP POLICY IF EXISTS "Public can create orders" ON orders;
CREATE POLICY "Public can create orders" ON orders FOR INSERT TO public WITH CHECK (true);

-- Only business owner can see their orders
DROP POLICY IF EXISTS "Business owners see their orders" ON orders;
CREATE POLICY "Business owners see their orders" ON orders FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM businesses WHERE id = orders.business_id AND user_id = auth.uid()::text)
);
