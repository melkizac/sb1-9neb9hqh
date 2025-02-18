/*
  # Add chat session close functionality

  1. Changes
    - Add policies to allow visitors to update their own chat sessions
    - Add policies to allow admins to update any chat session
    - Add constraint to ensure status is either 'active' or 'closed'

  2. Security
    - Visitors can only update their own sessions
    - Admins can update any session
    - Status values are restricted to valid options
*/

-- First drop existing policies
DROP POLICY IF EXISTS "enable_public_session_access" ON chat_sessions;

-- Create new policies for chat sessions
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

CREATE POLICY "enable_visitor_session_update"
  ON chat_sessions
  FOR UPDATE
  TO public
  USING (visitor_id::text = current_setting('visitor_id', true))
  WITH CHECK (
    visitor_id::text = current_setting('visitor_id', true)
    AND (status = 'closed' OR status = 'active')
  );

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

-- Add status constraint if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'chat_sessions_status_check'
  ) THEN
    ALTER TABLE chat_sessions
    ADD CONSTRAINT chat_sessions_status_check
    CHECK (status IN ('active', 'closed'));
  END IF;
END $$;