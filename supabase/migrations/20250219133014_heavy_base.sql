/*
  # Update reCAPTCHA Configuration
  
  1. Changes
    - Add reCAPTCHA type configuration
    - Update secret key with proper configuration
  
  2. Security
    - Only authenticated admin users can access the configuration
*/

-- Insert or update reCAPTCHA configuration
INSERT INTO config (key, value)
VALUES 
  ('RECAPTCHA_TYPE', 'v2'),
  ('RECAPTCHA_SECRET_KEY', '6LdnGdwqAAAAALrsJDxvzqBcWtJyz3upALFyfHoR')
ON CONFLICT (key) 
DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = now();