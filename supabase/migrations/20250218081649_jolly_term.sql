-- First drop existing policies
DO $$ 
BEGIN
  -- Drop chat_messages policies
  DROP POLICY IF EXISTS "enable_public_message_viewing" ON chat_messages;
  DROP POLICY IF EXISTS "enable_public_message_creation" ON chat_messages;
  DROP POLICY IF EXISTS "enable_authenticated_message_creation" ON chat_messages;
END $$;

-- Create simplified chat_messages policies
CREATE POLICY "allow_all_message_viewing"
  ON chat_messages
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "allow_all_message_creation"
  ON chat_messages
  FOR INSERT
  TO public
  WITH CHECK (
    (is_from_visitor = true AND EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE id = session_id
      AND status = 'active'
    ))
    OR 
    (NOT is_from_visitor AND EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.user_id = auth.uid()
    ))
  );

-- Ensure indexes exist for performance
CREATE INDEX IF NOT EXISTS chat_messages_session_status_idx 
ON chat_sessions(id, status);

CREATE INDEX IF NOT EXISTS chat_messages_admin_user_idx 
ON admin_users(user_id);