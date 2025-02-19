/*
  # Fix admin message creation policies

  1. Changes
    - Drop existing policies
    - Create more permissive admin policies
    - Ensure admins can perform all operations on messages
    - Maintain visitor policies

  2. Security
    - Keep visitor restrictions in place
    - Allow full admin access when authenticated
*/

-- First drop existing policies
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "enable_session_message_viewing" ON chat_messages;
  DROP POLICY IF EXISTS "enable_visitor_message_creation" ON chat_messages;
  DROP POLICY IF EXISTS "enable_admin_message_creation" ON chat_messages;
END $$;

-- Create new policies

-- Allow viewing messages (both visitors and admins)
CREATE POLICY "enable_message_viewing"
  ON chat_messages
  FOR SELECT
  TO public
  USING (
    -- Visitors can see messages from their sessions
    (
      EXISTS (
        SELECT 1 FROM chat_sessions
        WHERE chat_sessions.id = session_id
      )
    )
    OR
    -- Admins can see all messages
    (
      EXISTS (
        SELECT 1 FROM admin_users
        WHERE admin_users.user_id = auth.uid()
      )
    )
  );

-- Allow visitors to create messages
CREATE POLICY "enable_visitor_message_creation"
  ON chat_messages
  FOR INSERT
  TO public
  WITH CHECK (
    is_from_visitor = true
    AND EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE id = session_id
      AND status = 'active'
    )
  );

-- Allow full admin access to messages
CREATE POLICY "enable_admin_message_management"
  ON chat_messages
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Ensure indexes exist for performance
CREATE INDEX IF NOT EXISTS chat_messages_session_id_idx 
  ON chat_messages(session_id);

CREATE INDEX IF NOT EXISTS chat_messages_created_at_idx 
  ON chat_messages(created_at DESC); 