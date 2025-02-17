/*
  # Create articles schema

  1. New Tables
    - `articles`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `slug` (text, unique, required)
      - `description` (text)
      - `content` (text, required)
      - `featured_image` (text)
      - `status` (text, default: 'draft')
      - `author_id` (uuid, references auth.users)
      - `published_at` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `articles` table
    - Add policies for:
      - Public read access to published articles
      - Authenticated users can create articles
      - Authors can update their own articles
      - Authors can delete their own articles

  3. Functions
    - Add trigger to update `updated_at` timestamp
    - Add function to generate slugs from titles
*/

-- Create articles table
CREATE TABLE IF NOT EXISTS articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  content text NOT NULL,
  featured_image text,
  status text NOT NULL DEFAULT 'draft',
  author_id uuid REFERENCES auth.users NOT NULL,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('draft', 'published', 'archived'))
);

-- Enable RLS
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_articles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION update_articles_updated_at();

-- Create slug generation function
CREATE OR REPLACE FUNCTION generate_slug(title text)
RETURNS text AS $$
DECLARE
  slug text;
  base_slug text;
  counter integer := 1;
BEGIN
  -- Convert to lowercase and replace spaces and special chars with hyphens
  base_slug := lower(regexp_replace(title, '[^a-zA-Z0-9\s]', '', 'g'));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  
  -- Initial slug
  slug := base_slug;
  
  -- Check for existing slugs and append counter if needed
  WHILE EXISTS (SELECT 1 FROM articles WHERE slug = slug) LOOP
    counter := counter + 1;
    slug := base_slug || '-' || counter::text;
  END LOOP;
  
  RETURN slug;
END;
$$ language 'plpgsql';

-- Create trigger to generate slug before insert
CREATE OR REPLACE FUNCTION set_article_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_slug(NEW.title);
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER set_article_slug
  BEFORE INSERT ON articles
  FOR EACH ROW
  EXECUTE FUNCTION set_article_slug();

-- Create policies
-- Public can read published articles
CREATE POLICY "Public can read published articles"
  ON articles
  FOR SELECT
  TO public
  USING (status = 'published' AND published_at <= now());

-- Authenticated users can create articles
CREATE POLICY "Authenticated users can create articles"
  ON articles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

-- Authors can update their own articles
CREATE POLICY "Authors can update own articles"
  ON articles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- Authors can delete their own articles
CREATE POLICY "Authors can delete own articles"
  ON articles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS articles_slug_idx ON articles(slug);
CREATE INDEX IF NOT EXISTS articles_status_idx ON articles(status);
CREATE INDEX IF NOT EXISTS articles_author_id_idx ON articles(author_id);
CREATE INDEX IF NOT EXISTS articles_published_at_idx ON articles(published_at);