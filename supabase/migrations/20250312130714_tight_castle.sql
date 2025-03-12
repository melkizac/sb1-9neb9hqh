/*
  # Add public access policy for events

  1. Changes
    - Add policy to allow public access to view events
    - Maintain existing admin policies
    - Add performance indexes
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable public access to published events" ON events;
DROP POLICY IF EXISTS "Enable admin management of events" ON events;

-- Create simplified policies
CREATE POLICY "Enable public access to events"
  ON events
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Enable admin management of events"
  ON events
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.user_id = auth.uid()
  ));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS events_start_date_idx ON events(start_date);
CREATE INDEX IF NOT EXISTS events_end_date_idx ON events(end_date);