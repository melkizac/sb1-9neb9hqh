/*
  # Create reCAPTCHA Configuration

  1. New Tables
    - `config` table for storing application configuration
      - `id` (uuid, primary key)
      - `key` (text, unique)
      - `value` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policy for authenticated users to read config
    - Add policy for admin users to manage config
*/

-- Create config table
CREATE TABLE IF NOT EXISTS config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE config ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can read config"
  ON config
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin users can manage config"
  ON config
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

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_config_updated_at
  BEFORE UPDATE ON config
  FOR EACH ROW
  EXECUTE FUNCTION update_config_updated_at();

-- Insert reCAPTCHA secret key
INSERT INTO config (key, value)
VALUES ('RECAPTCHA_SECRET_KEY', '6LdnGdwqAAAAALrsJDxvzqBcWtJyz3upALFyfHoR')
ON CONFLICT (key) 
DO UPDATE SET value = EXCLUDED.value, updated_at = now();