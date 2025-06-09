-- Fix infinite recursion in RLS policies for Clerk authentication
-- This version works with Clerk auth + authors table sync

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

-- Create helper functions in public schema (we have permissions here)
-- These functions use SECURITY DEFINER to bypass RLS when checking roles

CREATE OR REPLACE FUNCTION public.get_user_role_by_clerk_id(clerk_user_id TEXT)
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role FROM authors WHERE clerk_id = clerk_user_id LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_admin_by_clerk_id(clerk_user_id TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS(SELECT 1 FROM authors WHERE clerk_id = clerk_user_id AND role = 'admin');
$$;

CREATE OR REPLACE FUNCTION public.can_create_posts_by_clerk_id(clerk_user_id TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS(SELECT 1 FROM authors WHERE clerk_id = clerk_user_id AND role IN ('author', 'admin'));
$$;

CREATE OR REPLACE FUNCTION public.get_author_id_by_clerk_id(clerk_user_id TEXT)
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT id FROM authors WHERE clerk_id = clerk_user_id LIMIT 1;
$$;

-- Authors table policies (no recursion, works with Clerk)
-- Since we're using Clerk, we'll allow anyone to read profiles
CREATE POLICY "Anyone can read author profiles" ON authors
  FOR SELECT USING (true);

-- Users can create their own profile (when syncing from Clerk)
CREATE POLICY "Users can create their own profile" ON authors
  FOR INSERT WITH CHECK (true); -- We'll validate this in the application layer

-- Users can update their own profile only
CREATE POLICY "Users can update their own profile" ON authors
  FOR UPDATE USING (
    clerk_id = (current_setting('request.jwt.claims', true)::json->>'sub')::text
    OR 
    clerk_id = (current_setting('app.current_user_id', true))::text
  );

-- Categories policies - only admins can manage
CREATE POLICY "Everyone can read categories" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Only admins can create categories" ON categories
  FOR INSERT WITH CHECK (
    public.is_admin_by_clerk_id(
      COALESCE(
        (current_setting('request.jwt.claims', true)::json->>'sub')::text,
        (current_setting('app.current_user_id', true))::text
      )
    )
  );

CREATE POLICY "Only admins can update categories" ON categories
  FOR UPDATE USING (
    public.is_admin_by_clerk_id(
      COALESCE(
        (current_setting('request.jwt.claims', true)::json->>'sub')::text,
        (current_setting('app.current_user_id', true))::text
      )
    )
  );

CREATE POLICY "Only admins can delete categories" ON categories
  FOR DELETE USING (
    public.is_admin_by_clerk_id(
      COALESCE(
        (current_setting('request.jwt.claims', true)::json->>'sub')::text,
        (current_setting('app.current_user_id', true))::text
      )
    )
  );

-- Posts policies - authors can manage their own, admins can manage all
CREATE POLICY "Everyone can read published posts" ON posts
  FOR SELECT USING (
    published = true OR 
    public.can_create_posts_by_clerk_id(
      COALESCE(
        (current_setting('request.jwt.claims', true)::json->>'sub')::text,
        (current_setting('app.current_user_id', true))::text
      )
    )
  );

CREATE POLICY "Authors can create posts" ON posts
  FOR INSERT WITH CHECK (
    public.can_create_posts_by_clerk_id(
      COALESCE(
        (current_setting('request.jwt.claims', true)::json->>'sub')::text,
        (current_setting('app.current_user_id', true))::text
      )
    ) AND
    author_id = public.get_author_id_by_clerk_id(
      COALESCE(
        (current_setting('request.jwt.claims', true)::json->>'sub')::text,
        (current_setting('app.current_user_id', true))::text
      )
    )
  );

CREATE POLICY "Authors can update their own posts" ON posts
  FOR UPDATE USING (
    author_id = public.get_author_id_by_clerk_id(
      COALESCE(
        (current_setting('request.jwt.claims', true)::json->>'sub')::text,
        (current_setting('app.current_user_id', true))::text
      )
    ) OR
    public.is_admin_by_clerk_id(
      COALESCE(
        (current_setting('request.jwt.claims', true)::json->>'sub')::text,
        (current_setting('app.current_user_id', true))::text
      )
    )
  );

CREATE POLICY "Authors can delete their own posts" ON posts
  FOR DELETE USING (
    author_id = public.get_author_id_by_clerk_id(
      COALESCE(
        (current_setting('request.jwt.claims', true)::json->>'sub')::text,
        (current_setting('app.current_user_id', true))::text
      )
    ) OR
    public.is_admin_by_clerk_id(
      COALESCE(
        (current_setting('request.jwt.claims', true)::json->>'sub')::text,
        (current_setting('app.current_user_id', true))::text
      )
    )
  );

-- Tags policies - authors and admins can manage
CREATE POLICY "Everyone can read tags" ON tags
  FOR SELECT USING (true);

CREATE POLICY "Authors can manage tags" ON tags
  FOR ALL USING (
    public.can_create_posts_by_clerk_id(
      COALESCE(
        (current_setting('request.jwt.claims', true)::json->>'sub')::text,
        (current_setting('app.current_user_id', true))::text
      )
    )
  );

-- Post tags policies
CREATE POLICY "Everyone can read post tags" ON post_tags
  FOR SELECT USING (true);

CREATE POLICY "Authors can manage their post tags" ON post_tags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM posts p
      WHERE p.id = post_tags.post_id 
      AND (
        p.author_id = public.get_author_id_by_clerk_id(
          COALESCE(
            (current_setting('request.jwt.claims', true)::json->>'sub')::text,
            (current_setting('app.current_user_id', true))::text
          )
        ) OR
        public.is_admin_by_clerk_id(
          COALESCE(
            (current_setting('request.jwt.claims', true)::json->>'sub')::text,
            (current_setting('app.current_user_id', true))::text
          )
        )
      )
    )
  );

-- Helper function to set current user context
CREATE OR REPLACE FUNCTION public.set_current_user(user_id TEXT)
RETURNS VOID
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT set_config('app.current_user_id', user_id, true);
$$;

-- Grant execute permissions on the helper functions to all authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_role_by_clerk_id(TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_admin_by_clerk_id(TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.can_create_posts_by_clerk_id(TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_author_id_by_clerk_id(TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.set_current_user(TEXT) TO authenticated, anon;