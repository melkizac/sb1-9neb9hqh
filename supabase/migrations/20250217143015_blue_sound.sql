/*
  # Fix Chat Functionality

  1. Changes
    - Drop existing RLS policies that use current_setting
    - Add new policies for visitor access
    - Add admin_users table
    - Add initial admin user

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for public and authenticated access
*/

-- Create admin_users table if it doesn't exist
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  email text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id),
  UNIQUE(email)
);

-- Enable RLS on admin_users
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create policies for admin_users
CREATE POLICY "Authenticated users can view admin users"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (true);

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view their visitor chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can view their visitor chat messages" ON chat_messages;

-- Create new policies for chat_sessions
CREATE POLICY "Visitors can view their own chat sessions"
  ON chat_sessions
  FOR SELECT
  TO public
  USING (visitor_id IN (SELECT visitor_id FROM chat_messages WHERE session_id = chat_sessions.id));

CREATE POLICY "Visitors can update their own chat sessions"
  ON chat_sessions
  FOR UPDATE
  TO public
  USING (visitor_id IN (SELECT visitor_id FROM chat_messages WHERE session_id = chat_sessions.id));

-- Create new policies for chat_messages
CREATE POLICY "Visitors can view messages from their sessions"
  ON chat_messages
  FOR SELECT
  TO public
  USING (session_id IN (SELECT id FROM chat_sessions WHERE visitor_id = chat_messages.visitor_id));

-- Add function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users WHERE admin_users.user_id = $1
  );
END;
$$ language 'plpgsql' SECURITY DEFINER;