/*
  # Update reCAPTCHA Configuration to v3
  
  1. Changes
    - Update reCAPTCHA type to v3
    - Update secret key configuration
  
  2. Security
    - Only authenticated admin users can access the configuration
*/

-- Update reCAPTCHA configuration to v3
INSERT INTO config (key, value)
VALUES 
  ('RECAPTCHA_TYPE', 'v3'),
  ('RECAPTCHA_SECRET_KEY', '6LdnGdwqAAAAALrsJDxvzqBcWtJyz3upALFyfHoR')
ON CONFLICT (key) 
DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = now();