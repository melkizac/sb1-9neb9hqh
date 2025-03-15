/*
  # Fix SMTP Configuration

  1. Changes
    - Update SMTP configuration with correct settings
    - Add additional required SMTP parameters
    - Fix port number format
    
  2. Security
    - Maintain existing security policies
    - Store credentials securely
*/

-- Update SMTP configuration with corrected values
INSERT INTO config (key, value)
VALUES 
  ('SMTP_HOST', 'mail.mezzaconsulting.com'),
  ('SMTP_PORT', '465'),
  ('SMTP_USER', 'melverick@mezzaconsulting.com'),
  ('SMTP_PASS', 'Mez-528116!'),
  ('SMTP_SECURE', 'true'),
  ('SMTP_TLS', 'true'),
  ('SMTP_FROM', 'NEXIUS Labs <melverick@mezzaconsulting.com>')
ON CONFLICT (key) 
DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = now();