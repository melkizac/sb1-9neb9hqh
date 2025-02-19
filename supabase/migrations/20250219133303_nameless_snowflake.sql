/*
  # Remove reCAPTCHA Requirements
  
  1. Changes
    - Remove captcha_token requirement from leads table
    - Drop reCAPTCHA configuration
  
  2. Security
    - Maintain RLS policies for leads table
*/

-- Remove captcha_token column constraint
ALTER TABLE leads
ALTER COLUMN captcha_token DROP NOT NULL;

-- Drop reCAPTCHA policies
DROP POLICY IF EXISTS "Enable insert access for all users with valid captcha" ON leads;

-- Create new insert policy without captcha requirement
CREATE POLICY "Enable insert access for all users"
  ON leads
  FOR INSERT
  TO public
  WITH CHECK (true);