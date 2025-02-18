/*
  # Fix Chat Session Policies

  1. Changes
    - Drop all existing chat policies
    - Create new visitor and admin access policies
    - Fix authentication policies
  
  2. Security
    - Enable RLS
    - Add clear policies for visitor and admin access
*/

-- First drop all existing policies to ensure clean slate
DO $$ 
BEGIN
  -- Drop chat_sessions policies
  DROP POLICY IF EXISTS "Public can create chat sessions" ON chat_sessions;
  DROP POLICY IF EXISTS "Users can view their visitor chat sessions" ON chat_sessions;
  DROP POLICY IF EXISTS "Visitors can view their own chat sessions" ON chat_sessions;
  DROP POLICY IF EXISTS "Authenticated users can view all chat sessions" ON chat_sessions;
  DROP POLICY IF EXISTS "Authenticated users can update chat sessions" ON chat_sessions;
  DROP POLICY IF EXISTS "Visitors can view own sessions" ON chat_sessions;
  DROP POLICY IF EXISTS "Admins can view all sessions" ON chat_sessions;

  -- Drop chat_messages policies
  DROP POLICY IF EXISTS "Public can create chat messages" ON chat_messages;
  DROP POLICY IF EXISTS "Users can view their visitor chat messages" ON chat_messages;
  DROP POLICY IF EXISTS "Visitors can view messages from their sessions" ON chat_messages;
  DROP POLICY IF EXISTS "Authenticated users can view all chat messages" ON chat_messages;
  DROP POLICY IF EXISTS "Authenticated users can send chat messages" ON chat_messages;
  DROP POLICY IF EXISTS "Public can create messages" ON chat_messages;
  DROP POLICY IF EXISTS "Visitors can view own messages" ON chat_messages;
  DROP POLICY IF EXISTS "Admins can view all messages" ON chat_messages;
END $$;

-- Create new chat_sessions policies
CREATE POLICY "allow_public_create_sessions"
  ON chat_sessions
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "allow_visitor_view_sessions"
  ON chat_sessions
  FOR SELECT
  TO public
  USING (visitor_id = current_setting('visitor_id', true));

CREATE POLICY "allow_admin_view_sessions"
  ON chat_sessions
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.user_id = auth.uid()
  ));

CREATE POLICY "allow_admin_update_sessions"
  ON chat_sessions
  FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.user_id = auth.uid()
  ));

-- Create new chat_messages policies
CREATE POLICY "allow_public_create_messages"
  ON chat_messages
  FOR INSERT
  TO public
  WITH CHECK (is_from_visitor = true);

CREATE POLICY "allow_visitor_view_messages"
  ON chat_messages
  FOR SELECT
  TO public
  USING (visitor_id = current_setting('visitor_id', true));

CREATE POLICY "allow_admin_view_messages"
  ON chat_messages
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.user_id = auth.uid()
  ));

CREATE POLICY "allow_admin_create_messages"
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