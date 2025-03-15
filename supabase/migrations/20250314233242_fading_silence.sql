/*
  # Add ticket price field to events table

  1. Changes
    - Add ticket_price column to events table
    - Add constraint to ensure non-negative prices
    - Add index for better performance

  2. Security
    - Maintain existing RLS policies
*/

-- Add ticket_price column to events table
ALTER TABLE events
ADD COLUMN IF NOT EXISTS ticket_price numeric(10,2);

-- Add check constraint to ensure non-negative prices
ALTER TABLE events
ADD CONSTRAINT valid_ticket_price CHECK (ticket_price IS NULL OR ticket_price >= 0);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS events_ticket_price_idx ON events(ticket_price);