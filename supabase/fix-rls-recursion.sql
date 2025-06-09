-- Fix infinite recursion in RLS policies
-- The issue is that policies on authors table were querying authors table

-- First, let's drop all problematic policies
DROP POLICY IF EXISTS "Admins can manage all profiles" ON authors;
DROP POLICY IF EXISTS "Users can create their own profile" ON authors;
DROP POLICY IF EXISTS "Users can update their own profile" ON authors;
DROP POLICY IF EXISTS "Only admins can create categories" ON categories;
DROP POLICY IF EXISTS "Only admins can update categories" ON categories;
DROP POLICY IF EXISTS "Only admins can delete categories" ON categories;
DROP POLICY IF EXISTS "Authors can create posts" ON posts;
DROP POLICY IF EXISTS "Authors can update their own posts" ON posts;
DROP POLICY IF EXISTS "Authors can delete their own posts" ON posts;
DROP POLICY IF EXISTS "Authors can manage tags" ON tags;
DROP POLICY IF EXISTS "Authors can manage post tags" ON post_tags;

-- Create a function to get user role without recursion
-- This function uses SECURITY DEFINER to bypass RLS
CREATE OR REPLACE FUNCTION auth.get_user_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role FROM authors WHERE clerk_id = auth.uid()::text LIMIT 1;
$$;

-- Create a function to check if user is admin
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS(SELECT 1 FROM authors WHERE clerk_id = auth.uid()::text AND role = 'admin');
$$;

-- Create a function to check if user can create posts
CREATE OR REPLACE FUNCTION auth.can_create_posts()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS(SELECT 1 FROM authors WHERE clerk_id = auth.uid()::text AND role IN ('author', 'admin'));
$$;

-- Fixed authors table policies (no recursion)
CREATE POLICY "Users can create their own profile" ON authors
  FOR INSERT WITH CHECK (auth.uid()::text = clerk_id);

CREATE POLICY "Users can update their own profile" ON authors
  FOR UPDATE USING (auth.uid()::text = clerk_id);

CREATE POLICY "Users can read all profiles" ON authors
  FOR SELECT USING (true);

-- Categories policies using the helper function
CREATE POLICY "Only admins can create categories" ON categories
  FOR INSERT WITH CHECK (auth.is_admin());

CREATE POLICY "Only admins can update categories" ON categories
  FOR UPDATE USING (auth.is_admin());

CREATE POLICY "Only admins can delete categories" ON categories
  FOR DELETE USING (auth.is_admin());

CREATE POLICY "Everyone can read categories" ON categories
  FOR SELECT USING (true);

-- Posts policies
CREATE POLICY "Authors can create posts" ON posts
  FOR INSERT WITH CHECK (
    auth.can_create_posts() AND 
    EXISTS(SELECT 1 FROM authors WHERE id = posts.author_id AND clerk_id = auth.uid()::text)
  );

CREATE POLICY "Authors can update their own posts" ON posts
  FOR UPDATE USING (
    EXISTS(
      SELECT 1 FROM authors a
      WHERE a.clerk_id = auth.uid()::text 
      AND (
        (a.role = 'author' AND a.id = posts.author_id) OR
        (a.role = 'admin')
      )
    )
  );

CREATE POLICY "Authors can delete their own posts" ON posts
  FOR DELETE USING (
    EXISTS(
      SELECT 1 FROM authors a
      WHERE a.clerk_id = auth.uid()::text 
      AND (
        (a.role = 'author' AND a.id = posts.author_id) OR
        (a.role = 'admin')
      )
    )
  );

CREATE POLICY "Everyone can read published posts" ON posts
  FOR SELECT USING (published = true OR auth.can_create_posts());

-- Tags policies
CREATE POLICY "Authors can manage tags" ON tags
  FOR ALL USING (auth.can_create_posts());

-- Post tags policies
CREATE POLICY "Authors can manage post tags" ON post_tags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM posts p
      JOIN authors a ON p.author_id = a.id
      WHERE p.id = post_tags.post_id 
      AND a.clerk_id = auth.uid()::text
      AND a.role IN ('author', 'admin')
    ) OR auth.is_admin()
  );

-- Grant execute permissions on the helper functions
GRANT EXECUTE ON FUNCTION auth.get_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION auth.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION auth.can_create_posts() TO authenticated;