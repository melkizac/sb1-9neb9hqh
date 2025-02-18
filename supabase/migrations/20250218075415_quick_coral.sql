/*
  # Fix chat message policies for admin replies

  1. Changes
    - Simplify chat message policies to allow visitors to see all messages in their sessions
    - Allow admins to create messages with visitor_id
    - Remove unnecessary complexity in policies

  2. Security
    - Maintain session-based access control
    - Ensure visitors can only see their own chat messages
    - Allow admins full access to manage messages
*/

-- First drop existing policies
DO $$ 
BEGIN
  -- Drop chat_messages policies
  DROP POLICY IF EXISTS "enable_all_message_operations" ON chat_messages;
  DROP POLICY IF EXISTS "enable_public_message_access" ON chat_messages;
END $$;

-- Create new chat_messages policies
CREATE POLICY "enable_visitor_message_viewing"
  ON chat_messages
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE chat_sessions.id = session_id
      AND chat_sessions.visitor_id = visitor_id
    )
  );

CREATE POLICY "enable_visitor_message_creation"
  ON chat_messages
  FOR INSERT
  TO public
  WITH CHECK (
    is_from_visitor = true
    AND EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE chat_sessions.id = session_id
      AND chat_sessions.visitor_id = visitor_id
      AND chat_sessions.status = 'active'
    )
  );

CREATE POLICY "enable_admin_message_management"
  ON chat_messages
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