-- Drop the existing unique constraint on posts.slug
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_slug_key;

-- Add a composite unique constraint on author_id and slug
ALTER TABLE posts ADD CONSTRAINT posts_author_id_slug_unique UNIQUE (author_id, slug);

-- Add comment explaining the change
COMMENT ON CONSTRAINT posts_author_id_slug_unique ON posts IS 'Ensures slug uniqueness per author, allowing different authors to have posts with the same slug';