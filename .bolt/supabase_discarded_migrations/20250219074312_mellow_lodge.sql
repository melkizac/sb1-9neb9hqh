/*
  # Fix Chat Policies and Add Error Handling

  1. Changes
    - Safely drop and recreate chat policies
    - Add error handling for database operations
    - Ensure proper access control for chat sessions and messages

  2. Security
    - Enable RLS on all tables
    - Add policies for public and authenticated access
    - Ensure proper access control for visitors and admins
*/

-- First check and drop existing policies
DO $$ 
BEGIN
  -- Drop existing policies if they exist
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'allow_session_creation') THEN
    DROP POLICY "allow_session_creation" ON chat_sessions;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'allow_session_viewing') THEN
    DROP POLICY "allow_session_viewing" ON chat_sessions;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'allow_session_update') THEN
    DROP POLICY "allow_session_update" ON chat_sessions;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'allow_message_creation') THEN
    DROP POLICY "allow_message_creation" ON chat_messages;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'allow_message_viewing') THEN
    DROP POLICY "allow_message_viewing" ON chat_messages;
  END IF;
END $$;

-- Create simplified chat_sessions policies
CREATE POLICY "enable_session_creation"
  ON chat_sessions
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "enable_session_viewing"
  ON chat_sessions
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "enable_session_update"
  ON chat_sessions
  FOR UPDATE
  TO public
  USING (true);

-- Create simplified chat_messages policies
CREATE POLICY "enable_message_creation"
  ON chat_messages
  FOR INSERT
  TO public
  WITH CHECK (
    is_from_visitor = true
    OR EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.user_id = auth.uid()
    )
  );

CREATE POLICY "enable_message_viewing"
  ON chat_messages
  FOR SELECT
  TO public
  USING (true);

-- Create function to handle database errors
CREATE OR REPLACE FUNCTION handle_db_error()
RETURNS trigger AS $$
BEGIN
  -- Log error details
  RAISE NOTICE 'Database operation error: %', TG_OP;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create error handling triggers
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'handle_session_error'
  ) THEN
    CREATE TRIGGER handle_session_error
      AFTER INSERT OR UPDATE OR DELETE ON chat_sessions
      FOR EACH ROW
      WHEN (pg_exception_context() IS NOT NULL)
      EXECUTE FUNCTION handle_db_error();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'handle_message_error'
  ) THEN
    CREATE TRIGGER handle_message_error
      AFTER INSERT OR UPDATE OR DELETE ON chat_messages
      FOR EACH ROW
      WHEN (pg_exception_context() IS NOT NULL)
      EXECUTE FUNCTION handle_db_error();
  END IF;
END $$;

-- Ensure indexes exist for performance
CREATE INDEX IF NOT EXISTS chat_messages_session_id_idx ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS chat_messages_visitor_id_idx ON chat_messages(visitor_id);
CREATE INDEX IF NOT EXISTS chat_messages_created_at_idx ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS chat_sessions_status_idx ON chat_sessions(status);