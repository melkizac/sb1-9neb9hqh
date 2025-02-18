/*
  # Fix Admin User Setup and Permissions

  1. Changes
    - Ensures admin user exists with correct permissions
    - Sets up proper authentication settings
    - Adds user to admin_users table
  
  2. Security
    - Uses secure password hashing
    - Sets proper authentication flags
*/

DO $$ 
DECLARE
  admin_id uuid;
BEGIN
  -- Get or create the user
  SELECT id INTO admin_id
  FROM auth.users
  WHERE email = 'melverick@gmail.com';

  IF admin_id IS NULL THEN
    -- Create new user if doesn't exist
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'melverick@gmail.com',
      crypt('nexius2025', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"is_admin":true}',
      now(),
      now(),
      '',
      ''
    ) RETURNING id INTO admin_id;
  ELSE
    -- Update existing user
    UPDATE auth.users
    SET 
      encrypted_password = crypt('nexius2025', gen_salt('bf')),
      email_confirmed_at = now(),
      raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
      raw_user_meta_data = '{"is_admin":true}'::jsonb,
      updated_at = now(),
      confirmation_token = '',
      recovery_token = ''
    WHERE id = admin_id;
  END IF;

  -- Ensure user is in admin_users table
  INSERT INTO admin_users (user_id, email)
  VALUES (admin_id, 'melverick@gmail.com')
  ON CONFLICT (email) DO UPDATE
  SET user_id = EXCLUDED.user_id;

  -- Grant necessary permissions
  GRANT USAGE ON SCHEMA public TO authenticated;
  GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
  GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
END $$;