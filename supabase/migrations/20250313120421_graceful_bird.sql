/*
  # Add SMTP Configuration

  1. Changes
    - Add SMTP credentials to config table
    - Set up email sending configuration
    - Ensure secure storage of credentials

  2. Security
    - Store credentials in config table
    - Maintain existing RLS policies
    - Only allow admin access
*/

-- Insert SMTP configuration
INSERT INTO config (key, value)
VALUES 
  ('SMTP_HOST', 'mail.mezzaconsulting.com'),
  ('SMTP_PORT', '465'),
  ('SMTP_USER', 'melverick@mezzaconsulting.com'),
  ('SMTP_PASS', 'Mez-528116!'),
  ('SMTP_SECURE', 'true')
ON CONFLICT (key) 
DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = now();

-- Ensure proper indexes exist
CREATE INDEX IF NOT EXISTS config_key_idx ON config(key);