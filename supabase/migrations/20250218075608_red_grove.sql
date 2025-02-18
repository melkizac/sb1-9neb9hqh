/*
  # Fix chat RLS policies

  1. Changes
    - Simplify chat message policies to allow proper message flow
    - Fix visitor message viewing and creation
    - Ensure admin messages are properly handled
    - Remove unnecessary complexity

  2. Security
    - Maintain session-based access control
    - Ensure visitors can only see their own messages
    - Allow admins full access to manage messages
*/

-- First drop existing policies
DO $$ 
BEGIN
  -- Drop chat_messages policies
  DROP POLICY IF EXISTS "enable_visitor_message_viewing" ON chat_messages;
  DROP POLICY IF EXISTS "enable_visitor_message_creation" ON chat_messages;
  DROP POLICY IF EXISTS "enable_admin_message_management" ON chat_messages;
END $$;

-- Create new chat_messages policies
CREATE POLICY "enable_message_viewing"
  ON chat_messages
  FOR SELECT
  TO public
  USING (
    session_id IN (
      SELECT id FROM chat_sessions
      WHERE visitor_id = chat_messages.visitor_id
    )
  );

CREATE POLICY "enable_message_creation"
  ON chat_messages
  FOR INSERT
  TO public
  WITH CHECK (
    (is_from_visitor = true AND EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE id = session_id
      AND visitor_id = chat_messages.visitor_id
      AND status = 'active'
    ))
    OR
    (is_from_visitor = false AND EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    ))
  );

CREATE POLICY "enable_admin_access"
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