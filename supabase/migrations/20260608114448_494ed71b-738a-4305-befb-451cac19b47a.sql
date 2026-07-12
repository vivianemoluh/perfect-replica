
-- BOOKS
CREATE TABLE public.books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title_fr TEXT NOT NULL,
  title_en TEXT,
  summary_fr TEXT,
  summary_en TEXT,
  excerpt_url TEXT,
  cover_url TEXT,
  genre TEXT,
  publication_year INTEGER,
  purchase_links JSONB DEFAULT '[]'::jsonb,
  is_published BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
GRANT SELECT ON public.books TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.books TO authenticated;
GRANT ALL ON public.books TO service_role;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published books" ON public.books FOR SELECT USING (is_published = true);
CREATE POLICY "Auth manage books" ON public.books FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ARTICLES
CREATE TABLE public.articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title_fr TEXT NOT NULL,
  title_en TEXT,
  content_fr TEXT,
  content_en TEXT,
  excerpt_fr TEXT,
  excerpt_en TEXT,
  cover_image_url TEXT,
  category TEXT CHECK (category IN ('reflexions','actualites','publications')),
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
GRANT SELECT ON public.articles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.articles TO authenticated;
GRANT ALL ON public.articles TO service_role;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published articles" ON public.articles FOR SELECT USING (is_published = true);
CREATE POLICY "Auth manage articles" ON public.articles FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- EVENTS
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_fr TEXT NOT NULL,
  title_en TEXT,
  description_fr TEXT,
  description_en TEXT,
  event_type TEXT CHECK (event_type IN ('conference','dedicace','salon','rencontre')),
  event_date TIMESTAMPTZ NOT NULL,
  location TEXT,
  city TEXT,
  country TEXT DEFAULT 'Cameroun',
  registration_url TEXT,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
GRANT SELECT ON public.events TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT ALL ON public.events TO service_role;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published events" ON public.events FOR SELECT USING (is_published = true);
CREATE POLICY "Auth manage events" ON public.events FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- GALLERY
CREATE TABLE public.gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  caption_fr TEXT,
  caption_en TEXT,
  category TEXT CHECK (category IN ('dedicaces','evenements','rencontres','portraits')),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
GRANT SELECT ON public.gallery TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gallery TO authenticated;
GRANT ALL ON public.gallery TO service_role;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read gallery" ON public.gallery FOR SELECT USING (true);
CREATE POLICY "Auth manage gallery" ON public.gallery FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- RESOURCES
CREATE TABLE public.resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_fr TEXT NOT NULL,
  title_en TEXT,
  description_fr TEXT,
  description_en TEXT,
  file_url TEXT NOT NULL,
  resource_type TEXT CHECK (resource_type IN ('fiche_lecture','support_pedagogique','autre')),
  is_free BOOLEAN DEFAULT true,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
GRANT SELECT ON public.resources TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.resources TO authenticated;
GRANT ALL ON public.resources TO service_role;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read resources" ON public.resources FOR SELECT USING (true);
CREATE POLICY "Auth manage resources" ON public.resources FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- REVIEWS
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE,
  reviewer_name TEXT NOT NULL,
  reviewer_location TEXT,
  review_text TEXT NOT NULL,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
GRANT SELECT, INSERT ON public.reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read approved reviews" ON public.reviews FOR SELECT USING (is_approved = true);
CREATE POLICY "Public submit reviews" ON public.reviews FOR INSERT WITH CHECK (is_approved = false);
CREATE POLICY "Auth manage reviews" ON public.reviews FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- CONTACT MESSAGES
CREATE TABLE public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
GRANT INSERT ON public.contact_messages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public insert contact" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Auth read messages" ON public.contact_messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth manage messages" ON public.contact_messages FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- NEWSLETTER SUBSCRIBERS (backup of Brevo)
CREATE TABLE public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
GRANT INSERT ON public.newsletter_subscribers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.newsletter_subscribers TO authenticated;
GRANT ALL ON public.newsletter_subscribers TO service_role;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public insert subscriber" ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Auth read subscribers" ON public.newsletter_subscribers FOR SELECT TO authenticated USING (true);
