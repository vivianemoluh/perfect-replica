
-- =========================================================
-- RESET COMPLET (à exécuter si les tables existent déjà)
-- ⚠️ Supprime toutes les données du site. À utiliser
--    uniquement pour repartir de zéro.
-- =========================================================
DROP TABLE IF EXISTS public.contact_messages CASCADE;
DROP TABLE IF EXISTS public.newsletter_subscribers CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.resources CASCADE;
DROP TABLE IF EXISTS public.gallery CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.articles CASCADE;
DROP TABLE IF EXISTS public.books CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role) CASCADE;
DROP TYPE IF EXISTS public.app_role CASCADE;
-- =========================================================

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

-- 1. Roles enum + user_roles table
CREATE TYPE public.app_role AS ENUM ('admin', 'editor', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can read own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins read all roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2. Replace permissive "auth can manage" policies with admin-only
DROP POLICY IF EXISTS "Auth manage books" ON public.books;
DROP POLICY IF EXISTS "Auth manage articles" ON public.articles;
DROP POLICY IF EXISTS "Auth manage events" ON public.events;
DROP POLICY IF EXISTS "Auth manage gallery" ON public.gallery;
DROP POLICY IF EXISTS "Auth manage resources" ON public.resources;
DROP POLICY IF EXISTS "Auth manage reviews" ON public.reviews;
DROP POLICY IF EXISTS "Auth manage messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Auth read messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Auth read subscribers" ON public.newsletter_subscribers;

CREATE POLICY "Admins manage books"     ON public.books             FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage articles"  ON public.articles          FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage events"    ON public.events            FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage gallery"   ON public.gallery           FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage resources" ON public.resources         FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage reviews"   ON public.reviews           FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage messages"  ON public.contact_messages  FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage subscribers" ON public.newsletter_subscribers FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- 3. Storage policies for the `media` bucket (bucket itself created via tool)
CREATE POLICY "Public read media" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'media');

CREATE POLICY "Admins upload media" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update media" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete media" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'));

-- 1) Restrict EXECUTE on has_role (SECURITY DEFINER). RLS policies still work
-- because policies are evaluated by the table owner, not the calling role.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;

-- 2) Validate public INSERT on newsletter_subscribers (replace WITH CHECK true)
DROP POLICY IF EXISTS "Public insert subscriber" ON public.newsletter_subscribers;
CREATE POLICY "Public insert subscriber"
ON public.newsletter_subscribers
FOR INSERT
TO anon, authenticated
WITH CHECK (
  email IS NOT NULL
  AND length(email) <= 200
  AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  AND (first_name IS NULL OR length(first_name) <= 80)
  AND (source IS NULL OR length(source) <= 60)
);

-- 3) Validate public INSERT on contact_messages (replace WITH CHECK true)
DROP POLICY IF EXISTS "Public insert contact" ON public.contact_messages;
CREATE POLICY "Public insert contact"
ON public.contact_messages
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(name) BETWEEN 1 AND 120
  AND length(email) <= 200
  AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  AND length(subject) BETWEEN 1 AND 200
  AND length(message) BETWEEN 5 AND 4000
  AND is_read = false
);

-- 4) Prevent admins from granting/modifying their OWN role (bootstrap / self-escalation protection).
DROP POLICY IF EXISTS "Admins manage roles" ON public.user_roles;
CREATE POLICY "Admins manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role) AND user_id <> auth.uid())
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role) AND user_id <> auth.uid());
-- 1) Nettoyage : livres et articles hors document
DELETE FROM public.reviews WHERE book_id IN (
  SELECT id FROM public.books WHERE slug IN ('le-silence-des-genes', 'gestes-poetiques')
);
DELETE FROM public.books WHERE slug IN ('le-silence-des-genes', 'gestes-poetiques');

-- Retirer d'anciennes reviews/articles de démonstration éventuels sur les 2 romans
DELETE FROM public.reviews WHERE book_id IN (
  SELECT id FROM public.books WHERE slug IN ('les-choix-de-l-ombre', 'poure-mouton-noir-njoya')
);
DELETE FROM public.articles WHERE slug IN (
  'note-lecture-les-choix-de-l-ombre',
  'note-lecture-poure-meli',
  'note-lecture-poure-matateyou'
);

-- 2) Mise à jour des deux romans
UPDATE public.books SET
  title_fr = 'Les choix de l''ombre',
  title_en = 'The Choices of Shadow',
  summary_fr = 'Roman. Caïn, Sonia et Zelda traversent trahisons familiales, secrets et rédemption dans un Cameroun aux prises avec la polygamie, la stérilité, l''emprise des belles-mères et la course à la réussite. Un réquisitoire lucide qui célèbre le pardon, la résilience et la sacralité de la vie.',
  summary_en = 'A novel. Caïn, Sonia and Zelda navigate family betrayals, secrets and redemption in a Cameroon wrestling with polygamy, infertility, manipulative in-laws and the race to success. A lucid indictment that celebrates forgiveness, resilience and the sacredness of life.',
  genre = 'Roman',
  publication_year = 2021,
  purchase_links = '[{"label":"Éditions Masque et Cauris","url":"https://www.masqueetcauris.com/"}]'::jsonb,
  is_published = true,
  display_order = 1
WHERE slug = 'les-choix-de-l-ombre';

UPDATE public.books SET
  title_fr = 'Poùre, le mouton noir des Njoya',
  title_en = 'Poùre, the Black Sheep of the Njoya',
  summary_fr = 'Roman. De Koumenke à la NASA, Poùre Njoya défie les traditions du pays bamoun pour poursuivre ses études d''astrophysique. Un plaidoyer vibrant pour l''émancipation des femmes, l''ouverture au monde et le dialogue des cultures.',
  summary_en = 'A novel. From Koumenke to NASA, Poùre Njoya defies Bamoun tradition to pursue astrophysics. A vibrant plea for women''s emancipation, openness to the world, and cultural dialogue.',
  genre = 'Roman',
  publication_year = 2021,
  purchase_links = '[{"label":"Éditions AfricAvenir","url":"https://africavenir.org/"}]'::jsonb,
  is_published = true,
  display_order = 2
WHERE slug = 'poure-mouton-noir-njoya';

-- 3) Ajout des 2 manuels officiels LATINITAS
INSERT INTO public.books (slug, title_fr, title_en, summary_fr, summary_en, genre, publication_year, purchase_links, is_published, display_order)
VALUES
(
  'latinitas-6e-5e',
  'LATINITAS — Le latin au sous-cycle d''observation (6ᵉ/5ᵉ)',
  'LATINITAS — Latin for the observation sub-cycle (Grades 6 & 5)',
  'Manuel officiel de Lettres Classiques au Cameroun pour les classes de 6ᵉ et de 5ᵉ. Livre de latin destiné aux grands débutants, coécrit avec un groupe d''Inspecteurs Pédagogiques (2024). Inscrit sur la liste officielle des manuels scolaires au Cameroun.',
  'Official Latin textbook for Grades 6 and 5 in Cameroon. Designed for beginners, co-written with a team of Pedagogical Inspectors (2024). Listed on Cameroon''s official schoolbook list.',
  'Manuel scolaire',
  2024,
  '[{"label":"Éditions Éclosion","url":"#"}]'::jsonb,
  true,
  3
),
(
  'latinitas-4e-3e',
  'LATINITAS — Le latin au sous-cycle d''orientation (4ᵉ/3ᵉ)',
  'LATINITAS — Latin for the orientation sub-cycle (Grades 4 & 3)',
  'Manuel officiel de Lettres Classiques au Cameroun pour les classes de 4ᵉ et de 3ᵉ. Document didactique pour les élèves et les enseignants du sous-cycle d''orientation, coécrit avec un groupe d''Inspecteurs Pédagogiques (2024). Inscrit sur la liste officielle des manuels scolaires au Cameroun.',
  'Official Latin textbook for Grades 4 and 3 in Cameroon. A didactic resource for pupils and teachers in the orientation sub-cycle, co-written with a team of Pedagogical Inspectors (2024). Listed on Cameroon''s official schoolbook list.',
  'Manuel scolaire',
  2024,
  '[{"label":"Éditions Éclosion","url":"#"}]'::jsonb,
  true,
  4
);

-- 4) Notes de lecture — insertion dans reviews (page détail livre) et dans articles (Chroniques)

-- Récupérer les IDs des deux romans
WITH ids AS (
  SELECT
    (SELECT id FROM public.books WHERE slug = 'les-choix-de-l-ombre') AS choix_id,
    (SELECT id FROM public.books WHERE slug = 'poure-mouton-noir-njoya') AS poure_id
)
INSERT INTO public.reviews (book_id, reviewer_name, reviewer_location, review_text, is_approved)
SELECT choix_id, 'Josée MELI AMBADIANG', 'Critique littéraire — Yaoundé, mars 2023',
E'En cette période où l''actualité ici et ailleurs fait naître moult réflexions et débats sur notre être-au-monde et que les nouvelles de la planète remettent en question nos croyances et nos certitudes, un livre intitulé "Les choix de l''ombre" ne peut que susciter beaucoup de curiosité.\n\nDans cette œuvre rigoureusement structurée avec un sommaire, un prologue, un épilogue et un texte décliné en neuf chapitres, nous sommes conviés à un voyage dans le parcours aux multiples péripéties des protagonistes Caïn, Sonia, Zelda, au cœur de leur environnement familial et socio-professionnel. Nous découvrons les métamorphoses du jeune homme que son épouse ne reconnaît plus après un stage effectué en Allemagne. Avec la complicité de sa belle-mère Maggy, il viole sa protégée Zelda, pour s''assurer une progéniture que Sonia, son épouse depuis dix ans, semble incapable de lui offrir. Lorsque cette dernière découvre la cruelle vérité et la décision de son mari de prendre une deuxième épouse, elle choisit de quitter cette union douloureuse. Elle peut ainsi mieux soutenir sa petite sœur Zelda, sous le traumatisme d''une grossesse indésirée qui aboutit à la naissance de Nikos, fruit des affres de Caïn qu''elle offre à sa grande sœur comblée ainsi de toutes ces années sous le joug d''une apparente stérilité.\n\nL''auteure utilise une intrigue à la remarquable complexité pour dresser un réquisitoire sans complaisance contre les maux qui minent notre société : le viol, les secrets de famille, les relations difficiles avec la belle-famille, l''égoïsme des mères manipulatrices, l''influence nocive des marabouts, la gestion inhumaine de la polygamie, la course à l''enrichissement illicite, la cupidité, les dépenses sordides lors des obsèques.\n\nCette toile obscure est irradiée pour l''exaltation du caractère sacré de la vie, soutenu par l''équilibre raisonné entre le respect des traditions et l''exploitation des avancées de la science, et par l''attachement aux valeurs — vérité, intégrité, chasteté. Elle nous exhorte sur les bienfaits du pardon, de la résilience, de la détermination et de la gestion rigoureuse du temps et des émotions.\n\nAu plan formel, l''écriture accessible de la romancière se déploie dans un délicieux régal esthétique, mêlant subtilement les parlers populaires aux réflexions métaphysiques dans un style soutenu. Nombreux dictons et déclarations sentencieuses ("Le linge sale se lave en famille", "l''erreur est humaine"), descriptions pittoresques et images scintillantes en comparaisons, métaphores et allégories.\n\nCe roman est recommandable à plus d''un titre, dans la mesure où il nous garde en haleine jusqu''à la dernière ligne. Il aborde avec dextérité des thèmes délicats et promeut les valeurs éthiques — le pardon et la résilience — afin de préserver l''équilibre et la sérénité dans nos vies individuelles, dans notre microcosme et sur notre planète.',
true
FROM ids
UNION ALL
SELECT poure_id, 'Josée MELI AMBADIANG', 'Critique littéraire — Yaoundé, 23 mars 2023',
E'L''œuvre nous interpelle dès la première de couverture avec le visage d''une femme noire aux allures intrépides, arborant un foulard rouge sang — sang de la révolution ou du sacrifice — dans un arrière-plan blanc de l''innocence et de l''élévation spirituelle. Comment Poùre, la colombe, symbole de paix, se transforme-t-elle en un mouton noir venant remettre en question l''harmonie du troupeau des Njoya ?\n\nDans son récit de 8 chapitres, Viviane Moluh Peyou nous embarque dans l''itinéraire d''une jeune fille exceptionnelle, de son mariage à son envol vers le pays de l''Oncle Sam. Dans ce chassé-croisé entre son Menké natal, son séjour à Yaoundé et le départ pour les États-Unis, nous découvrons le parcours d''une surdouée au caractère bien trempé : "Je ne suis pas faite pour le mariage" (p. 9), "Celui qui suit la foule n''ira jamais plus loin que la foule qu''il suit" (p. 10).\n\nNous sommes en pleine immersion dans les us et coutumes bamouns : sept jours de noces, trousseau, rituel de la traversée du mets d''arachide, sac de deux cauris accompagné de la kola bafia et du vin de raphia. Son époux Nil Moùn doit faire des efforts surhumains pour supporter les ambitions de sa dulcinée qui abandonne son foyer pour poursuivre ses études d''astrophysique jusqu''à la NASA. "Autant le mariage n''annule pas les études, autant les études n''annulent pas le mariage" (p. 156).\n\nCe roman à l''actualité brûlante décrypte l''univers intérieur d''un être tourmenté entre destin glorieux et parcours semé d''embûches. Il célèbre les us et coutumes du terroir, l''éducation de la jeune fille, l''attachement à la terre mère, l''acceptation de la différence, la solidarité familiale, l''ouverture au monde. Il décoche des coups de griffes contre les préjugés sexistes, les mariages forcés, les violences conjugales, les conspirations professionnelles et les inconsistances de la justice.\n\nLe style de l''écrivaine se décline dans une savoureuse délectation esthétique — oxymore désignant le mariage comme une "cage dorée" (p. 10), satire cinglante sur cette manie de ne donner raison qu''aux cheveux blancs, périphrases mélancoliques : "Les dernières gouttes de liquide salé" pour parler des larmes.\n\n"Poùre, le mouton noir des Njoya" permet une prise de conscience salutaire pour nous lever contre les inconsistances de notre société. Nous sommes émerveillés par la maîtrise pointue de la romancière de son patrimoine culturel. C''est une invitation à l''enracinement patrimonial et un vibrant plaidoyer en faveur des droits de l''Homme et spécifiquement des femmes.',
true
FROM ids
UNION ALL
SELECT poure_id, 'Emmanuel MATATEYOU', 'Douala, Édition AfricAvenir, 2021, 176 pages',
E'"Poùre le mouton noir des Njoya" est un roman fascinant qui attire l''attention du lecteur par la présence dans le titre de l''adjectif "noir" accolé au mouton, un animal qui habituellement a la couleur blanche. Dans ce paratexte, l''autrice annonce les couleurs de ce que le lecteur découvrira au fil des pages : tantôt transporté dans les nuages de l''eldorado fantasmé en Amérique et parfois dans des zones de turbulence à Menké ou Yaoundé.\n\nL''histoire, contée dans une langue châtiée, révèle une jeune femme qui veut s''assurer pleinement en vertu des potentialités intellectuelles qu''elle possède. Les traditions séculaires qui ont formaté le destin des jeunes filles dans les communautés de Poùre Njoya ont la peau dure. Elle doit se battre pour se libérer effectivement, et c''est à ce combat que Viviane Moluh Peyou nous convie ; le spectacle en vaut la peine.\n\nAvec délicatesse et dans un style souple, l''autrice nous présente l''héroïne aux prises avec ses géniteurs relativement à son mariage avec Nil. Elle veut continuer ses études et a comme objectif d''aller à la NASA aux États-Unis où elle pense être plus utile. C''est un projet révolutionnaire et dérangeant pour tout le monde. Pour Nil Moun, c''est une grande déception, mais il fait preuve de compréhension et soutient sa dulcinée. Pour Odette Moun, belle-mère de l''héroïne, cette initiative est contradictoire aux us et coutumes de leur communauté. M. Njoya, père de l''héroïne, est frustré par la répétition de la naissance dans son ménage des filles. Luh Njoya, sa sœur aînée, arrivera en rescousse comme un adjuvant.\n\nLe roman connaît un moment de climax avec l''entrée en scène de Marilyn Oneil, Professeur de physique qui travaille à la NASA aux États-Unis. C''est un roman palpitant où on découvre au fil des pages les traditions et les coutumes d''ici et d''ailleurs aux prises avec les exigences de la modernité.\n\nViviane M. Peyou est une écrivaine accomplie. Ses mots nous dévorent comme les volcans endormis du Mont Mbapit qui surplombe Koumenke, sa terre natale. Sa plume généreuse, affranchie, terrienne et fragile, toujours lumineuse, nous traverse. L''œuvre de Madame M.P.V est un lieu de trouble et de partage car elle nous rassemble et nous relie au plus précieux de l''indicible, à l''émotion et à une vie sublimée comme celle de Poùre, l''héroïne.\n\nPar la magie de l''écriture, l''autrice fait de l''inquiétude une amie, une présence essentielle qui impose sa force de complémentarité et d''équilibre sans laquelle toute harmonie n''aurait plus aucun goût, ni aucune raison d''être conquise.',
true
FROM ids;

-- 5) Les mêmes notes en articles / Chroniques
INSERT INTO public.articles (slug, title_fr, title_en, excerpt_fr, excerpt_en, content_fr, category, is_published, published_at)
VALUES
(
  'note-lecture-les-choix-de-l-ombre',
  'Note de lecture — Les choix de l''ombre',
  'Reading note — Les choix de l''ombre',
  'Par Josée MELI AMBADIANG, critique littéraire (Yaoundé, 2023). Lecture du roman Les choix de l''ombre de Viviane MOLUH PEYOU.',
  'By Josée MELI AMBADIANG, literary critic (Yaoundé, 2023). A reading of the novel Les choix de l''ombre.',
  E'Par Josée MELI AMBADIANG, Critique littéraire — Yaoundé, mars 2023.\n\nEn cette période où l''actualité ici et ailleurs fait naître moult réflexions et débats sur notre être-au-monde et que les nouvelles de la planète remettent en question nos croyances et nos certitudes, un livre intitulé « Les choix de l''ombre » ne peut que susciter beaucoup de curiosité.\n\nDans cette œuvre rigoureusement structurée avec un sommaire, un prologue, un épilogue et un texte décliné en neuf chapitres, nous sommes conviés à un voyage dans le parcours aux multiples péripéties des protagonistes Caïn, Sonia, Zelda, au cœur de leur environnement familial et socio-professionnel. Nous découvrons les métamorphoses du jeune homme que son épouse ne reconnaît plus après un stage effectué en Allemagne. Avec la complicité de sa belle-mère Maggy, il viole sa protégée Zelda, pour s''assurer une progéniture que Sonia, son épouse depuis dix ans, semble incapable de lui offrir. Lorsque cette dernière découvre la cruelle vérité et la décision de son mari de prendre une deuxième épouse, elle choisit de quitter cette union douloureuse.\n\nL''auteure utilise une intrigue à la remarquable complexité pour dresser un réquisitoire sans complaisance contre les maux qui minent notre société : le viol, les secrets de famille, l''égoïsme des mères manipulatrices, l''influence nocive des marabouts, la gestion inhumaine de la polygamie, la course à l''enrichissement illicite.\n\nCette toile obscure est irradiée pour l''exaltation du caractère sacré de la vie, soutenue par l''équilibre entre le respect des traditions et l''exploitation des avancées de la science. Elle nous exhorte sur les bienfaits du pardon, de la résilience, de la détermination et de la gestion rigoureuse du temps.\n\nAu plan formel, l''écriture accessible de la romancière se déploie dans un délicieux régal esthétique — mélange des registres, nombreux dictons et déclarations sentencieuses, descriptions pittoresques, images scintillantes en comparaisons, métaphores et allégories. Ce roman est recommandable à plus d''un titre : il nous garde en haleine jusqu''à la dernière ligne et promeut les valeurs éthiques du pardon et de la résilience.\n\n— Josée MELI AMBADIANG, Critique littéraire',
  'publications', true, now()
),
(
  'note-lecture-poure-meli',
  'Note de lecture — Poùre, le mouton noir des Njoya (par Josée MELI AMBADIANG)',
  'Reading note — Poùre, le mouton noir des Njoya (by Josée MELI AMBADIANG)',
  'Par Josée MELI AMBADIANG, critique littéraire (Yaoundé, 23 mars 2023).',
  'By Josée MELI AMBADIANG, literary critic (Yaoundé, 23 March 2023).',
  E'Par Josée MELI AMBADIANG, Critique littéraire — Yaoundé, 23 mars 2023.\n\nL''œuvre nous interpelle dès la première de couverture avec le visage d''une femme noire aux allures intrépides, arborant un foulard rouge sang — sang de la révolution ou du sacrifice — dans un arrière-plan blanc de l''innocence et de l''élévation spirituelle. Comment Poùre, la colombe, symbole de paix, se transforme-t-elle en un mouton noir venant remettre en question l''harmonie du troupeau des Njoya ?\n\nDans son récit de 8 chapitres, Viviane Moluh Peyou nous embarque dans l''itinéraire d''une jeune fille exceptionnelle, de son mariage à son envol vers le pays de l''Oncle Sam. Dans ce chassé-croisé entre son Menké natal, son séjour à Yaoundé et le départ pour les États-Unis, nous découvrons le parcours d''une surdouée au caractère bien trempé : « Je ne suis pas faite pour le mariage » (p. 9), « Celui qui suit la foule n''ira jamais plus loin que la foule qu''il suit » (p. 10).\n\nNous sommes en pleine immersion dans les us et coutumes bamouns : sept jours de noces, trousseau, rituel de la traversée du mets d''arachide, sac de deux cauris accompagné de la kola bafia et du vin de raphia. Son époux Nil Moùn doit faire des efforts surhumains pour supporter les ambitions de sa dulcinée qui abandonne son foyer pour poursuivre ses études d''astrophysique jusqu''à la NASA. « Autant le mariage n''annule pas les études, autant les études n''annulent pas le mariage » (p. 156).\n\nCe roman à l''actualité brûlante décrypte l''univers intérieur d''un être tourmenté. Il célèbre les us et coutumes du terroir, l''éducation de la jeune fille, l''attachement à la terre mère, l''acceptation de la différence, la solidarité familiale, l''ouverture au monde. Il décoche des coups de griffes contre les préjugés sexistes, les mariages forcés, les violences conjugales.\n\nLe style de l''écrivaine se décline dans une savoureuse délectation esthétique — oxymore désignant le mariage comme une « cage dorée » (p. 10), périphrases mélancoliques : « Les dernières gouttes de liquide salé » pour parler des larmes.\n\n« Poùre, le mouton noir des Njoya » permet une prise de conscience salutaire pour nous lever contre les inconsistances de notre société. C''est une invitation à l''enracinement patrimonial et un vibrant plaidoyer en faveur des droits des femmes.\n\n— Josée MELI AMBADIANG, Critique littéraire',
  'publications', true, now()
),
(
  'note-lecture-poure-matateyou',
  'Note de lecture — Poùre, le mouton noir des Njoya (par Emmanuel MATATEYOU)',
  'Reading note — Poùre, le mouton noir des Njoya (by Emmanuel MATATEYOU)',
  'Par Emmanuel MATATEYOU. Édition AfricAvenir, Douala, 2021, 176 pages.',
  'By Emmanuel MATATEYOU. AfricAvenir edition, Douala, 2021, 176 pages.',
  E'Par Emmanuel MATATEYOU.\n\n« Poùre le mouton noir des Njoya » est un roman fascinant qui attire l''attention du lecteur par la présence dans le titre de l''adjectif « noir » accolé au mouton, un animal qui habituellement a la couleur blanche. Dans ce paratexte, l''autrice annonce les couleurs : le lecteur sera tantôt transporté dans les nuages de l''eldorado fantasmé en Amérique, parfois dans des zones de turbulence à Menké ou Yaoundé.\n\nL''histoire, contée dans une langue châtiée, révèle une jeune femme qui veut s''assurer pleinement en vertu des potentialités intellectuelles qu''elle possède. Les traditions séculaires qui ont formaté le destin des jeunes filles dans les communautés de Poùre Njoya ont la peau dure. Elle doit se battre pour se libérer effectivement, et c''est à ce combat que Viviane Moluh Peyou nous convie ; le spectacle en vaut la peine.\n\nAvec délicatesse et dans un style souple, l''autrice nous présente l''héroïne aux prises avec ses géniteurs relativement à son mariage avec Nil. Elle veut continuer ses études et a comme objectif d''aller à la NASA aux États-Unis où elle pense être plus utile. C''est un projet révolutionnaire et dérangeant pour tout le monde. Pour Nil Moun, c''est une grande déception, mais il fait preuve de compréhension et soutient sa dulcinée. Pour Odette Moun, belle-mère de l''héroïne, cette initiative est contradictoire aux us et coutumes. M. Njoya, père de l''héroïne, est frustré. Luh Njoya, sa sœur aînée, arrivera en rescousse comme un adjuvant.\n\nLe roman connaît un moment de climax avec l''entrée en scène de Marilyn Oneil, Professeur de physique qui travaille à la NASA. C''est un roman palpitant où on découvre au fil des pages les traditions et les coutumes d''ici et d''ailleurs aux prises avec les exigences de la modernité.\n\nViviane M. Peyou est une écrivaine accomplie. Ses mots nous dévorent comme les volcans endormis du Mont Mbapit qui surplombe Koumenke, sa terre natale. Sa plume généreuse, affranchie, terrienne et fragile, toujours lumineuse, nous traverse. L''œuvre est un lieu de trouble et de partage car elle nous rassemble et nous relie au plus précieux de l''indicible, à l''émotion et à une vie sublimée comme celle de Poùre, l''héroïne.\n\nPar la magie de l''écriture, l''autrice fait de l''inquiétude une amie, une présence essentielle qui impose sa force de complémentarité et d''équilibre sans laquelle toute harmonie n''aurait plus aucun goût, ni aucune raison d''être conquise.\n\n— Emmanuel MATATEYOU',
  'publications', true, now()
);

-- Book covers
UPDATE public.books SET cover_url = '/__l5e/assets-v1/1c88a6d8-ae44-46f9-aedf-5d174c41d6c5/les-choix-de-lombre.jpg' WHERE slug = 'les-choix-de-l-ombre';
UPDATE public.books SET cover_url = '/__l5e/assets-v1/424b5dd2-a0fc-4c2f-a5de-bd219e9df775/poure-mouton-noir.jpg' WHERE slug = 'poure-mouton-noir-njoya';
UPDATE public.books SET cover_url = '/__l5e/assets-v1/6f62fd3f-4f22-40da-a10b-2b7f3e89c496/latinitas-6e-5e.jpg' WHERE slug = 'latinitas-6e-5e';
UPDATE public.books SET cover_url = '/__l5e/assets-v1/02b10014-83b1-4582-b12f-a41fa3e43939/latinitas-4e-3e.jpg' WHERE slug = 'latinitas-4e-3e';

-- Wipe old truncated reviews
DELETE FROM public.reviews;

-- Full note on "Les choix de l'ombre" — Josée MELI AMBADIANG
INSERT INTO public.reviews (book_id, reviewer_name, reviewer_location, review_text, rating)
SELECT id, 'Josée MELI AMBADIANG', 'Critique littéraire',
E'En cette période où l''actualité ici et ailleurs fait naître moult réflexions et débats sur notre être-au-monde et que les nouvelles de la planète remettent en question nos croyances et nos certitudes, un livre intitulé Les choix de l''ombre ne peut que susciter beaucoup de curiosité.\n\nEn fait, dans cette œuvre rigoureusement structurée avec un sommaire, un prologue, un épilogue et un texte décliné en neuf chapitres, nous sommes conviés à un voyage dans le parcours aux multiples péripéties des protagonistes Caïn, Sonia, Zelda, au cœur de leur environnement familial et socio-professionnel. Nous découvrons ainsi les métamorphoses du jeune homme que son épouse ne reconnaît plus après un stage effectué en Allemagne. Avec la complicité de sa belle-mère Maggy, il viole sa protégée Zelda, pour s''assurer une progéniture que Sonia, son épouse depuis dix ans, semble incapable de lui offrir. Lorsque cette dernière découvre la cruelle vérité et la décision de son mari de prendre une deuxième épouse, elle choisit de quitter cette union douloureuse. Elle peut ainsi mieux soutenir sa petite sœur Zelda, sous le traumatisme d''une grossesse indésirée qui aboutit à la naissance de Nikos, fruit des affres de Caïn qu''elle offre à sa grande sœur comblée ainsi de toutes ces années sous le joug d''une apparente stérilité. Plus tard, la famille découvre interloquée les activités délictueuses du favori du clan appâté par le gain. Il est sauvé du pire in extremis par le docteur Kana, l''ange gardien des deux sœurs et par une simulation réussie de décès. Heureusement qu''à la fin, il retrouve le bonheur après son repentir auprès d''une autre épouse tandis que Sonia regagne l''amour avec Adrien Kana à la grande joie de sa Zelda consolée par le bonheur de sa sœur.\n\nEn outre, l''auteure utilise une intrigue à la remarquable complexité pour dresser un réquisitoire sans complaisance contre les maux qui minent notre société en l''occurrence le viol, les secrets de famille, les relations difficiles avec la belle-famille, l''égoïsme et l''égocentrisme des mères manipulatrices à l''instar de Maggy qui reçoit en plein visage cette cinglante déclaration :\n\n« Ton égoïsme frôle la démesure. »\n\nViviane MOLUH PEYOU décoche également des flèches incendiaires contre l''influence nocive des marabouts, la gestion inhumaine de la polygamie, la course débridée à la promotion facile et à l''enrichissement illicite, la cupidité, les dépenses sordides lors des obsèques et toutes les traditions immorales autour de leur organisation. Elle s''insurge aussi contre la surprotection des enfants et l''avilissement de la femme.\n\nHeureusement que cette toile obscure est irradiée pour l''exaltation du caractère sacré de la vie soutenu par l''équilibre raisonné entre le respect des traditions et l''exploitation des avancées prodigieuses de la science, de l''attachement aux valeurs à l''instar de la vérité, de l''intégrité, de la chasteté loin des plaisirs futiles. C''est dans ce contexte que la sublimation du devoir permet de jouir d''une conscience tranquille et de focaliser la sélection du partenaire de vie sur les critères à l''aune des qualités morales et non sur les valeurs éphémères.\n\nDans cette perspective, elle nous exhorte sur les bienfaits du pardon, de la résilience, de la détermination ou de la gestion rigoureuse du temps et des émotions. Dans cette posture, nous serons mieux outillés pour mener le deuil des postures peu propices à notre épanouissement, capitaliser sur les cassures du chemin afin de se protéger et être différents dans la quête du bonheur personnel.\n\nDe plus Les choix de l''ombre nous entraînent sur les hauteurs des réflexions philosophiques et ontologiques : Concernant le combat manichéen entre le bien et le mal, les vicissitudes de la femme divorcée, le drame de la stérilité en Afrique, la stigmatisation des filles-mères ou les contours de la culpabilité. Nous sommes ainsi embarqués sur des ratiocinations à propos du mariage, des rites du veuvage, du statut de la femme ou de la responsabilité individuelle et collective.\n\nEn outre, la narration se situe dans un ancrage spatial aux repères précis qui nous plongent dans le terroir camerounais pour une immersion assumée dans nos us et coutumes. Nous nous identifions aisément à l''évocation des lieux aux consonances bien de chez nous comme Douala ou Kribi mais aussi à l''ouverture au monde qui nous transporte en Guinée, au Kenya, en Afrique du Sud, aux Qatar, aux Seychelles ou en Allemagne.\n\nAu point de vue formel, l''écriture accessible de la romancière se déploie en vue d''un délicieux régal esthétique dans le mélange des registres en toute subtilité des parlers populaires aux réflexions métaphysiques servies dans un style soutenu, contraste lumineux entre des énoncés comme en P.18 : « Ne te bourre pas le crâne avec les stupidités qu''ils ne cessent de te répéter. » ou en P.87 : « Après m''avoir lavée, rincée et séchée » où les questions rhétoriques au service de l''argumentation à l''exemple de la P.18 : « Où était le grand frère attentionné qui avait promis de toujours veiller sur son bien-être ? » ou en P.19 : « Quels conseils ne t''ai-je pas prodigués sur les pièges des hommes ? »\n\nCette écriture à la portée de tous débouche sur une production à l''intérêt didactique indéniable assuré par des nombreux dictons et des déclarations sentencieuses comme en P.27 : « Le linge sale se lave en famille. » ou « l''erreur est humaine. » ; P.42 : « On ne redresse pas un poisson sec au risque de la casser. » ; P.88 : « Dieu lui-même a abandonné les marmites cocottes anciennes et la pierre à écraser pour s''essayer aux cocottes minutes et aux mixeurs. » et en P.71 : « Si tu te retrouves dans la forêt, et que tu passes deux fois devant le même arbre, sache que tu es perdu. » ; Ou encore ce long extrait de D. Ives, P. 171 sur le droit d''être soi.\n\nPuis, nous savourons les descriptions pittoresques comme en P.66 : « Deux perles brunes aux silhouettes sculptées avec soin et aux jambes interminables. » ou les images scintillantes en comparaison P.9 : « Tel un voile subissant les affres d''une tempête. » ; en métaphores P.21 : « Que l''aile qui t''a abritée puisse se retrouver à voltiger dehors sans une destination parce qu''une autre sera venue profiter du fruit de ses sacrifices » ; en allégorie en P.68 : « Ce chapitre de ma vie est achevé et dans le livre de ma vie, il y a encore de nombreuses pages blanches à remplir. Je vais m''y atteler en en prenant soin cette fois de bien choisir les mots qui s''y coucheront. » ; Mais aussi des accumulations P.126 : « Ni morgue, ni discours hypocrites, ni perruques de deux mètres au vent… » Et des invectives hautes en couleur comme en P.78 pour mettre en exergue le drame de la stérilité :\n\n« Rivière sans eau, arbre sans fruits. »\n\n« Une pimbêche de ton espèce s''est confortablement installée chez lui tel un parasite. »\n\nD''un autre point de vue, nous sommes séduits par la gestion originale de la trame temporelle avec ses analepses, l''onomastique significative suggérant tout un programme avec Caïn, Nanak, Njùssà, Kana ou Nji Mgbetkom qui rehausse la couleur locale de ce roman réaliste.\n\nDe même, nous sommes enrichis par la culture gréco-romaine de l''écrivaine qui évoque « les bras de Morphée » dès la P.8, mais aussi par son enracinement culturel avec les conteurs des rythmes Mèndou de son Noun natal ou coupé décalé de DJ Kérosène avec « le boss c''est moi », clin d''œil coquin à certains lecteurs dans l''air du temps.\n\nNous sommes également bercés par les envolées à la veine poétique de la P.169 : « À chaque voyage par ici, mon âme trouve la paix dans le vent, le sable, le bruit de l''eau qui va et qui vient. »\n\nEn somme, si nous déplorons le caractère vraisemblable de cette histoire qui s''achève comme dans nos rêves et la présence des coquilles qui seront certainement corrigées lors des prochaines éditions, nous relevons que ce roman est recommandable à plus d''un titre, dans la mesure où il nous garde en haleine jusqu''à la dernière ligne. De plus, il aborde avec dextérité des thèmes délicats avec les subtilités d''une bienséante maturité. Nous pouvons alors nous plonger dans une prise de conscience salutaire et une méditation en toute sincérité sur notre être-au-monde en toute responsabilité afin de produire un impact positif autour de nous. De surcroît, ce livre promeut les valeurs éthiques avec pour point d''orgue le pardon et la résilience afin de rejeter la posture d''esclave face à l''opinion des autres, prendre résolument sa destinée et son bonheur en main afin de préserver l''équilibre, la sérénité dans nos vies individuelles, dans notre microcosme et surtout notre planète dans ce contexte délétère dont nous sommes tous bien conscients.',
5
FROM public.books WHERE slug = 'les-choix-de-l-ombre';

-- Full note on "Poùre" — Josée MELI AMBADIANG (Note de lecture 33)
INSERT INTO public.reviews (book_id, reviewer_name, reviewer_location, review_text, rating)
SELECT id, 'Josée MELI AMBADIANG', 'Critique littéraire — Yaoundé, 23 mars 2023',
E'L''œuvre dont nous avons l''honneur de présenter une note de lecture nous interpelle dès la première de couverture avec le visage d''une femme noire aux allures intrépides, arborant un foulard rouge sang, sang de la révolution ou du sacrifice dans un arrière-plan blanc de l''innocence, de la virginité ou de l''élévation spirituelle. D''entrée de jeu, moult interrogations taraudent notre esprit en nous penchant sur ce titre évocateur, constitué d''un syntagme nominal à la structure particulière qui nous introduit dans l''univers des contrastes. Comment Poùre, la colombe, symbole de paix, se transforme-t-elle en un mouton noir, source de perturbation, venant remettre en question l''harmonie du troupeau des Njoya, vocable situant la diégèse dans un microcosme déterminé ? Ces pierres d''attentes impliquent-elles en filigrane des leurres ou des lueurs pour baliser notre parcours ? L''analyse du roman nous dévoilera certainement ces mystères à décrypter…\n\nEn fait, dans son récit de 8 chapitres d''inégale longueur variant entre 13 et 30 pages environ, Viviane Moluh Peyou nous embarque dès les premières lignes dans l''itinéraire d''une jeune fille exceptionnelle, de son mariage, à son envol vers le pays de l''Oncle Sam. Dans ce chassé-croisé significatif entre son Menké natal, son séjour à Yaoundé et le départ pour les Etats-Unis, nous découvrons le parcours exaltant d''une surdouée au caractère bien trempé qui transpire dans son leitmotiv désarmant en pages 9 et 22 « Je ne suis pas faite pour le mariage » ou dans ces termes d''une lucidité déroutante en p. 10 « Celui qui suit la foule n''ira jamais plus loin que la foule qu''il suit ; par contre celui qui marche seul, peut parfois atteindre les lieux que personne n''a jamais atteints. » ou encore en p. 28 « Il n''y a pas pire aveugle que celui qui ne veut pas voir », en reprenant les dictons de la sagesse populaire. Nous sommes alors entrainés en pleine immersion dans les us et coutumes bamouns avec les indications détaillées sur le déroulement des noces ou le comportement prescrit aux différents acteurs sociaux. Nous nous délectons dans cette perspective de ce puits intarissable de richesses culturelles sur le Noun avec l''onomastique déclinée en Poùre, Lùh, Nanji, Moa Njoya, Noùn, Mbombo Njoya, Laréni, Mbiéré, Titanji ou des pépites patrimoniales qu''une plume féminine libérée pose sur la sellette avec les mots de tous les jours, d''où fusent même le « mini-kaba-ngondo » de la p. 68, d''une autre aire culturelle.\n\nNous sommes, de ce fait, édifiés sur les sept jours des noces, avec le trousseau de la mariée y afférent, sur le rituel de la traversée du mets d''arachide, ou sur le sac de deux cauris accompagné de la kola bafia et du vin de raphia. C''est dans ce sillage, que nous retrouvons des déclarations sentencieuses à l''instar de « la tradition ne connait pas le divorce » p. 94, en p. 134 « la place d''une femme est dans un foyer. » ou encore en p. 42 « J''ai toujours considéré l''infidélité comme un problème génétique, une femme ne peut être infidèle que si sa mère à un moment donné l''a été. »\n\nSon époux Nil Moùn doit faire des efforts surhumains pour supporter les ambitions et la détermination de sa dulcinée qui abandonne son foyer afin de poursuivre ses études d''astrophysique jusqu''à la NASA. N''aurait-elle pas annoncé les couleurs par ces mots péremptoires d''une intrépidité déroutante : p. 8 « Nous sommes au vingt-et-unième siècle. On n''abandonne plus ses études parce qu''on convole en justes noces » et confirmés en p. 156 « Autant le mariage n''annule pas les études, autant les études n''annulent pas le mariage. » ?\n\nHeureusement, que ses nouvelles ressources multidimensionnelles permettent à notre Amazone de disculper son mari d''une fausse accusation pour mettre tout le monde d''accord en sauvant son foyer et en offrant de nouvelles perspectives à sa famille et à tout son environnement social.\n\nCe roman à l''actualité brûlante qui se focalise sur la place de la femme dans la société africaine contemporaine, à l''image de Timildo de Fadimatou Bello, décrypte l''univers intérieur d''un être tourmenté entre un destin glorieux et un parcours semé d''embûches sous l''oppression des forces rétrogrades et d''un milieu ambiant peu propice aux carrières féminines.\n\nNous pouvons alors nous régaler des thèmes qui permettent à l''auteure de célébrer les us et les coutumes de notre terroir, l''éducation de la jeune fille, l''attachement à la terre mère, les atouts de l''acceptation de la différence, la solidarité familiale, les joies de l''amour et du pardon, l''exploration des filières avant-gardistes, les mystères de la nature et des plantes ou l''ouverture au monde.\n\nMais, l''occasion est aussi idoine pour décocher des coups de griffes incisifs dans un réquisitoire sans complaisance contre tous les préjugés et les discriminations sexistes, les mariages forcés, les violences conjugales, les conspirations iniques dans le milieu professionnel, les trafics de toutes sortes ou les inconsistances de la justice. En outre, dans une posture éminemment existentialiste, l''esthète nous ouvre le sanctuaire de ses méditations philosophiques et théologiques sur notre être-au-monde en mettant en exergue la responsabilité de l''homme dans la conduite de son destin malgré les obstacles du chemin.\n\nNous sommes également transportés dans le monde merveilleux de contes de fées où Viviane Moluh Peyou déploie des personnages au profil de démiurge comme Nil Moùn qui accepte de soutenir sa femme dans ses rêves envers et contre tout. C''est cette toile onirique qui continue à se dévoiler dans la repentance prodigieuse de Nina et son implication remarquable dans la libération de son patron, dans la reconstruction sublime de Lùh, la réception à la Présidence de la République comme dans l''apparition du Sultan des Bamouns à l''aéroport.\n\nD''autre part, toutes ces problématiques se situent dans un ancrage spatio-temporel précis auquel nous nous identifions, dans le terroir camerounais à Menké, ou à Yaoundé où sont évoqués Mvolyé, la Basilique Marie Reine des Apôtres, la Faculté de l''Université de Yaoundé I, avec son Amphi 300 ou le voyage de Douala. Par ailleurs, le style de l''écrivaine se décline dans une savoureuse délectation esthétique avec des images et des métonymies lumineuses à l''exemple de l''oxymore désignant le mariage comme une « cage dorée » en p. 10, ou dans une satire cinglante sur cette manie de ne donner raison qu''aux cheveux blancs en p. 9 ou dans les moments éprouvants en p. 91 « Tel un train qui siffle dans la nuit noire annonçant une longue période ténébreuse. » et dans cette périphrase d''une suave mélancolie en p. 91 « Les dernières gouttes de liquide salé » pour parler des larmes.\n\nDe plus, dans ce texte à la tonalité didactique assurée, la romancière utilise avec dextérité le texte explicatif dans le vocabulaire spécialisé de la physique pour éclairer notre lanterne et nous empêcher de nous égarer dans les dédales, de l''astrophysique, de l''exobiologie, de la géophysique ou dans les termes mystérieux de cette férue des lettres classiques qui utilise allègrement en p. 54 « Dac in altum » ou en p. 57 « de facto », tout naturellement. C''est sur cette lancée que nous nous enrichissons des dictons, des proverbes et des déclarations pédagogiques qui foisonnent dans le récit, à l''instar de la p. 28 « Il n''y a pas pire aveugle que celui qui ne veut pas voir. » de la p. 50 ou « Il faut se démarquer, en ne faisant pas nécessairement ce que fait tout le monde. » et en p. 97 « La panique est mauvais guide. »\n\nDe même, la temporalité avec ses accélérations illustrées par la succession des actions et les pauses marquées par les portraits ou les descriptions pittoresques se distingue par ses annonces et ses amorces de haute facture. Aussi, la présentation des personnages constitue des véritables tableaux de maître comme nous pouvons le réaliser avec le portrait de Nil en p. 15 « … la petite colombe dut admettre que Nil était un bel homme (...). Sa peau sombre restée fraîche malgré le sommeil, sa barbe rasée de près sur une mâchoire carrée délicatement sculptée, ses larges épaules musclées et son torse plaquette, son épaisse chevelure taillée en un punk afro-américaine témoignaient combien il prenait soin de son physique. Sa belle bouche et ses larges mains viriles en rajoutaient à ce beau tableau de bellâtre. Nil avait tout d''un dieu égyptien. »\n\nPour tout dire, Viviane Moluh Peyou, dans son roman qui nous garde en haleine jusqu''à la dernière page, nous sert une intrigue aux péripéties palpitantes dans un cadre enrobé de tonalité didactique et lyrique où évoluent des personnalités colorées qui facilitent l''analyse psychologique. Dans ce texte, à la satire cinglante et à l''émouvante pudeur, qui est recommandable à plus d''un titre, l''écrivaine nous replonge en pleine immersion dans l''environnement bamoun ou dans les traditions de notre terroir dans un roman écrit avec brio par les subtilités de la sensibilité féminine d''une plume libérée des lois du silence. Si nous déplorons la présence de quelques coquilles qui seront certainement corrigées dans les prochaines éditions, la longueur excessive du chapitre six qui transgresse les lois de l''équilibre avec les autres ou les passages qui nous confinent dans une sphère surplombée par le merveilleux, Poùre, le mouton noir des Njoya permet une prise de conscience salutaire pour nous lever en chœur contre les inconsistances multidimensionnelles de notre société. Nous pourrons alors, sur cette lancée, militer en faveur des valeurs éthiques propres à bâtir une société plus humaine et plus équitable. Il faut également relever que nous sommes émerveillés par la maitrise pointue de la romancière de son patrimoine culturel. C''est donc une invitation altruiste à l''enracinement patrimonial et un vibrant plaidoyer en faveur du respect des droits de l''Homme et spécifiquement de ceux des femmes et des libertés, de l''émancipation de la femme, dans le respect de notre identité, de la justice et de la tolérance, du combat contre toutes les formes de discriminations et de violences, de l''ouverture au monde, de l''acquisition de la science en vue du développement de l''amour, de la paix et du dialogue que notre contexte actuel appelle de tous ses vœux.',
5
FROM public.books WHERE slug = 'poure-mouton-noir-njoya';

-- Full note on "Poùre" — Emmanuel MATATEYOU
INSERT INTO public.reviews (book_id, reviewer_name, reviewer_location, review_text, rating)
SELECT id, 'Emmanuel MATATEYOU', 'Critique littéraire',
E'Poùre le mouton noir des Njoya (Roman) — Douala, Édition Africavenir, 2021, 176 pages.\n\nPoùre le mouton noir des Njoya est un roman fascinant qui attire l''attention du lecteur par la présence dans le titre de l''adjectif noir accolé au mouton, un animal qui habituellement a la couleur blanche. Dans ce paratexte, l''autrice annonce les couleurs de ce que le lecteur découvrira au fil des pages de cet excitant récit où on est tantôt transporté dans les nuages de l''eldorado fantasmé en Amérique et parfois dans des zones de turbulence à Menké ou Yaoundé.\n\nL''histoire qui nous est contée dans une langue châtiée révèle une jeune femme qui veut s''assurer pleinement en vertu des potentialités intellectuelles qu''elle possède. Les traditions séculaires qui ont formaté le destin des jeunes filles dans les communautés de Poùre Njoya ont la peau dure. Elle doit se battre pour se libérer effectivement et c''est à ce combat que Viviane Moluh Peyou nous convie ; le spectacle en vaut la peine.\n\nAvec délicatesse et dans un style souple, l''autrice nous présente à l''entrée l''héroïne qui est aux prises avec ses géniteurs relativement à son mariage avec Nil. On apprend qu''elle veut continuer ses études et a comme objectif d''aller à la NASA aux États-Unis où elle pense être plus utile. C''est un projet révolutionnaire et dérangeant pour tout le monde.\n\nPour Nil Moun, époux de la brave Poùre Njoya, c''est une grande déception et il va malgré tout faire preuve de compréhension et soutiendra sa dulcinée dans son projet.\n\nPour Odette Moun, belle-mère de l''héroïne, cette initiative est contradictoire aux us et coutumes de leur communauté.\n\nM. Njoya, père de l''héroïne, est frustré par la répétition de la naissance dans son ménage des filles, car l''imagerie populaire considère celui qui n''accouche que des filles comme un homme stérile. C''est la raison pour laquelle tout son courroux est déversé sur son épouse qui est considérée comme étant à l''origine de son adversité.\n\nLuh Njoya, arrivera en rescousse comme un adjuvant qui va soutenir l''héroïne dans sa quête… Elle va jouer comme dans toutes les familles le rôle de l''aînée, de la protectrice. C''est elle qui par sa présence et sa posture de femme éclatée, va aider sa cadette à parfaire son travail révolutionnaire de femme émancipée.\n\nLe roman connaît un moment de climax avec l''entrée en scène de Marilyn Oneil, Professeur de physique qui travaille à la NASA aux États-Unis et qui va faire tout ce qui est en son pouvoir pour que l''héroïne soit en phase avec ses ambitions.\n\nAu total, c''est un roman palpitant et excitant où on découvre au fil des pages les traditions et les coutumes d''ici et d''ailleurs aux prises avec les exigences de la modernité.\n\nViviane M. Peyou est une écrivaine accomplie. Ses mots nous dévorent comme les volcans endormis du Mont Mbapit qui surplombe Koumenke, sa terre natale. Sa plume généreuse affranchie, terrienne et fragile, toujours lumineuse, nous traverse. On la suit avec fascination dans ses descriptions où le lyrisme et sa verve de poétesse du silence nous enivre.\n\nL''œuvre de Madame M.P.V est un lieu de trouble et de partage car elle nous rassemble et nous relie au plus précieux de l''indicible, à l''émotion et à une vie sublimée comme celle de Poùre, l''héroïne. Le monde de la création de l''autrice qui est celui du silence nous envahit, nous transperce et nous touche droit au cœur, sans heurt comme la lumière d''un sommeil couchant sur le rocher du diamant. Et cette symbolique est bien rendue à travers les fantasmes assouvis de Poùre qui se retrouvera à la NASA et plus tard sur une autre planète, Mars. Au départ le lecteur est inquiet : le projet sera-t-il réalisé ? Par la magie de l''écriture, l''autrice fait de l''inquiétude une amie, une présence essentielle qui impose sa force de complémentarité et d''équilibre sans laquelle toute harmonie n''aurait plus aucun goût, ni aucune raison d''être conquise.',
5
FROM public.books WHERE slug = 'poure-mouton-noir-njoya';
