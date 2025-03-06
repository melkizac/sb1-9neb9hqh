/*
  # Fix Auth Sessions Management

  1. Changes
    - Create function to manage auth sessions
    - Add trigger for session cleanup
    - Add performance indexes
  
  2. Security
    - Maintains RLS
    - Only affects authenticated sessions
*/

-- Create function to cleanup inactive sessions
CREATE OR REPLACE FUNCTION cleanup_inactive_auth_sessions()
RETURNS void AS $$
BEGIN
  -- Delete sessions that haven't been used in 24 hours
  DELETE FROM auth.sessions
  WHERE updated_at < NOW() - INTERVAL '24 hours';
  
  -- Create new session if needed for admin user
  INSERT INTO auth.sessions (
    id,
    user_id,
    created_at,
    updated_at,
    factor_id,
    aal,
    not_after
  )
  SELECT 
    gen_random_uuid(),
    admin_users.user_id,
    NOW(),
    NOW(),
    NULL,
    'aal1',
    NULL
  FROM admin_users
  WHERE NOT EXISTS (
    SELECT 1 FROM auth.sessions 
    WHERE auth.sessions.user_id = admin_users.user_id
    AND auth.sessions.updated_at > NOW() - INTERVAL '24 hours'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically cleanup inactive sessions
CREATE OR REPLACE FUNCTION trigger_cleanup_inactive_auth_sessions()
RETURNS trigger AS $$
BEGIN
  PERFORM cleanup_inactive_auth_sessions();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS cleanup_inactive_auth_sessions_trigger ON auth.sessions;
CREATE TRIGGER cleanup_inactive_auth_sessions_trigger
  AFTER DELETE OR UPDATE ON auth.sessions
  FOR EACH STATEMENT
  EXECUTE FUNCTION trigger_cleanup_inactive_auth_sessions();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS auth_sessions_user_id_idx ON auth.sessions(user_id);
CREATE INDEX IF NOT EXISTS auth_sessions_updated_at_idx ON auth.sessions(updated_at);

-- Run initial cleanup
SELECT cleanup_inactive_auth_sessions();