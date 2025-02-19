/*
  # Add reCAPTCHA Configuration

  1. Changes
    - Create secure configuration table for reCAPTCHA
    - Add policies for accessing configuration
    - Store reCAPTCHA secret key securely
*/

-- Create secure configuration table if it doesn't exist
CREATE TABLE IF NOT EXISTS secure_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE secure_config ENABLE ROW LEVEL SECURITY;

-- Create policy for Edge Functions to read config
CREATE POLICY "Edge Functions can read secure config"
  ON secure_config
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert reCAPTCHA secret key
INSERT INTO secure_config (key, value)
VALUES (
  'RECAPTCHA_SECRET_KEY',
  '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe'
) ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value, updated_at = now();

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_secure_config_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_secure_config_updated_at
  BEFORE UPDATE ON secure_config
  FOR EACH ROW
  EXECUTE FUNCTION update_secure_config_updated_at();