/*
  # Fix Event Slug Generation

  1. Changes
    - Add function to generate unique event slugs
    - Add trigger to automatically generate slugs on insert
    - Add unique constraint for event slugs
  
  2. Security
    - Maintain existing RLS policies
    - Ensure unique slugs
*/

-- Create function to generate unique event slugs
CREATE OR REPLACE FUNCTION generate_event_slug(title text)
RETURNS text AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 1;
BEGIN
  -- Convert to lowercase and replace special chars with hyphens
  base_slug := lower(regexp_replace(title, '[^a-zA-Z0-9\s]', '', 'g'));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  
  -- Initial slug
  final_slug := base_slug;
  
  -- Check for existing slugs and append counter if needed
  WHILE EXISTS (SELECT 1 FROM events WHERE events.slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter::text;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Create trigger function to set slug before insert
CREATE OR REPLACE FUNCTION set_event_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_event_slug(NEW.title);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS set_event_slug ON events;
CREATE TRIGGER set_event_slug
  BEFORE INSERT ON events
  FOR EACH ROW
  EXECUTE FUNCTION set_event_slug();

-- Add unique constraint if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'events_slug_key'
  ) THEN
    ALTER TABLE events ADD CONSTRAINT events_slug_key UNIQUE (slug);
  END IF;
END $$;