-- ============================================================
-- LIVRAISON FINALE — Script SQL complet
-- Projet Supabase : dafgpqzomhoqscjnscsw
-- À coller dans Supabase → SQL Editor → RUN (idempotent, ré-exécutable)
-- ============================================================

-- ------------------------------------------------------------
-- 0. CRITIQUE — Réautoriser has_role() pour le rôle "authenticated"
--    Une ancienne migration a fait REVOKE EXECUTE ... FROM authenticated,
--    ce qui casse TOUTES les écritures admin (les politiques RLS
--    "Admins manage ..." appellent has_role()). Sans ce GRANT, aucun
--    bouton "Enregistrer" du panneau admin ne fonctionne.
-- ------------------------------------------------------------
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

-- ------------------------------------------------------------
-- 1. RLS — Lecture publique du contenu publié (corrige les 403)
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Public read published books" ON public.books;
CREATE POLICY "Public read published books"
  ON public.books FOR SELECT TO anon
  USING (is_published = true);

DROP POLICY IF EXISTS "Public read published articles" ON public.articles;
CREATE POLICY "Public read published articles"
  ON public.articles FOR SELECT TO anon
  USING (is_published = true);

-- (Lecture publique aussi pour authenticated, sinon le site connecté est bloqué)
DROP POLICY IF EXISTS "Auth read published books" ON public.books;
CREATE POLICY "Auth read published books"
  ON public.books FOR SELECT TO authenticated
  USING (is_published = true OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Auth read published articles" ON public.articles;
CREATE POLICY "Auth read published articles"
  ON public.articles FOR SELECT TO authenticated
  USING (is_published = true OR public.has_role(auth.uid(), 'admin'));

-- ------------------------------------------------------------
-- 2. Rôle admin pour l'auteure
-- ------------------------------------------------------------
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE email = 'vivianemoluh.auteure@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- ------------------------------------------------------------
-- 3. LES 4 LIVRES  (INSERT ... ON CONFLICT (slug) DO UPDATE)
--    NB : la table books n'a pas de colonne "publisher".
--    L'éditeur peut être ajouté dans purchase_links si besoin.
-- ------------------------------------------------------------
INSERT INTO public.books (slug, title_fr, title_en, genre, publication_year, display_order, is_published, cover_url, summary_fr, summary_en)
VALUES
('les-choix-de-l-ombre',
 'Les choix de l''ombre', 'The Choices of Shadow', 'Roman', 2021, 1, true,
 'https://res.cloudinary.com/viryenyp/image/upload/v1783724806/les-choix-de-lombre_ejijde.jpg',
 'Un drame social poignant qui plonge le lecteur dans le parcours de Caïn, Sonia et Zelda. L''auteure dresse un réquisitoire contre le viol intrafamilial, les secrets de famille et l''avilissement de la femme, tout en célébrant le pardon, la résilience et la sororité.',
 'A poignant social drama following Caïn, Sonia and Zelda. The author delivers an unflinching indictment of intrafamilial rape, family secrets and the subjugation of women, while celebrating forgiveness, resilience and sisterhood.'),
('poure-mouton-noir-njoya',
 'Poùre, le mouton noir des Njoya', 'Poùre, the Black Sheep of the Njoya', 'Roman', 2021, 2, true,
 'https://res.cloudinary.com/viryenyp/image/upload/v1783724796/poure_ui7mrh.jpg',
 'Un roman fascinant retraçant le parcours de Poùre, jeune femme surdouée tiraillée entre les traditions de sa communauté bamoun et ses ambitions académiques. Déterminée à poursuivre ses études d''astrophysique jusqu''à la NASA malgré le mariage arrangé, elle incarne le combat pour l''émancipation féminine et le droit à l''éducation.',
 'A fascinating novel tracing the journey of Poùre, a gifted young woman torn between Bamoun traditions and her academic ambitions. Determined to pursue astrophysics at NASA despite arranged marriage, she embodies the fight for female emancipation and the right to education.'),
('latinitas-6e-5e',
 'LATINITAS — Le latin au sous-cycle d''observation (6e/5e)', 'LATINITAS — Latin for Lower Secondary (6th/5th grade)', 'Manuel scolaire officiel', 2024, 3, true,
 'https://res.cloudinary.com/viryenyp/image/upload/v1783724791/latinitas-6e-5e_big0vn.jpg',
 'Manuel officiel de Lettres Classiques au Cameroun pour les classes de 6e et 5e. Coécrit avec un groupe d''Inspecteurs Pédagogiques. Manuel inscrit sur la liste officielle des manuels scolaires au Cameroun.',
 'Official Latin textbook for Cameroonian lower secondary schools (6th and 5th grade). Co-written with a group of Pedagogical Inspectors. Listed on the official Cameroon Ministry of Education approved textbook list.'),
('latinitas-4e-3e',
 'LATINITAS — Le latin au sous-cycle d''orientation (4e/3e)', 'LATINITAS — Latin for Upper Secondary (4th/3rd grade)', 'Manuel scolaire officiel', 2024, 4, true,
 'https://res.cloudinary.com/viryenyp/image/upload/v1783724790/latinitas-4e-3e_c3phms.jpg',
 'Document didactique de latin pour les élèves au sous-cycle d''orientation et pour les enseignants. Manuel officiel inscrit sur la liste officielle des manuels scolaires au Cameroun.',
 'Latin teaching document for upper secondary students and teachers. Official textbook on the Cameroon Ministry of Education approved list.')
ON CONFLICT (slug) DO UPDATE SET
  title_fr = EXCLUDED.title_fr,
  title_en = EXCLUDED.title_en,
  genre = EXCLUDED.genre,
  publication_year = EXCLUDED.publication_year,
  display_order = EXCLUDED.display_order,
  is_published = EXCLUDED.is_published,
  cover_url = EXCLUDED.cover_url,
  summary_fr = EXCLUDED.summary_fr,
  summary_en = EXCLUDED.summary_en;

-- ------------------------------------------------------------
-- 4. LES 3 NOTES DE LECTURE
--    La colonne category est limitée à ('reflexions','actualites','publications').
--    'publications' est affiché comme « Notes de lecture » sur le site.
--    (La table articles n'a pas de colonne "author" : l'auteur du texte
--     est placé en tête de content_fr.)
-- ------------------------------------------------------------
INSERT INTO public.articles (slug, title_fr, content_fr, category, is_published, published_at)
VALUES
('note-lecture-les-choix-de-lombre',
 'Note de lecture — Les choix de l''ombre',
 'Par Josée MELI AMBADIANG, Critique littéraire

Dans cette œuvre rigoureusement structurée, nous sommes conviés à un voyage dans le parcours de Caïn, Sonia et Zelda, au cœur de leur environnement familial et socio-professionnel. L''auteure utilise une intrigue à la remarquable complexité pour dresser un réquisitoire sans complaisance contre les maux qui minent notre société : le viol, les secrets de famille, la polygamie et l''avilissement de la femme. Ce roman est recommandable à plus d''un titre — il nous garde en haleine jusqu''à la dernière ligne et aborde avec dextérité des thèmes délicats, célébrant les valeurs du pardon et de la résilience.',
 'publications', true, '2023-03-23T00:00:00Z'),
('note-lecture-poure-1',
 'Note de lecture — Poùre, le mouton noir des Njoya (I)',
 'Par Josée MELI AMBADIANG, Critique littéraire

L''œuvre nous interpelle dès la première de couverture avec le visage d''une femme noire aux allures intrépides. Viviane Moluh Peyou nous embarque dans l''itinéraire d''une jeune fille exceptionnelle, de son mariage à son envol vers les États-Unis. Nous découvrons le parcours exaltant d''une surdouée au caractère bien trempé, déterminée à poursuivre ses études d''astrophysique jusqu''à la NASA. Un roman à l''actualité brûlante qui décrypte l''univers intérieur d''un être tourmenté entre un destin glorieux et un parcours semé d''embûches.',
 'publications', true, '2023-03-23T00:00:00Z'),
('note-lecture-poure-2',
 'Note de lecture — Poùre, le mouton noir des Njoya (II)',
 'Par Emmanuel MATATEYOU

C''est un roman palpitant et excitant où on découvre au fil des pages les traditions et coutumes d''ici et d''ailleurs aux prises avec les exigences de la modernité. Viviane M. Peyou est une écrivaine accomplie. Ses mots nous dévorent comme les volcans endormis du Mont Mbapit qui surplombe Koumenke, sa terre natale. Sa plume généreuse, terrienne et lumineuse nous traverse. L''œuvre est un lieu de trouble et de partage car elle nous rassemble et nous relie au plus précieux de l''indicible.',
 'publications', true, '2023-03-23T00:00:00Z')
ON CONFLICT (slug) DO UPDATE SET
  title_fr = EXCLUDED.title_fr,
  content_fr = EXCLUDED.content_fr,
  category = EXCLUDED.category,
  is_published = EXCLUDED.is_published,
  published_at = EXCLUDED.published_at;

-- FIN DU SCRIPT
