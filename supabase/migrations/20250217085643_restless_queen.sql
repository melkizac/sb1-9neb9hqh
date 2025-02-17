/*
  # Set up storage policies for website images

  1. Security
    - Enable public access to images in the website-images bucket
    - Allow authenticated users to upload and delete their own images
*/

-- Create a policy to allow public access to images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'website-images');

-- Create a policy to allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'website-images');

-- Create a policy to allow authenticated users to delete their own images
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'website-images' AND auth.uid() = owner);