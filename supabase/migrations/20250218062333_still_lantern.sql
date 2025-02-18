/*
  # Add Edge Function Configuration

  1. Changes
    - Add configuration for admin notification Edge Function
    - Set up secure URL for function calls
*/

-- Create a secure configuration for Edge Functions
CREATE TABLE IF NOT EXISTS edge_function_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  function_name text NOT NULL UNIQUE,
  base_url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE edge_function_config ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to read config
CREATE POLICY "Authenticated users can read edge function config"
  ON edge_function_config
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert configuration for notify-new-chat function
INSERT INTO edge_function_config (function_name, base_url)
VALUES (
  'notify-new-chat',
  'https://tunidbyclygzipvbfzee.supabase.co/functions/v1/notify-new-chat'
) ON CONFLICT (function_name) DO UPDATE
SET base_url = EXCLUDED.base_url;