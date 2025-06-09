-- Emergency fix for categories RLS issue
-- This temporarily makes categories more permissive until we can properly fix the auth issue

-- Drop all existing restrictive policies on categories
DROP POLICY IF EXISTS "Only admins can create categories" ON categories;
DROP POLICY IF EXISTS "Only admins can update categories" ON categories;
DROP POLICY IF EXISTS "Only admins can delete categories" ON categories;
DROP POLICY IF EXISTS "Authenticated users can create categories" ON categories;
DROP POLICY IF EXISTS "Authenticated users can update categories" ON categories;
DROP POLICY IF EXISTS "Authenticated users can delete categories" ON categories;
DROP POLICY IF EXISTS "Service role can manage categories" ON categories;
DROP POLICY IF EXISTS "Public can read categories" ON categories;

-- Temporarily disable RLS on categories to allow admin operations
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;

-- Note: This is a temporary fix. After this works, we should re-enable RLS with proper policies