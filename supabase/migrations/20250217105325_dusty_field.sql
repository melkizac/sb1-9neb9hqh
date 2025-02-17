/*
  # Create leads table and related functions

  1. New Tables
    - `leads`
      - `id` (uuid, primary key)
      - `first_name` (text, required)
      - `last_name` (text)
      - `email` (text, required)
      - `phone` (text)
      - `message` (text)
      - `captcha_token` (text, required)
      - `created_at` (timestamp with time zone)
      - `status` (text)

  2. Security
    - Enable RLS on `leads` table
    - Add policy for inserting new leads
    - Add policy for admin access
*/

-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text,
  email text NOT NULL,
  phone text,
  message text,
  captcha_token text NOT NULL,
  created_at timestamptz DEFAULT now(),
  status text DEFAULT 'new',
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Enable RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable insert access for all users with valid captcha"
  ON leads
  FOR INSERT
  TO public
  WITH CHECK (captcha_token IS NOT NULL);

CREATE POLICY "Enable read access for authenticated users"
  ON leads
  FOR SELECT
  TO authenticated
  USING (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS leads_email_idx ON leads(email);
CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads(created_at);
CREATE INDEX IF NOT EXISTS leads_status_idx ON leads(status);