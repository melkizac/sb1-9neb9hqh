/*
  # Fix chat session policies

  1. Changes
    - Simplify chat session policies
    - Allow public creation of sessions
    - Enable proper session viewing
    - Maintain admin access

  2. Security
    - Allow visitors to create and view sessions
    - Maintain admin management capabilities
*/

-- First drop existing policies
DO $$ 
BEGIN
  -- Drop chat_sessions policies
  DROP POLICY IF EXISTS "enable_session_creation" ON chat_sessions;
  DROP POLICY IF EXISTS "enable_session_viewing" ON chat_sessions;
  DROP POLICY IF EXISTS "enable_visitor_session_update" ON chat_sessions;
  DROP POLICY IF EXISTS "enable_admin_session_management" ON chat_sessions;
END $$;

-- Create simplified chat_sessions policies
CREATE POLICY "allow_session_creation"
  ON chat_sessions
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "allow_session_viewing"
  ON chat_sessions
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "allow_session_update"
  ON chat_sessions
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (
    status IN ('active', 'closed')
  );

CREATE POLICY "allow_admin_management"
  ON chat_sessions
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.user_id = auth.uid()
  ));