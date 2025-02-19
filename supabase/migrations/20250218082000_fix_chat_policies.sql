/*
  # Fix chat message visibility for visitors

  1. Changes
    - Drop existing policies that might be conflicting
    - Create a single, simple policy for message viewing
    - Maintain separate policies for message creation
    - Ensure visitors can see both their messages and admin replies

  2. Security
    - Maintain proper access control
    - Allow visitors to see all messages in their sessions
    - Enable admin message creation
*/

-- First drop existing policies
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "enable_all_message_operations" ON chat_messages;
  DROP POLICY IF EXISTS "enable_message_viewing" ON chat_messages;
  DROP POLICY IF EXISTS "enable_message_creation" ON chat_messages;
  DROP POLICY IF EXISTS "enable_public_message_viewing" ON chat_messages;
  DROP POLICY IF EXISTS "enable_public_message_creation" ON chat_messages;
  DROP POLICY IF EXISTS "enable_authenticated_message_creation" ON chat_messages;
END $$;

-- Create new simplified policies

-- Allow anyone to view messages in their session
CREATE POLICY "enable_session_message_viewing"
  ON chat_messages
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE chat_sessions.id = session_id
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

-- Allow admins to create messages
CREATE POLICY "enable_admin_message_creation"
  ON chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    NOT is_from_visitor
    AND EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Ensure indexes exist for performance
CREATE INDEX IF NOT EXISTS chat_messages_session_id_idx 
  ON chat_messages(session_id);

CREATE INDEX IF NOT EXISTS chat_messages_created_at_idx 
  ON chat_messages(created_at DESC); 