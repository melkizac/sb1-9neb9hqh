/*
  # Add admin user

  1. Changes
    - Create admin user in auth.users table if not exists
    - Add admin user to admin_users table
*/

DO $$ 
DECLARE
  admin_id uuid;
BEGIN
  -- Get the user ID if the user already exists
  SELECT id INTO admin_id
  FROM auth.users
  WHERE email = 'melverick@gmail.com';

  -- If user doesn't exist, create them
  IF admin_id IS NULL THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'melverick@gmail.com',
      crypt('password123', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"is_admin":true}',
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    ) RETURNING id INTO admin_id;
  END IF;

  -- Add to admin_users if not already there
  INSERT INTO admin_users (user_id, email)
  VALUES (admin_id, 'melverick@gmail.com')
  ON CONFLICT (email) DO NOTHING;
END $$;