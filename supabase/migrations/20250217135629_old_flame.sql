/*
  # Add Events and Case Studies Tables

  1. New Tables
    - `case_studies`
      - `id` (uuid, primary key)
      - `title` (text)
      - `slug` (text, unique)
      - `description` (text)
      - `content` (text)
      - `industry` (text)
      - `impact` (text)
      - `featured_image` (text)
      - `status` (text)
      - `author_id` (uuid, references auth.users)
      - `published_at` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `events`
      - `id` (uuid, primary key)
      - `title` (text)
      - `slug` (text, unique)
      - `description` (text)
      - `content` (text)
      - `event_type` (text)
      - `start_date` (timestamptz)
      - `end_date` (timestamptz)
      - `location` (text)
      - `featured_image` (text)
      - `status` (text)
      - `organizer_id` (uuid, references auth.users)
      - `published_at` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for public viewing of published items
    - Add policies for authenticated users to manage their own items
*/

-- Case Studies Table
CREATE TABLE IF NOT EXISTS case_studies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  content text NOT NULL,
  industry text NOT NULL,
  impact text NOT NULL,
  featured_image text,
  status text NOT NULL DEFAULT 'draft',
  author_id uuid REFERENCES auth.users NOT NULL,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('draft', 'published', 'archived'))
);

-- Events Table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  content text NOT NULL,
  event_type text NOT NULL,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  location text NOT NULL,
  featured_image text,
  status text NOT NULL DEFAULT 'draft',
  organizer_id uuid REFERENCES auth.users NOT NULL,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('draft', 'published', 'archived')),
  CONSTRAINT valid_dates CHECK (end_date >= start_date),
  CONSTRAINT valid_event_type CHECK (event_type IN ('webinar', 'workshop', 'conference', 'meetup', 'other'))
);

-- Enable RLS
ALTER TABLE case_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Updated At Triggers
CREATE OR REPLACE FUNCTION update_case_studies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_case_studies_updated_at
  BEFORE UPDATE ON case_studies
  FOR EACH ROW
  EXECUTE FUNCTION update_case_studies_updated_at();

CREATE OR REPLACE FUNCTION update_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_events_updated_at();

-- Slug Generation Functions
CREATE OR REPLACE FUNCTION generate_case_study_slug()
RETURNS TRIGGER AS $$
DECLARE
  slug text;
  base_slug text;
  counter integer := 1;
BEGIN
  base_slug := lower(regexp_replace(NEW.title, '[^a-zA-Z0-9\s]', '', 'g'));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  slug := base_slug;
  
  WHILE EXISTS (SELECT 1 FROM case_studies WHERE slug = slug AND id != NEW.id) LOOP
    counter := counter + 1;
    slug := base_slug || '-' || counter::text;
  END LOOP;
  
  NEW.slug := slug;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION generate_event_slug()
RETURNS TRIGGER AS $$
DECLARE
  slug text;
  base_slug text;
  counter integer := 1;
BEGIN
  base_slug := lower(regexp_replace(NEW.title, '[^a-zA-Z0-9\s]', '', 'g'));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  slug := base_slug;
  
  WHILE EXISTS (SELECT 1 FROM events WHERE slug = slug AND id != NEW.id) LOOP
    counter := counter + 1;
    slug := base_slug || '-' || counter::text;
  END LOOP;
  
  NEW.slug := slug;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Slug Triggers
CREATE TRIGGER set_case_study_slug
  BEFORE INSERT OR UPDATE OF title ON case_studies
  FOR EACH ROW
  EXECUTE FUNCTION generate_case_study_slug();

CREATE TRIGGER set_event_slug
  BEFORE INSERT OR UPDATE OF title ON events
  FOR EACH ROW
  EXECUTE FUNCTION generate_event_slug();

-- RLS Policies for Case Studies
CREATE POLICY "Public can view published case studies"
  ON case_studies FOR SELECT
  TO public
  USING (status = 'published' AND published_at <= now());

CREATE POLICY "Authors can manage their case studies"
  ON case_studies
  FOR ALL
  TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

-- RLS Policies for Events
CREATE POLICY "Public can view published events"
  ON events FOR SELECT
  TO public
  USING (status = 'published' AND published_at <= now());

CREATE POLICY "Organizers can manage their events"
  ON events
  FOR ALL
  TO authenticated
  USING (organizer_id = auth.uid())
  WITH CHECK (organizer_id = auth.uid());

-- Indexes
CREATE INDEX IF NOT EXISTS case_studies_slug_idx ON case_studies(slug);
CREATE INDEX IF NOT EXISTS case_studies_status_idx ON case_studies(status);
CREATE INDEX IF NOT EXISTS case_studies_author_id_idx ON case_studies(author_id);
CREATE INDEX IF NOT EXISTS case_studies_published_at_idx ON case_studies(published_at);

CREATE INDEX IF NOT EXISTS events_slug_idx ON events(slug);
CREATE INDEX IF NOT EXISTS events_status_idx ON events(status);
CREATE INDEX IF NOT EXISTS events_organizer_id_idx ON events(organizer_id);
CREATE INDEX IF NOT EXISTS events_published_at_idx ON events(published_at);
CREATE INDEX IF NOT EXISTS events_start_date_idx ON events(start_date);
CREATE INDEX IF NOT EXISTS events_end_date_idx ON events(end_date);