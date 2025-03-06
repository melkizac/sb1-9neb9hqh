/*
  # Update RLS policies for images table

  1. Changes
    - Add policies to allow admin users to update and delete images
    - Keep existing policies for public viewing and authenticated user creation

  2. Security
    - Only admin users can update and delete images
    - Public users can still view images
    - Authenticated users can still create images
*/

-- First drop existing policies
DROP POLICY IF EXISTS "Images are publicly viewable" ON images;
DROP POLICY IF EXISTS "Users can insert their own images" ON images;
DROP POLICY IF EXISTS "Users can update their own images" ON images;
DROP POLICY IF EXISTS "Users can delete their own images" ON images;

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

CREATE POLICY "Enable image updates for admin users"
  ON images
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Enable image deletion for admin users"
  ON images
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.user_id = auth.uid()
    )
  );