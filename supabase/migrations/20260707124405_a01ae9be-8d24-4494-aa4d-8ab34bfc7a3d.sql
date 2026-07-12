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
