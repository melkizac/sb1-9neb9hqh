-- Drop existing policies and triggers first
DO $$ 
BEGIN
  -- Drop existing trigger if it exists
  DROP TRIGGER IF EXISTS validate_admin_session_trigger ON chat_sessions;
  
  -- Drop existing functions
  DROP FUNCTION IF EXISTS validate_admin_session();
  DROP FUNCTION IF EXISTS cleanup_expired_sessions();
END $$;

-- Create improved session cleanup function
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  -- Mark sessions as closed if they're inactive for 24 hours
  UPDATE chat_sessions
  SET 
    status = 'closed',
    updated_at = NOW()
  WHERE 
    status = 'active'
    AND updated_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to handle session state changes
CREATE OR REPLACE FUNCTION handle_session_state_change()
RETURNS trigger AS $$
BEGIN
  -- Always update the updated_at timestamp
  NEW.updated_at = NOW();
  
  -- Validate status changes
  IF NEW.status NOT IN ('active', 'closed') THEN
    RAISE EXCEPTION 'Invalid session status. Must be either "active" or "closed"';
  END IF;
  
  -- Prevent reopening closed sessions
  IF OLD.status = 'closed' AND NEW.status = 'active' THEN
    RAISE EXCEPTION 'Cannot reopen closed sessions';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for session state changes
CREATE TRIGGER handle_session_state_change_trigger
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION handle_session_state_change();

-- Create function to automatically close sessions on auth signout
CREATE OR REPLACE FUNCTION close_user_sessions()
RETURNS trigger AS $$
BEGIN
  -- Close all active sessions for the user
  UPDATE chat_sessions
  SET 
    status = 'closed',
    updated_at = NOW()
  WHERE 
    status = 'active'
    AND visitor_id = OLD.id::text;
    
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to close sessions on auth signout
CREATE TRIGGER close_user_sessions_trigger
  BEFORE DELETE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION close_user_sessions();

-- Ensure indexes exist for performance
CREATE INDEX IF NOT EXISTS chat_sessions_visitor_status_idx 
ON chat_sessions(visitor_id, status);

CREATE INDEX IF NOT EXISTS chat_sessions_updated_at_idx 
ON chat_sessions(updated_at);

-- Update existing sessions to ensure consistency
UPDATE chat_sessions
SET updated_at = NOW()
WHERE updated_at IS NULL;