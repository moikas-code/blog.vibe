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