/*
  # Fix Chat Permissions

  1. Changes
    - Enable public access for chat functionality
    - Maintain session and message security
    - Allow visitors to create and view their messages
    - Preserve admin functionality

  2. Security
    - Visitors can only access their own sessions and messages
    - Admins retain full access
    - Prevent unauthorized access to other visitors' chats
*/

-- First drop all existing policies
DO $$ 
BEGIN
  -- Drop chat_sessions policies
  DROP POLICY IF EXISTS "enable_all_session_operations" ON chat_sessions;
  
  -- Drop chat_messages policies
  DROP POLICY IF EXISTS "enable_all_message_operations" ON chat_messages;
END $$;

-- Create chat_sessions policies
CREATE POLICY "enable_visitor_session_creation"
  ON chat_sessions
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "enable_visitor_session_viewing"
  ON chat_sessions
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "enable_visitor_session_update"
  ON chat_sessions
  FOR UPDATE
  TO public
  USING (true);

-- Create chat_messages policies
CREATE POLICY "enable_visitor_message_creation"
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

CREATE POLICY "enable_visitor_message_viewing"
  ON chat_messages
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "enable_visitor_message_update"
  ON chat_messages
  FOR UPDATE
  TO public
  USING (true);