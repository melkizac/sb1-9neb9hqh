/*
  # Fix Events Table Policies

  1. Changes
    - Drop existing policies
    - Add simplified policies for public access to published events
    - Add proper indexes for performance
  
  2. Security
    - Allow public access to published events
    - Maintain admin access for management
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view published events" ON events;
DROP POLICY IF EXISTS "Organizers can manage their events" ON events;

-- Create new policies
CREATE POLICY "Enable public access to published events"
  ON events
  FOR SELECT
  TO public
  USING (
    status = 'published' 
    AND published_at IS NOT NULL 
    AND published_at <= now()
  );

CREATE POLICY "Enable admin management of events"
  ON events
  FOR ALL
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS events_published_status_idx 
ON events(status, published_at);