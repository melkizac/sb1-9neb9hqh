/*
  # Create link clicks tracking table

  1. New Tables
    - `link_clicks`
      - `id` (uuid, primary key)
      - `link_id` (text, not null)
      - `count` (integer, default 0)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Functions
    - `increment_link_click`: Increments click count for a link
*/

-- Create link_clicks table
CREATE TABLE IF NOT EXISTS link_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id text NOT NULL,
  count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE link_clicks ENABLE ROW LEVEL SECURITY;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_link_clicks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_link_clicks_updated_at
  BEFORE UPDATE ON link_clicks
  FOR EACH ROW
  EXECUTE FUNCTION update_link_clicks_updated_at();

-- Create increment function
CREATE OR REPLACE FUNCTION increment_link_click(link_id text)
RETURNS void AS $$
BEGIN
  INSERT INTO link_clicks (link_id, count)
  VALUES (link_id, 1)
  ON CONFLICT (link_id) DO UPDATE
  SET count = link_clicks.count + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create policies
CREATE POLICY "Enable read access for all users"
  ON link_clicks
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Enable insert/update for authenticated users"
  ON link_clicks
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS link_clicks_link_id_idx ON link_clicks(link_id);
CREATE INDEX IF NOT EXISTS link_clicks_count_idx ON link_clicks(count DESC);