/*
  # Update SMTP Configuration

  1. Changes
    - Add SMTP_TIMEOUT setting
    - Update FROM address format
    - Add debug settings
*/

INSERT INTO config (key, value)
VALUES 
  ('SMTP_HOST', 'mail.mezzaconsulting.com'),
  ('SMTP_PORT', '465'),
  ('SMTP_USER', 'melverick@mezzaconsulting.com'),
  ('SMTP_PASS', 'Mez-528116!'),
  ('SMTP_SECURE', 'true'),
  ('SMTP_TLS', 'true'),
  ('SMTP_FROM', '"NEXIUS Labs" <melverick@mezzaconsulting.com>'),
  ('SMTP_TIMEOUT', '30000'),
  ('SMTP_DEBUG', 'true')
ON CONFLICT (key) 
DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = now();