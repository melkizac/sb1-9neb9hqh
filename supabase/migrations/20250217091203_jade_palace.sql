/*
  # Create images table for website assets

  1. New Tables
    - `images`
      - `id` (uuid, primary key)
      - `created_at` (timestamp with timezone)
      - `updated_at` (timestamp with timezone)
      - `title` (text, for image title/alt text)
      - `description` (text, optional description)
      - `url` (text, the public URL from storage)
      - `storage_path` (text, the path in the storage bucket)
      - `user_id` (uuid, references auth.users)
      - `metadata` (jsonb, for additional image metadata)

  2. Security
    - Enable RLS on images table
    - Add policies for:
      - Public read access
      - Authenticated users can insert their own images
      - Users can update and delete their own images
*/

-- Create images table
CREATE TABLE IF NOT EXISTS images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  title text NOT NULL,
  description text,
  url text NOT NULL,
  storage_path text NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  UNIQUE(storage_path)
);

-- Enable RLS
ALTER TABLE images ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Images are publicly viewable"
  ON images
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can insert their own images"
  ON images
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own images"
  ON images
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own images"
  ON images
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_images_updated_at
  BEFORE UPDATE ON images
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();