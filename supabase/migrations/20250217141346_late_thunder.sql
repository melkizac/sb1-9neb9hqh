/*
  # Chat System Schema

  1. New Tables
    - `chat_sessions`
      - `id` (uuid, primary key)
      - `visitor_id` (text)
      - `visitor_name` (text, optional)
      - `visitor_email` (text, optional)
      - `status` ('active' or 'closed')
      - `last_message_at` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `chat_messages`
      - `id` (uuid, primary key)
      - `session_id` (uuid, references chat_sessions)
      - `user_id` (uuid, references auth.users)
      - `visitor_id` (text)
      - `content` (text)
      - `is_from_visitor` (boolean)
      - `read` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Public policies for visitors to create sessions and messages
    - Authenticated policies for admin users to manage chats
    
  3. Triggers
    - Update `updated_at` timestamp for chat sessions
    - Update `last_message_at` when new messages are added
*/

-- Create chat_sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id text NOT NULL,
  visitor_name text,
  visitor_email text,
  status text NOT NULL DEFAULT 'active',
  last_message_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('active', 'closed'))
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES chat_sessions ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users,
  visitor_id text NOT NULL,
  content text NOT NULL,
  is_from_visitor boolean NOT NULL DEFAULT true,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create updated_at trigger for chat_sessions
CREATE OR REPLACE FUNCTION update_chat_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_chat_sessions_updated_at
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_sessions_updated_at();

-- Create trigger to update last_message_at in chat_sessions
CREATE OR REPLACE FUNCTION update_chat_session_last_message_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chat_sessions
  SET last_message_at = NEW.created_at
  WHERE id = NEW.session_id;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_chat_session_last_message_at
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_session_last_message_at();

-- Create policies for chat_sessions
CREATE POLICY "Public can create chat sessions"
  ON chat_sessions
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can view their visitor chat sessions"
  ON chat_sessions
  FOR SELECT
  TO public
  USING (visitor_id = current_setting('visitor_id', true));

CREATE POLICY "Authenticated users can view all chat sessions"
  ON chat_sessions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update chat sessions"
  ON chat_sessions
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create policies for chat_messages
CREATE POLICY "Public can create chat messages"
  ON chat_messages
  FOR INSERT
  TO public
  WITH CHECK (is_from_visitor = true);

CREATE POLICY "Users can view their visitor chat messages"
  ON chat_messages
  FOR SELECT
  TO public
  USING (visitor_id = current_setting('visitor_id', true));

CREATE POLICY "Authenticated users can view all chat messages"
  ON chat_messages
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can send chat messages"
  ON chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (is_from_visitor = false AND user_id = auth.uid());

-- Create indexes
CREATE INDEX IF NOT EXISTS chat_sessions_visitor_id_idx ON chat_sessions(visitor_id);
CREATE INDEX IF NOT EXISTS chat_sessions_status_idx ON chat_sessions(status);
CREATE INDEX IF NOT EXISTS chat_sessions_last_message_at_idx ON chat_sessions(last_message_at);
CREATE INDEX IF NOT EXISTS chat_messages_session_id_idx ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS chat_messages_visitor_id_idx ON chat_messages(visitor_id);
CREATE INDEX IF NOT EXISTS chat_messages_created_at_idx ON chat_messages(created_at);