/*
  # Update Edge Function URL

  1. Changes
    - Update the base URL for the send-email function
    - Maintain existing configuration
*/

INSERT INTO edge_function_config (function_name, base_url)
VALUES (
  'send-email',
  'https://tunidbyclygzipvbfzee.supabase.co/functions/v1/send-email'
) ON CONFLICT (function_name) DO UPDATE
SET base_url = EXCLUDED.base_url;