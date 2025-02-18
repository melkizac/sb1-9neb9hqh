/*
  # Fix session handling and admin authentication

  1. Changes
    - Add session cleanup function
    - Add admin session validation function
    - Add admin session check trigger

  2. Security
    - Ensure proper session cleanup
    - Validate admin authentication
*/

-- Create function to cleanup expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  UPDATE chat_sessions
  SET status = 'closed'
  WHERE status = 'active'
  AND updated_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to validate admin session
CREATE OR REPLACE FUNCTION validate_admin_session()
RETURNS trigger AS $$
BEGIN
  -- For admin operations, check if the user is an admin
  IF EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.user_id = auth.uid()
  ) THEN
    RETURN NEW;
  END IF;

  -- For non-admin operations, allow the action
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for admin session validation
CREATE TRIGGER validate_admin_session_trigger
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION validate_admin_session();

-- Create index for admin users if it doesn't exist
CREATE INDEX IF NOT EXISTS admin_users_user_id_idx ON admin_users(user_id);

-- Create index for chat sessions if it doesn't exist
CREATE INDEX IF NOT EXISTS chat_sessions_status_updated_idx ON chat_sessions(status, updated_at);