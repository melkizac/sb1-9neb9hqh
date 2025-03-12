/*
  # Fix Event Content Requirement

  1. Changes
    - Make content column nullable
    - Add trigger to use description as content if content is null
  
  2. Security
    - Maintain existing RLS policies
*/

-- Make content column nullable
ALTER TABLE events ALTER COLUMN content DROP NOT NULL;

-- Create trigger function to set content from description
CREATE OR REPLACE FUNCTION set_event_content()
RETURNS TRIGGER AS $$
BEGIN
  -- If content is null but description exists, use description as content
  IF NEW.content IS NULL AND NEW.description IS NOT NULL THEN
    NEW.content := NEW.description;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER set_event_content
  BEFORE INSERT OR UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION set_event_content();