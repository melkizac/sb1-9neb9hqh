-- First drop existing policies
DO $$ 
BEGIN
  -- Drop chat_messages policies
  DROP POLICY IF EXISTS "enable_message_viewing" ON chat_messages;
  DROP POLICY IF EXISTS "enable_visitor_message_creation" ON chat_messages;
  DROP POLICY IF EXISTS "enable_admin_message_creation" ON chat_messages;
END $$;

-- Create simplified chat_messages policies
CREATE POLICY "enable_public_message_viewing"
  ON chat_messages
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "enable_public_message_creation"
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

CREATE POLICY "enable_authenticated_message_creation"
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
CREATE INDEX IF NOT EXISTS chat_messages_session_visitor_idx 
ON chat_messages(session_id, visitor_id);

CREATE INDEX IF NOT EXISTS chat_messages_created_at_idx 
ON chat_messages(created_at DESC);