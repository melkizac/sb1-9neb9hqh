/*
  # Add capacity field to events table

  1. Changes
    - Add capacity column to events table
    - Make it nullable (null means unlimited capacity)
    - Add check constraint to ensure non-negative values
  
  2. Security
    - Maintain existing RLS policies
*/

-- Add capacity column to events table
ALTER TABLE events
ADD COLUMN IF NOT EXISTS capacity integer;

-- Add check constraint to ensure non-negative capacity
ALTER TABLE events
ADD CONSTRAINT valid_capacity CHECK (capacity IS NULL OR capacity >= 0);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS events_capacity_idx ON events(capacity);