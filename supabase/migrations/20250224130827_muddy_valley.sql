/*
  # Fix Image Update Functionality

  1. Changes
    - Drop existing policies
    - Create new simplified policies for image management
    - Add indexes for better performance
  
  2. Security
    - Maintains RLS
    - Allows authenticated users to manage images
*/

-- First drop existing policies
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Enable public viewing of images" ON images;
  DROP POLICY IF EXISTS "Enable image creation for authenticated users" ON images;
  DROP POLICY IF EXISTS "Enable image updates for authenticated users" ON images;
  DROP POLICY IF EXISTS "Enable image deletion for authenticated users" ON images;
END $$;

-- Create simplified policies
CREATE POLICY "allow_public_select"
  ON images
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "allow_authenticated_all"
  ON images
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS images_user_id_idx ON images(user_id);
CREATE INDEX IF NOT EXISTS images_created_at_idx ON images(created_at DESC);

-- Update function to handle image updates
CREATE OR REPLACE FUNCTION handle_image_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for image updates
DROP TRIGGER IF EXISTS update_images_timestamp ON images;
CREATE TRIGGER update_images_timestamp
  BEFORE UPDATE ON images
  FOR EACH ROW
  EXECUTE FUNCTION handle_image_update();