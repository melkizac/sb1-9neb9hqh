/*
  # Fix Chat RLS Policies

  1. Changes
    - Drop all existing policies
    - Create simplified policies that avoid recursion
    - Improve visitor session handling
    - Fix admin access controls
*/

-- First drop all existing policies
DO $$ 
BEGIN
  -- Drop chat_sessions policies
  DROP POLICY IF EXISTS "anyone_can_create_sessions" ON chat_sessions;
  DROP POLICY IF EXISTS "visitors_view_own_sessions" ON chat_sessions;
  DROP POLICY IF EXISTS "admins_view_all_sessions" ON chat_sessions;
  DROP POLICY IF EXISTS "admins_update_sessions" ON chat_sessions;

  -- Drop chat_messages policies
  DROP POLICY IF EXISTS "visitors_create_messages" ON chat_messages;
  DROP POLICY IF EXISTS "visitors_view_messages" ON chat_messages;
  DROP POLICY IF EXISTS "admins_view_messages" ON chat_messages;
  DROP POLICY IF EXISTS "admins_create_messages" ON chat_messages;
END $$;

-- Create new chat_sessions policies
CREATE POLICY "enable_public_create_sessions"
  ON chat_sessions
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "enable_public_view_sessions"
  ON chat_sessions
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "enable_admin_update_sessions"
  ON chat_sessions
  FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.user_id = auth.uid()
  ));

-- Create new chat_messages policies
CREATE POLICY "enable_public_create_messages"
  ON chat_messages
  FOR INSERT
  TO public
  WITH CHECK (is_from_visitor = true);

CREATE POLICY "enable_public_view_messages"
  ON chat_messages
  FOR SELECT
  TO public
  USING (session_id IN (
    SELECT id FROM chat_sessions 
    WHERE visitor_id = chat_messages.visitor_id
  ));

CREATE POLICY "enable_admin_create_messages"
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

CREATE POLICY "enable_admin_view_messages"
  ON chat_messages
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.user_id = auth.uid()
  ));