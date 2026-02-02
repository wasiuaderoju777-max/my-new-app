-- RUN THIS IN SUPABASE SQL EDITOR

-- 1. Ensure RLS is enabled
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

-- 2. Drop the old policy so we can replace it
DROP POLICY IF EXISTS "Users can manage their own business" ON businesses;
DROP POLICY IF EXISTS "Public can see stores" ON businesses;

-- 3. Create a more permissive policy for testing
-- This allows any logged-in user to create a business
CREATE POLICY "Allow authenticated insert" 
ON businesses FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- This allows users to see/edit their own business
CREATE POLICY "Allow authenticated select and update" 
ON businesses FOR ALL 
TO authenticated 
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);

-- This allows public to see the store
CREATE POLICY "Allow public read" 
ON businesses FOR SELECT 
TO public 
USING (true);
