

-- Drop category policies that use auth.uid()
DROP POLICY IF EXISTS "Only admins can create categories" ON categories;
DROP POLICY IF EXISTS "Only admins can update categories" ON categories;
DROP POLICY IF EXISTS "Only admins can delete categories" ON categories;
DROP POLICY IF EXISTS "Authenticated users can create categories" ON categories;
DROP POLICY IF EXISTS "Authenticated users can update categories" ON categories;
DROP POLICY IF EXISTS "Authenticated users can delete categories" ON categories;
DROP POLICY IF EXISTS "Service role can manage categories" ON categories;

-- Categories table: Allow service role to manage all categories
CREATE POLICY "Service role can manage categories" ON categories
  FOR ALL USING (true);


CREATE POLICY "Public can read categories" ON categories
  FOR SELECT USING (true);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;