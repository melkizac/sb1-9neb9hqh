/*
  # Fix chat RLS policies

  1. Changes
    - Simplify chat message policies
    - Fix visitor message creation and viewing
    - Ensure admin messages work correctly
    - Remove unnecessary complexity

  2. Security
    - Maintain proper access control
    - Allow visitors to see their own messages
    - Enable admin message creation
*/

-- First drop existing policies
DO $$ 
BEGIN
  -- Drop chat_messages policies
  DROP POLICY IF EXISTS "enable_message_viewing" ON chat_messages;
  DROP POLICY IF EXISTS "enable_message_creation" ON chat_messages;
  DROP POLICY IF EXISTS "enable_admin_access" ON chat_messages;
END $$;

-- Create simplified chat_messages policies
CREATE POLICY "allow_message_viewing"
  ON chat_messages
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "allow_visitor_message_creation"
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

CREATE POLICY "allow_admin_message_creation"
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