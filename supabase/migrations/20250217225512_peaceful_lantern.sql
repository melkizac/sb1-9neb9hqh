/*
  # Reset Admin Password

  1. Changes
    - Resets the password for the admin user (melverick@gmail.com)
    - Sets email confirmation status
    - Clears recovery tokens
  
  2. Security
    - Uses secure password hashing with bcrypt
    - Updates necessary authentication timestamps
*/

DO $$ 
DECLARE
  admin_id uuid;
BEGIN
  -- Get the user ID
  SELECT id INTO admin_id
  FROM auth.users
  WHERE email = 'melverick@gmail.com';

  -- Update the password if user exists
  IF admin_id IS NOT NULL THEN
    UPDATE auth.users
    SET 
      encrypted_password = crypt('nexius2025', gen_salt('bf')),
      updated_at = now(),
      last_sign_in_at = NULL,
      confirmation_sent_at = now(),
      email_confirmed_at = now(),
      recovery_sent_at = NULL,
      recovery_token = NULL
    WHERE id = admin_id;
  END IF;
END $$;