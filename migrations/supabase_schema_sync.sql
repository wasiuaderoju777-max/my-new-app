-- RUN THIS IN SUPABASE SQL EDITOR

-- 1. Add missing columns to businesses table
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- 2. Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  business_id BIGINT REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Add missing columns to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 4. Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  business_id BIGINT REFERENCES businesses(id) ON DELETE CASCADE,
  customer_note TEXT,
  total_price NUMERIC NOT NULL,
  items_summary TEXT NOT NULL,
  payment_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. IMPORTANT: Reload PostgREST Cache (automatic in UI usually, but good practice)
-- After running this, if the error persists for 10 seconds, refresh your browser tab.
