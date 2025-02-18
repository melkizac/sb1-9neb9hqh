/*
  # Fix Chat Policies

  1. Changes
    - Simplify RLS policies for chat sessions and messages
    - Allow authenticated users to view and manage all chat data
    - Ensure visitors can only access their own chat data
    - Fix session management and message handling

  2. Security
    - Maintain strict access control for visitors
    - Grant full access to authenticated admins
    - Protect visitor privacy
*/

-- First drop all existing policies
DO $$ 
BEGIN
  -- Drop chat_sessions policies
  DROP POLICY IF EXISTS "enable_public_create_sessions" ON chat_sessions;
  DROP POLICY IF EXISTS "enable_public_view_sessions" ON chat_sessions;
  DROP POLICY IF EXISTS "enable_admin_update_sessions" ON chat_sessions;

  -- Drop chat_messages policies
  DROP POLICY IF EXISTS "enable_public_create_messages" ON chat_messages;
  DROP POLICY IF EXISTS "enable_public_view_messages" ON chat_messages;
  DROP POLICY IF EXISTS "enable_admin_create_messages" ON chat_messages;
  DROP POLICY IF EXISTS "enable_admin_view_messages" ON chat_messages;
END $$;

-- Create simplified chat_sessions policies
CREATE POLICY "allow_visitor_create_sessions"
  ON chat_sessions
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "allow_visitor_view_own_sessions"
  ON chat_sessions
  FOR SELECT
  TO public
  USING (visitor_id::text = current_setting('visitor_id', true));

CREATE POLICY "allow_admin_full_access_sessions"
  ON chat_sessions
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create simplified chat_messages policies
CREATE POLICY "allow_visitor_create_messages"
  ON chat_messages
  FOR INSERT
  TO public
  WITH CHECK (
    is_from_visitor = true
    AND EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE id = session_id
      AND visitor_id::text = current_setting('visitor_id', true)
    )
  );

CREATE POLICY "allow_visitor_view_own_messages"
  ON chat_messages
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE id = session_id
      AND visitor_id::text = current_setting('visitor_id', true)
    )
  );

CREATE POLICY "allow_admin_full_access_messages"
  ON chat_messages
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);