/*
  # Fix admin chat message creation

  1. Changes
    - Drop existing message policies
    - Create new policies that properly handle admin message creation
    - Add proper checks for admin authentication
*/

-- First drop existing policies
DO $$ 
BEGIN
  -- Drop chat_messages policies
  DROP POLICY IF EXISTS "enable_message_viewing" ON chat_messages;
  DROP POLICY IF EXISTS "enable_message_creation" ON chat_messages;
END $$;

-- Create new chat_messages policies
CREATE POLICY "enable_message_viewing"
  ON chat_messages
  FOR SELECT
  TO public
  USING (true);

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

-- Add indexes for better performance if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'chat_messages' 
    AND indexname = 'chat_messages_session_created_idx'
  ) THEN
    CREATE INDEX chat_messages_session_created_idx 
    ON chat_messages(session_id, created_at);
  END IF;
END $$;