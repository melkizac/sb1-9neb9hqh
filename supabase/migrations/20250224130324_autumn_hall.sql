/*
  # Update image table policies

  1. Changes
    - Allow all authenticated users to update and delete images
    - Remove admin-only restrictions
    - Maintain public viewing access
  
  2. Security
    - Maintains RLS
    - Ensures only authenticated users can modify images
*/

-- First drop existing policies
DROP POLICY IF EXISTS "Enable public viewing of images" ON images;
DROP POLICY IF EXISTS "Enable image creation for authenticated users" ON images;
DROP POLICY IF EXISTS "Enable image updates for admin users" ON images;
DROP POLICY IF EXISTS "Enable image deletion for admin users" ON images;

-- Create new policies
CREATE POLICY "Enable public viewing of images"
  ON images
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Enable image creation for authenticated users"
  ON images
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable image updates for authenticated users"
  ON images
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable image deletion for authenticated users"
  ON images
  FOR DELETE
  TO authenticated
  USING (true);