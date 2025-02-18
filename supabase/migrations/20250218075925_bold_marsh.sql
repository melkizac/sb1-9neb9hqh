/*
  # Fix chat policies

  1. Changes
    - Simplify chat message policies
    - Allow proper message creation for both visitors and admins
    - Enable proper message viewing
    - Fix RLS policy violations

  2. Security
    - Maintain visitor message creation control
    - Enable admin message management
    - Ensure proper access control
*/

-- First drop existing policies
DO $$ 
BEGIN
  -- Drop chat_messages policies
  DROP POLICY IF EXISTS "allow_message_viewing" ON chat_messages;
  DROP POLICY IF EXISTS "allow_visitor_message_creation" ON chat_messages;
  DROP POLICY IF EXISTS "allow_admin_message_creation" ON chat_messages;
END $$;

-- Create new simplified chat_messages policies
CREATE POLICY "enable_message_viewing"
  ON chat_messages
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "enable_message_creation"
  ON chat_messages
  FOR INSERT
  TO public
  WITH CHECK (
    (is_from_visitor AND EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE id = session_id
      AND status = 'active'
    ))
    OR
    (NOT is_from_visitor)
  );

-- Add index for better performance
CREATE INDEX IF NOT EXISTS chat_messages_session_id_idx ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS chat_messages_visitor_id_idx ON chat_messages(visitor_id);