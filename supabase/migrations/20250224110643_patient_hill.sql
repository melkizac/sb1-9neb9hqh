-- Drop existing function if it exists
DROP FUNCTION IF EXISTS increment_link_click(text);

-- Create improved increment function with explicit column references
CREATE OR REPLACE FUNCTION increment_link_click(p_link_id text)
RETURNS void AS $$
BEGIN
  INSERT INTO link_clicks (link_id, count)
  VALUES (p_link_id, 1)
  ON CONFLICT (link_id) DO UPDATE
  SET 
    count = link_clicks.count + 1,
    updated_at = now()
  WHERE link_clicks.link_id = p_link_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add unique constraint if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'link_clicks_link_id_key'
  ) THEN
    ALTER TABLE link_clicks
    ADD CONSTRAINT link_clicks_link_id_key UNIQUE (link_id);
  END IF;
END $$;