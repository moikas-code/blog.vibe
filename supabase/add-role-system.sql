-- Add role system to the blog platform
-- This migration adds roles (reader, author, admin) and updates permissions

-- First, add role column to authors table
ALTER TABLE authors ADD COLUMN role TEXT DEFAULT 'reader' CHECK (role IN ('reader', 'author', 'admin'));

-- Update existing authors to be 'author' role (since they're already in the authors table)
UPDATE authors SET role = 'author' WHERE role = 'reader';

-- Create a view for users with roles for easier querying
CREATE OR REPLACE VIEW user_profiles AS
SELECT 
  id,
  clerk_id,
  name,
  bio,
  avatar_url,
  role,
  created_at,
  updated_at,
  CASE 
    WHEN role = 'admin' THEN 3
    WHEN role = 'author' THEN 2
    WHEN role = 'reader' THEN 1
    ELSE 0
  END as role_level
FROM authors;

-- Update RLS policies to be role-based

-- Drop existing author policies to replace with role-based ones
DROP POLICY IF EXISTS "Authors can update their own profile" ON authors;
DROP POLICY IF EXISTS "Users can create their own author profile" ON authors;

-- New role-based policies for authors table
CREATE POLICY "Users can create their own profile" ON authors
  FOR INSERT WITH CHECK (auth.uid()::text = clerk_id);

CREATE POLICY "Users can update their own profile" ON authors
  FOR UPDATE USING (auth.uid()::text = clerk_id);

CREATE POLICY "Admins can manage all profiles" ON authors
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM authors 
      WHERE clerk_id = auth.uid()::text 
      AND role = 'admin'
    )
  );

-- Update categories policies to be role-based
DROP POLICY IF EXISTS "Authenticated users can create categories" ON categories;
DROP POLICY IF EXISTS "Authenticated users can update categories" ON categories;
DROP POLICY IF EXISTS "Authenticated users can delete categories" ON categories;

-- Only admins can manage categories
CREATE POLICY "Only admins can create categories" ON categories
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM authors 
      WHERE clerk_id = auth.uid()::text 
      AND role = 'admin'
    )
  );

CREATE POLICY "Only admins can update categories" ON categories
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM authors 
      WHERE clerk_id = auth.uid()::text 
      AND role = 'admin'
    )
  );

CREATE POLICY "Only admins can delete categories" ON categories
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM authors 
      WHERE clerk_id = auth.uid()::text 
      AND role = 'admin'
    )
  );

-- Update posts policies to be role-based
DROP POLICY IF EXISTS "Authors can create posts" ON posts;
DROP POLICY IF EXISTS "Authors can update their own posts" ON posts;
DROP POLICY IF EXISTS "Authors can delete their own posts" ON posts;

-- Authors can only manage their own posts, admins can manage all posts
CREATE POLICY "Authors can create posts" ON posts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM authors 
      WHERE clerk_id = auth.uid()::text 
      AND role IN ('author', 'admin')
      AND id = posts.author_id
    )
  );

CREATE POLICY "Authors can update their own posts" ON posts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM authors a
      WHERE a.clerk_id = auth.uid()::text 
      AND (
        (a.role IN ('author') AND a.id = posts.author_id) OR
        (a.role = 'admin')
      )
    )
  );

CREATE POLICY "Authors can delete their own posts" ON posts
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM authors a
      WHERE a.clerk_id = auth.uid()::text 
      AND (
        (a.role IN ('author') AND a.id = posts.author_id) OR
        (a.role = 'admin')
      )
    )
  );

-- Update tags policies
DROP POLICY IF EXISTS "Authors can manage tags" ON tags;

CREATE POLICY "Authors can manage tags" ON tags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM authors 
      WHERE clerk_id = auth.uid()::text 
      AND role IN ('author', 'admin')
    )
  );

-- Update post_tags policies
DROP POLICY IF EXISTS "Authors can manage their post tags" ON post_tags;

CREATE POLICY "Authors can manage post tags" ON post_tags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM posts p
      JOIN authors a ON (
        (a.role = 'author' AND p.author_id = a.id) OR
        (a.role = 'admin')
      )
      WHERE p.id = post_tags.post_id 
      AND a.clerk_id = auth.uid()::text
    )
  );

-- Create function to check user role
CREATE OR REPLACE FUNCTION get_user_role(user_clerk_id TEXT)
RETURNS TEXT
LANGUAGE SQL
STABLE
AS $$
  SELECT role FROM authors WHERE clerk_id = user_clerk_id;
$$;

-- Create function to promote user to author
CREATE OR REPLACE FUNCTION promote_to_author(user_clerk_id TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE authors 
  SET role = 'author' 
  WHERE clerk_id = user_clerk_id 
  AND role = 'reader';
  
  RETURN FOUND;
END;
$$;

-- Create function to promote user to admin (only admins can do this)
CREATE OR REPLACE FUNCTION promote_to_admin(user_clerk_id TEXT, admin_clerk_id TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_role TEXT;
BEGIN
  -- Check if the person doing the promotion is an admin
  SELECT role INTO admin_role FROM authors WHERE clerk_id = admin_clerk_id;
  
  IF admin_role != 'admin' THEN
    RAISE EXCEPTION 'Only admins can promote users to admin';
  END IF;
  
  UPDATE authors 
  SET role = 'admin' 
  WHERE clerk_id = user_clerk_id;
  
  RETURN FOUND;
END;
$$;

-- Update create_author function to include role
DROP FUNCTION IF EXISTS create_author(TEXT, TEXT, TEXT, TEXT);

CREATE OR REPLACE FUNCTION create_author(
  p_clerk_id TEXT,
  p_name TEXT,
  p_avatar_url TEXT DEFAULT NULL,
  p_bio TEXT DEFAULT NULL,
  p_role TEXT DEFAULT 'reader'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  author_id UUID;
BEGIN
  -- Validate role
  IF p_role NOT IN ('reader', 'author', 'admin') THEN
    p_role := 'reader';
  END IF;

  INSERT INTO authors (clerk_id, name, avatar_url, bio, role)
  VALUES (p_clerk_id, p_name, p_avatar_url, p_bio, p_role)
  RETURNING id INTO author_id;
  
  RETURN author_id;
END;
$$;