export interface Image {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  description: string | null;
  url: string;
  storage_path: string;
  user_id: string;
  metadata: Record<string, any>;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  content: string;
  featured_image: string | null;
  status: 'draft' | 'published' | 'archived';
  author_id: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CaseStudy {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  content: string;
  industry: string;
  impact: string;
  featured_image: string | null;
  status: 'draft' | 'published' | 'archived';
  author_id: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  content: string;
  event_type: 'webinar' | 'workshop' | 'conference' | 'meetup' | 'other';
  start_date: string;
  end_date: string;
  location: string;
  featured_image: string | null;
  status: 'draft' | 'published' | 'archived';
  organizer_id: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  first_name: string;
  last_name: string | null;
  email: string;
  phone: string | null;
  message: string | null;
  captcha_token: string;
  created_at: string;
  status: string;
}