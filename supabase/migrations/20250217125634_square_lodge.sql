-- Create the storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('website-images', 'website-images', true)
ON CONFLICT (id) DO NOTHING;

-- Safely create policies using DO block
DO $$ 
BEGIN
  -- Public access policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Public Access'
  ) THEN
    CREATE POLICY "Public Access"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'website-images');
  END IF;

  -- Upload policy for all users (not just authenticated)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Anyone can upload images'
  ) THEN
    CREATE POLICY "Anyone can upload images"
    ON storage.objects FOR INSERT
    TO public
    WITH CHECK (bucket_id = 'website-images');
  END IF;

  -- Update policy for all users
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Anyone can update images'
  ) THEN
    CREATE POLICY "Anyone can update images"
    ON storage.objects FOR UPDATE
    TO public
    USING (bucket_id = 'website-images');
  END IF;

  -- Delete policy for all users
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Anyone can delete images'
  ) THEN
    CREATE POLICY "Anyone can delete images"
    ON storage.objects FOR DELETE
    TO public
    USING (bucket_id = 'website-images');
  END IF;
END $$;