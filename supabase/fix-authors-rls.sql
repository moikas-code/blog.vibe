-- Add missing INSERT policy for authors table
-- This allows authenticated users to create their own author record during sync

CREATE POLICY "Users can create their own author profile" ON authors
  FOR INSERT WITH CHECK (auth.uid()::text = clerk_id);

-- Also add a policy that allows service role to insert/update authors
-- This is needed for the auth sync endpoint that uses the service role key
CREATE POLICY "Service role can manage authors" ON authors
  FOR ALL USING (true)
  WITH CHECK (true);

-- Create RPC function to insert authors (bypasses RLS)
CREATE OR REPLACE FUNCTION create_author(
  p_clerk_id TEXT,
  p_name TEXT,
  p_avatar_url TEXT DEFAULT NULL,
  p_bio TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  author_id UUID;
BEGIN
  INSERT INTO authors (clerk_id, name, avatar_url, bio)
  VALUES (p_clerk_id, p_name, p_avatar_url, p_bio)
  RETURNING id INTO author_id;
  
  RETURN author_id;
END;
$$;

-- Fix categories RLS policies
-- Drop the restrictive admin-only policy
DROP POLICY IF EXISTS "Only admins can manage categories" ON categories;

-- Add proper category management policies
CREATE POLICY "Authenticated users can create categories" ON categories
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update categories" ON categories
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete categories" ON categories
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Allow service role to manage categories
CREATE POLICY "Service role can manage categories" ON categories
  FOR ALL USING (true)
  WITH CHECK (true);

-- Create RPC function to insert categories (bypasses RLS)
CREATE OR REPLACE FUNCTION create_category(
  p_name TEXT,
  p_slug TEXT,
  p_description TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  category_id UUID;
BEGIN
  INSERT INTO categories (name, slug, description)
  VALUES (p_name, p_slug, p_description)
  RETURNING id INTO category_id;
  
  RETURN category_id;
END;
$$;