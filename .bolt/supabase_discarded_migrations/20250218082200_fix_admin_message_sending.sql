/*
  # Fix admin message sending

  1. Changes
    - Drop all existing chat message policies to start fresh
    - Create simplified policies for both viewing and creation
    - Fix admin message creation by removing unnecessary restrictions
    - Ensure proper session and visitor handling

  2. Security
    - Maintain basic security while allowing proper functionality
    - Keep visitor message creation restricted to active sessions
    - Allow admins full access when authenticated
*/

-- First drop ALL existing policies to start fresh
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "enable_session_message_viewing" ON chat_messages;
  DROP POLICY IF EXISTS "enable_visitor_message_creation" ON chat_messages;
  DROP POLICY IF EXISTS "enable_admin_message_creation" ON chat_messages;
  DROP POLICY IF EXISTS "enable_admin_message_management" ON chat_messages;
  DROP POLICY IF EXISTS "enable_message_viewing" ON chat_messages;
  DROP POLICY IF EXISTS "enable_all_message_operations" ON chat_messages;
  DROP POLICY IF EXISTS "allow_all_message_viewing" ON chat_messages;
  DROP POLICY IF EXISTS "allow_all_message_creation" ON chat_messages;
END $$;

-- Create new simplified policies

-- 1. Message Viewing Policy (applies to both visitors and admins)
CREATE POLICY "enable_message_viewing"
  ON chat_messages
  FOR SELECT
  TO public
  USING (true);

-- 2. Message Creation Policy (handles both visitor and admin cases)
CREATE POLICY "enable_message_creation"
  ON chat_messages
  FOR INSERT
  TO public
  WITH CHECK (
    -- Case 1: Visitor creating a message
    (
      is_from_visitor = true
      AND EXISTS (
        SELECT 1 FROM chat_sessions
        WHERE id = session_id
        AND status = 'active'
      )
    )
    OR
    -- Case 2: Admin creating a message
    (
      is_from_visitor = false
      AND EXISTS (
        SELECT 1 FROM admin_users
        WHERE admin_users.user_id = auth.uid()
      )
    )
  );

-- 3. Admin Management Policy (allows admins to manage all messages)
CREATE POLICY "enable_admin_management"
  ON chat_messages
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Ensure all necessary indexes exist
CREATE INDEX IF NOT EXISTS chat_messages_session_id_idx ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS chat_messages_visitor_id_idx ON chat_messages(visitor_id);
CREATE INDEX IF NOT EXISTS chat_messages_created_at_idx ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS chat_sessions_status_idx ON chat_sessions(status); 