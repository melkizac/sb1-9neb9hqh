-- First drop existing policies
DO $$ 
BEGIN
  -- Drop chat_messages policies
  DROP POLICY IF EXISTS "allow_all_message_viewing" ON chat_messages;
  DROP POLICY IF EXISTS "allow_all_message_creation" ON chat_messages;
END $$;

-- Create simplified chat_messages policies
CREATE POLICY "enable_all_message_operations"
  ON chat_messages
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (
    -- For visitors: only allow creating messages in active sessions
    (is_from_visitor AND EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE id = session_id
      AND status = 'active'
    ))
    OR
    -- For admins: allow creating messages if authenticated as admin
    (NOT is_from_visitor AND EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.user_id = auth.uid()
    ))
  );

-- Ensure all necessary indexes exist
CREATE INDEX IF NOT EXISTS chat_messages_session_id_idx ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS chat_messages_visitor_id_idx ON chat_messages(visitor_id);
CREATE INDEX IF NOT EXISTS chat_messages_created_at_idx ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS chat_sessions_status_idx ON chat_sessions(status);