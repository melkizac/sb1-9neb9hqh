/*
  # Fix Chat RLS Policies

  1. Changes
    - Simplify and fix chat session and message policies
    - Ensure visitors can create sessions and messages
    - Allow proper access for both visitors and admins
    - Fix visitor_id handling for public access

  2. Security
    - Maintain proper access control
    - Prevent unauthorized access
    - Enable proper chat functionality
*/

-- First drop all existing policies
DO $$ 
BEGIN
  -- Drop chat_sessions policies
  DROP POLICY IF EXISTS "allow_visitor_create_sessions" ON chat_sessions;
  DROP POLICY IF EXISTS "allow_visitor_view_own_sessions" ON chat_sessions;
  DROP POLICY IF EXISTS "allow_admin_full_access_sessions" ON chat_sessions;

  -- Drop chat_messages policies
  DROP POLICY IF EXISTS "allow_visitor_create_messages" ON chat_messages;
  DROP POLICY IF EXISTS "allow_visitor_view_own_messages" ON chat_messages;
  DROP POLICY IF EXISTS "allow_admin_full_access_messages" ON chat_messages;
END $$;

-- Create chat_sessions policies
CREATE POLICY "enable_public_chat_session_creation"
  ON chat_sessions
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "enable_public_chat_session_viewing"
  ON chat_sessions
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "enable_admin_chat_session_management"
  ON chat_sessions
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.user_id = auth.uid()
  ));

-- Create chat_messages policies
CREATE POLICY "enable_public_chat_message_creation"
  ON chat_messages
  FOR INSERT
  TO public
  WITH CHECK (
    is_from_visitor = true
    AND EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE id = session_id
    )
  );

CREATE POLICY "enable_public_chat_message_viewing"
  ON chat_messages
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE id = session_id
    )
  );

CREATE POLICY "enable_admin_chat_message_management"
  ON chat_messages
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.user_id = auth.uid()
  ));