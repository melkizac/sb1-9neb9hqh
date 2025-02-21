/*
  # Fix Chat Functionality

  1. Changes
    - Drop existing chat policies
    - Create new simplified policies for chat sessions and messages
    - Add necessary indexes for performance
    - Add trigger for session cleanup

  2. Security
    - Enable RLS on both tables
    - Add policies for public and admin access
    - Ensure proper session management
*/

-- First drop all existing policies
DO $$ 
BEGIN
  -- Drop chat_sessions policies
  DROP POLICY IF EXISTS "enable_session_operations" ON chat_sessions;
  DROP POLICY IF EXISTS "allow_session_creation" ON chat_sessions;
  DROP POLICY IF EXISTS "allow_session_viewing" ON chat_sessions;
  DROP POLICY IF EXISTS "allow_session_update" ON chat_sessions;
  DROP POLICY IF EXISTS "allow_admin_management" ON chat_sessions;

  -- Drop chat_messages policies
  DROP POLICY IF EXISTS "enable_message_operations" ON chat_messages;
  DROP POLICY IF EXISTS "enable_all_message_operations" ON chat_messages;
  DROP POLICY IF EXISTS "enable_message_viewing" ON chat_messages;
  DROP POLICY IF EXISTS "enable_message_creation" ON chat_messages;
END $$;

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

-- Create trigger for session cleanup
CREATE OR REPLACE FUNCTION update_session_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_chat_session_timestamp
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_session_timestamp();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS chat_sessions_status_idx ON chat_sessions(status);
CREATE INDEX IF NOT EXISTS chat_sessions_visitor_id_idx ON chat_sessions(visitor_id);
CREATE INDEX IF NOT EXISTS chat_sessions_updated_at_idx ON chat_sessions(updated_at);
CREATE INDEX IF NOT EXISTS chat_messages_session_id_idx ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS chat_messages_created_at_idx ON chat_messages(created_at);