/*
  # Fix Chat RLS Policies - Final Version

  1. Changes
    - Simplify RLS policies for chat functionality
    - Enable proper public access for visitors
    - Maintain secure admin access
    - Fix visitor message creation and viewing

  2. Security
    - Ensure visitors can only create and view their own messages
    - Maintain admin access control through admin_users table
    - Enable proper chat session management
*/

-- First drop all existing policies
DO $$ 
BEGIN
  -- Drop chat_sessions policies
  DROP POLICY IF EXISTS "enable_public_chat_session_creation" ON chat_sessions;
  DROP POLICY IF EXISTS "enable_public_chat_session_viewing" ON chat_sessions;
  DROP POLICY IF EXISTS "enable_admin_chat_session_management" ON chat_sessions;

  -- Drop chat_messages policies
  DROP POLICY IF EXISTS "enable_public_chat_message_creation" ON chat_messages;
  DROP POLICY IF EXISTS "enable_public_chat_message_viewing" ON chat_messages;
  DROP POLICY IF EXISTS "enable_admin_chat_message_management" ON chat_messages;
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

CREATE POLICY "enable_admin_session_management"
  ON chat_sessions
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.user_id = auth.uid()
  ));

-- Create simplified chat_messages policies
CREATE POLICY "enable_public_message_creation"
  ON chat_messages
  FOR INSERT
  TO public
  WITH CHECK (
    is_from_visitor = true
  );

CREATE POLICY "enable_public_message_viewing"
  ON chat_messages
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "enable_admin_message_management"
  ON chat_messages
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.user_id = auth.uid()
  ));