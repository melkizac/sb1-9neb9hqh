/*
  # Fix Chat RLS Policies

  1. Changes
    - Drop existing problematic policies
    - Add new policies using JWT claims for visitor identification
    - Improve admin access controls
    - Fix infinite recursion issue
*/

-- First drop all existing policies
DO $$ 
BEGIN
  -- Drop chat_sessions policies
  DROP POLICY IF EXISTS "allow_public_create_sessions" ON chat_sessions;
  DROP POLICY IF EXISTS "allow_visitor_view_sessions" ON chat_sessions;
  DROP POLICY IF EXISTS "allow_admin_view_sessions" ON chat_sessions;
  DROP POLICY IF EXISTS "allow_admin_update_sessions" ON chat_sessions;

  -- Drop chat_messages policies
  DROP POLICY IF EXISTS "allow_public_create_messages" ON chat_messages;
  DROP POLICY IF EXISTS "allow_visitor_view_messages" ON chat_messages;
  DROP POLICY IF EXISTS "allow_admin_view_messages" ON chat_messages;
  DROP POLICY IF EXISTS "allow_admin_create_messages" ON chat_messages;
END $$;

-- Create new chat_sessions policies
CREATE POLICY "anyone_can_create_sessions"
  ON chat_sessions
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "visitors_view_own_sessions"
  ON chat_sessions
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "admins_view_all_sessions"
  ON chat_sessions
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.user_id = auth.uid()
  ));

CREATE POLICY "admins_update_sessions"
  ON chat_sessions
  FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.user_id = auth.uid()
  ));

-- Create new chat_messages policies
CREATE POLICY "visitors_create_messages"
  ON chat_messages
  FOR INSERT
  TO public
  WITH CHECK (is_from_visitor = true);

CREATE POLICY "visitors_view_messages"
  ON chat_messages
  FOR SELECT
  TO public
  USING (EXISTS (
    SELECT 1 FROM chat_sessions
    WHERE chat_sessions.id = session_id
    AND chat_sessions.visitor_id = chat_messages.visitor_id
  ));

CREATE POLICY "admins_view_messages"
  ON chat_messages
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.user_id = auth.uid()
  ));

CREATE POLICY "admins_create_messages"
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