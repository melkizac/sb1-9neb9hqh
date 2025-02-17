/*
  # Add Store and Courses Tables

  1. New Tables
    - `products`
      - Basic product information
      - Pricing and inventory
      - Status and visibility
    - `product_categories`
      - Hierarchical categories
    - `courses`
      - Course information
      - Pricing and enrollment
    - `course_sections`
      - Course content organization
    - `course_lessons`
      - Individual lesson content
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Public read access for published items
*/

-- Product Categories
CREATE TABLE IF NOT EXISTS product_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  parent_id uuid REFERENCES product_categories(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  price decimal(10,2) NOT NULL,
  sale_price decimal(10,2),
  inventory_count integer DEFAULT 0,
  category_id uuid REFERENCES product_categories(id),
  status text NOT NULL DEFAULT 'draft',
  featured_image text,
  images jsonb DEFAULT '[]'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_product_status CHECK (status IN ('draft', 'published', 'archived')),
  CONSTRAINT valid_prices CHECK (
    price >= 0 AND
    (sale_price IS NULL OR (sale_price >= 0 AND sale_price <= price))
  )
);

-- Courses
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  price decimal(10,2) NOT NULL,
  sale_price decimal(10,2),
  status text NOT NULL DEFAULT 'draft',
  featured_image text,
  instructor_id uuid REFERENCES auth.users NOT NULL,
  level text NOT NULL DEFAULT 'beginner',
  duration interval,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_course_status CHECK (status IN ('draft', 'published', 'archived')),
  CONSTRAINT valid_course_prices CHECK (
    price >= 0 AND
    (sale_price IS NULL OR (sale_price >= 0 AND sale_price <= price))
  ),
  CONSTRAINT valid_course_level CHECK (level IN ('beginner', 'intermediate', 'advanced'))
);

-- Course Sections
CREATE TABLE IF NOT EXISTS course_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Course Lessons
CREATE TABLE IF NOT EXISTS course_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id uuid REFERENCES course_sections(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  video_url text,
  duration interval,
  is_free boolean DEFAULT false,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_lessons ENABLE ROW LEVEL SECURITY;

-- Updated At Triggers
CREATE OR REPLACE FUNCTION update_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_product_categories_updated_at
  BEFORE UPDATE ON product_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_timestamp();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_timestamp();

CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_timestamp();

CREATE TRIGGER update_course_sections_updated_at
  BEFORE UPDATE ON course_sections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_timestamp();

CREATE TRIGGER update_course_lessons_updated_at
  BEFORE UPDATE ON course_lessons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_timestamp();

-- Slug Generation for Products
CREATE OR REPLACE FUNCTION generate_product_slug()
RETURNS TRIGGER AS $$
DECLARE
  slug text;
  base_slug text;
  counter integer := 1;
BEGIN
  base_slug := lower(regexp_replace(NEW.title, '[^a-zA-Z0-9\s]', '', 'g'));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  slug := base_slug;
  
  WHILE EXISTS (SELECT 1 FROM products WHERE slug = slug AND id != NEW.id) LOOP
    counter := counter + 1;
    slug := base_slug || '-' || counter::text;
  END LOOP;
  
  NEW.slug := slug;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Slug Generation for Courses
CREATE OR REPLACE FUNCTION generate_course_slug()
RETURNS TRIGGER AS $$
DECLARE
  slug text;
  base_slug text;
  counter integer := 1;
BEGIN
  base_slug := lower(regexp_replace(NEW.title, '[^a-zA-Z0-9\s]', '', 'g'));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  slug := base_slug;
  
  WHILE EXISTS (SELECT 1 FROM courses WHERE slug = slug AND id != NEW.id) LOOP
    counter := counter + 1;
    slug := base_slug || '-' || counter::text;
  END LOOP;
  
  NEW.slug := slug;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Slug Triggers
CREATE TRIGGER set_product_slug
  BEFORE INSERT OR UPDATE OF title ON products
  FOR EACH ROW
  EXECUTE FUNCTION generate_product_slug();

CREATE TRIGGER set_course_slug
  BEFORE INSERT OR UPDATE OF title ON courses
  FOR EACH ROW
  EXECUTE FUNCTION generate_course_slug();

-- RLS Policies

-- Product Categories
CREATE POLICY "Public can view product categories"
  ON product_categories FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage product categories"
  ON product_categories
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Products
CREATE POLICY "Public can view published products"
  ON products FOR SELECT
  TO public
  USING (status = 'published');

CREATE POLICY "Authenticated users can manage products"
  ON products
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Courses
CREATE POLICY "Public can view published courses"
  ON courses FOR SELECT
  TO public
  USING (status = 'published');

CREATE POLICY "Instructors can manage their courses"
  ON courses
  FOR ALL
  TO authenticated
  USING (instructor_id = auth.uid())
  WITH CHECK (instructor_id = auth.uid());

-- Course Sections
CREATE POLICY "Public can view course sections"
  ON course_sections FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = course_sections.course_id
      AND courses.status = 'published'
    )
  );

CREATE POLICY "Instructors can manage course sections"
  ON course_sections
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = course_sections.course_id
      AND courses.instructor_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = course_sections.course_id
      AND courses.instructor_id = auth.uid()
    )
  );

-- Course Lessons
CREATE POLICY "Public can view course lessons"
  ON course_lessons FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM course_sections
      JOIN courses ON courses.id = course_sections.course_id
      WHERE course_sections.id = course_lessons.section_id
      AND courses.status = 'published'
    )
  );

CREATE POLICY "Instructors can manage course lessons"
  ON course_lessons
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM course_sections
      JOIN courses ON courses.id = course_sections.course_id
      WHERE course_sections.id = course_lessons.section_id
      AND courses.instructor_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM course_sections
      JOIN courses ON courses.id = course_sections.course_id
      WHERE course_sections.id = course_lessons.section_id
      AND courses.instructor_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS product_categories_parent_id_idx ON product_categories(parent_id);
CREATE INDEX IF NOT EXISTS products_category_id_idx ON products(category_id);
CREATE INDEX IF NOT EXISTS products_status_idx ON products(status);
CREATE INDEX IF NOT EXISTS courses_instructor_id_idx ON courses(instructor_id);
CREATE INDEX IF NOT EXISTS courses_status_idx ON courses(status);
CREATE INDEX IF NOT EXISTS course_sections_course_id_idx ON course_sections(course_id);
CREATE INDEX IF NOT EXISTS course_sections_order_idx ON course_sections(order_index);
CREATE INDEX IF NOT EXISTS course_lessons_section_id_idx ON course_lessons(section_id);
CREATE INDEX IF NOT EXISTS course_lessons_order_idx ON course_lessons(order_index);