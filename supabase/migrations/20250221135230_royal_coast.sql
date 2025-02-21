/*
  # Fix Chat Policies and Functions

  1. Changes
    - Drop existing policies
    - Create new simplified policies
    - Add session cleanup function
    - Add performance indexes

  2. Security
    - Enable public access for chat functionality
    - Add proper session management
*/

-- Drop existing policies
DROP POLICY IF EXISTS "enable_public_session_creation" ON chat_sessions;
DROP POLICY IF EXISTS "enable_public_session_viewing" ON chat_sessions;
DROP POLICY IF EXISTS "enable_public_session_update" ON chat_sessions;
DROP POLICY IF EXISTS "enable_admin_session_management" ON chat_sessions;
DROP POLICY IF EXISTS "enable_public_message_creation" ON chat_messages;
DROP POLICY IF EXISTS "enable_public_message_viewing" ON chat_messages;
DROP POLICY IF EXISTS "enable_admin_message_management" ON chat_messages;

-- Create simplified chat_sessions policies
CREATE POLICY "enable_public_session_creation"
  ON chat_sessions
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "enable_public_session_viewing"
  ON chat_sessions
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "enable_public_session_update"
  ON chat_sessions
  FOR UPDATE
  TO public
  USING (status = 'active')
  WITH CHECK (status IN ('active', 'closed'));

-- Create simplified chat_messages policies
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

CREATE POLICY "enable_public_message_viewing"
  ON chat_messages
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE id = session_id
    )
  );

-- Create admin policies
CREATE POLICY "enable_admin_session_management"
  ON chat_sessions
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

-- Create session cleanup function
CREATE OR REPLACE FUNCTION cleanup_inactive_sessions()
RETURNS void AS $$
BEGIN
  UPDATE chat_sessions
  SET status = 'closed'
  WHERE status = 'active'
  AND updated_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger function
CREATE OR REPLACE FUNCTION update_session_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS update_chat_session_timestamp ON chat_sessions;
CREATE TRIGGER update_chat_session_timestamp
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_session_timestamp();

-- Create indexes
CREATE INDEX IF NOT EXISTS chat_sessions_status_idx ON chat_sessions(status);
CREATE INDEX IF NOT EXISTS chat_sessions_visitor_id_idx ON chat_sessions(visitor_id);
CREATE INDEX IF NOT EXISTS chat_sessions_updated_at_idx ON chat_sessions(updated_at);
CREATE INDEX IF NOT EXISTS chat_messages_session_id_idx ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS chat_messages_created_at_idx ON chat_messages(created_at);