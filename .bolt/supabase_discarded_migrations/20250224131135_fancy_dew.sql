/*
  # Fix Image Updates

  1. Changes
    - Drop existing policies
    - Create new simplified policies for image management
    - Add performance indexes
    - Add update trigger
  
  2. Security
    - Maintains RLS
    - Allows authenticated users to manage images
*/

-- First drop existing policies
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "allow_public_select" ON images;
  DROP POLICY IF EXISTS "allow_authenticated_all" ON images;
END $$;

-- Create simplified policies
CREATE POLICY "enable_public_select"
  ON images
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "enable_authenticated_all"
  ON images
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS images_user_id_created_at_idx ON images(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS images_storage_path_idx ON images(storage_path);

-- Create or replace update trigger function
CREATE OR REPLACE FUNCTION handle_image_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Always update the timestamp
  NEW.updated_at = NOW();
  
  -- Ensure metadata is preserved if not explicitly changed
  IF NEW.metadata IS NULL THEN
    NEW.metadata = OLD.metadata;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger
DROP TRIGGER IF EXISTS update_images_timestamp ON images;
CREATE TRIGGER update_images_timestamp
  BEFORE UPDATE ON images
  FOR EACH ROW
  EXECUTE FUNCTION handle_image_update();