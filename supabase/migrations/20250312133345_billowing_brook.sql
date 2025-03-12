/*
  # Create event registrations table

  1. New Tables
    - `event_registrations`
      - `id` (uuid, primary key)
      - `event_id` (uuid, references events)
      - `full_name` (text, required)
      - `email` (text, required)
      - `phone` (text)
      - `company` (text)
      - `job_title` (text)
      - `linkedin_url` (text)
      - `status` (text, default: 'pending')
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for public registration
    - Add policies for admin access
    - Add email validation
*/

-- Create event_registrations table
CREATE TABLE IF NOT EXISTS event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  company text,
  job_title text,
  linkedin_url text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'confirmed', 'cancelled', 'attended'))
);

-- Enable RLS
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger
CREATE TRIGGER update_event_registrations_updated_at
  BEFORE UPDATE ON event_registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create policies
CREATE POLICY "Enable public registration"
  ON event_registrations
  FOR INSERT
  TO public
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM events
      WHERE id = event_id
      AND end_date >= now()
    )
  );

CREATE POLICY "Enable admin access"
  ON event_registrations
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
CREATE INDEX IF NOT EXISTS event_registrations_event_id_idx ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS event_registrations_email_idx ON event_registrations(email);
CREATE INDEX IF NOT EXISTS event_registrations_status_idx ON event_registrations(status);
CREATE INDEX IF NOT EXISTS event_registrations_created_at_idx ON event_registrations(created_at DESC);