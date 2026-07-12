# 📚 Site Viviane Moluh Peyou — Guide de mise en service

Ce document explique **comment administrer le site**, **où uploader les images**, **comment configurer votre Supabase et Brevo**, et **quoi faire pour publier**.

---

## 1. Accéder au panneau admin

1. Ouvrez le site : `https://viviane-moluh.lovable.app/auth`
2. Créez un compte (email + mot de passe) — cette page fonctionne aussi comme inscription.
3. Récupérez votre **user id** dans le tableau de bord Supabase → *Authentication → Users*.
4. Dans le **SQL Editor** Supabase, exécutez (en remplaçant `VOTRE_USER_ID`) :

   ```sql
   INSERT INTO public.user_roles (user_id, role)
   VALUES ('VOTRE_USER_ID', 'admin');
   ```

5. Rechargez le site — vous avez maintenant accès à `/admin` (Livres, Chroniques, Agenda, Galerie, Ressources, Avis, Messages, Abonnés).

---

## 2. Uploader les couvertures de livres

### Où stocker les images ?
- **Service** : Supabase Storage (déjà configuré, **pas besoin d'un autre service**).
- **Bucket** : `media` (déjà créé, **public en lecture**).
- **Sous-dossier recommandé** : `covers/` pour les couvertures, `gallery/` pour la galerie, `photos/` pour le portrait.

### Depuis le panneau admin (recommandé — sans toucher au code)
1. Aller sur `/admin/books`.
2. Cliquer sur *Modifier* pour un livre.
3. Cliquer sur *Uploader une couverture*.
4. Sélectionner le fichier — l'URL est enregistrée automatiquement dans le champ `cover_url` de la table `books`.

### Directement dans Supabase (sans passer par le code)
1. Ouvrir Supabase → *Storage* → bucket **`media`** → dossier **`covers/`**.
2. Cliquer *Upload file* et déposer par exemple `les-choix-de-lombre.jpg`.
3. Copier l'URL publique (menu 3-points → *Get URL*).
4. Ouvrir Supabase → *Table Editor* → table **`books`**.
5. Éditer la ligne du livre concerné et coller l'URL dans le champ **`cover_url`**.
6. Sauvegarder. Le site affiche la couverture immédiatement.

**Correspondance slug → livre :**
- `les-choix-de-l-ombre` → *Les choix de l'ombre*
- `poure-mouton-noir-njoya` → *Poùre, le mouton noir des Njoya*
- `latinitas-6e-5e` → *LATINITAS 6ᵉ/5ᵉ*
- `latinitas-4e-3e` → *LATINITAS 4ᵉ/3ᵉ*

---

## 3. Photo du portrait (page d'accueil)

La photo actuelle vous a été fournie par vous-même (`hero_pictures.jpg`) et est déjà en place, servie par le CDN de l'hébergeur. Pour la changer :

**Option A — Remplacer via chat Lovable** (le plus simple) : envoyez la nouvelle photo dans le chat et demandez « remplace la photo du hero ».

**Option B — Manuellement** :
1. Uploader la nouvelle photo dans Supabase Storage → bucket `media` → dossier `photos/`.
2. Récupérer l'URL publique.
3. Dans le code : ouvrir `src/routes/index.tsx`, remplacer l'import `heroPortrait` par un tag `<img src="URL_COPIÉE" ... />`.

---

## 4. Variables d'environnement — sécurité

**Aucune clé API n'est écrite en dur dans le code.** Toutes les clés sont lues depuis des variables d'environnement.

### Fichiers concernés

| Fichier | Rôle |
|---|---|
| `.env` | Vos vraies clés (à la racine, **jamais commité**) |
| `.env.example` | Modèle des variables attendues (commité, sans secrets) |
| `src/integrations/supabase/client.ts` | Lit uniquement `VITE_SUPABASE_URL` + `VITE_SUPABASE_PUBLISHABLE_KEY` (frontend) |
| `src/integrations/supabase/client.server.ts` | Lit `SUPABASE_SERVICE_ROLE_KEY` (server functions) |
| `src/lib/newsletter.functions.ts` | Lit `BREVO_API_KEY` + `BREVO_LIST_ID` (envoi Brevo) |

### Où placer `.env`
À la **racine du projet** (au même niveau que `package.json`). Il est déjà dans `.gitignore`.

### Modèle (voir `.env.example`)

```env
# --- Supabase (nouveau projet perso) ---
VITE_SUPABASE_URL="https://dafgpqzomhoqscjnscsw.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="votre_anon_key"
SUPABASE_SERVICE_ROLE_KEY="votre_service_role_key"

# --- Brevo (Newsletter) ---
BREVO_API_KEY="xkeysib-..."
BREVO_LIST_ID="3"
```

### Pour Vercel
- **Project Settings → Environment Variables** : ajoutez toutes les variables ci-dessus (mêmes noms, mêmes valeurs).
- Cochez « Production », « Preview », « Development » selon besoin.
- Redéployez.

---

## 5. Migration vers votre propre projet Supabase

Le preview Lovable et Vercel doivent utiliser le même projet externe (`dafgpqzomhoqscjnscsw`) via les variables d'environnement ci-dessus :

1. **Créer le schéma** : dans le SQL Editor de votre projet, exécutez le fichier `supabase/migrations/*.sql` (tous les fichiers, dans l'ordre chronologique du nom). Cela crée : tables, `user_roles`, `has_role`, RLS, GRANTs.

2. **Créer le bucket** : Storage → *Create bucket* → nom `media`, cocher **Public**.

3. **Policies storage** (bucket `media`) — SQL Editor :

   ```sql
   -- Lecture publique
   CREATE POLICY "Public read media" ON storage.objects
     FOR SELECT TO anon, authenticated
     USING (bucket_id = 'media');

   -- Écriture réservée aux admins
   CREATE POLICY "Admins upload media" ON storage.objects
     FOR INSERT TO authenticated
     WITH CHECK (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'));

   CREATE POLICY "Admins update media" ON storage.objects
     FOR UPDATE TO authenticated
     USING (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'));

   CREATE POLICY "Admins delete media" ON storage.objects
     FOR DELETE TO authenticated
     USING (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'));
   ```

4. **Seed contenu** : exécutez la dernière migration ajoutée (celle qui crée les 4 livres et les 3 notes de lecture) — présente dans `supabase/migrations/`.

5. **Créer votre admin** : voir section 1.

6. **Basculer `.env`** avec les nouvelles clés (voir section 4).

---

## 6. Configuration Brevo (Newsletter)

1. Se connecter à https://app.brevo.com
2. **API Keys** → *Generate a new API key* → copier la clé `xkeysib-...`.
3. **Contacts → Lists** → repérer l'ID numérique de la liste (le nôtre est `3`).
4. Coller `BREVO_API_KEY` et `BREVO_LIST_ID` dans le `.env` (et dans Vercel).
5. **Sender** : dans Brevo → *Senders & IP → Add sender* → email `moluhviviane@yahoo.fr` (valider par email).

Le formulaire du site enverra chaque inscription à la liste `3` **et** stockera un backup dans la table `newsletter_subscribers` (Supabase).

---

## 7. Contact & réseaux sociaux

- **Email affiché & destinataire des messages** : `moluhviviane@yahoo.fr`
- **Facebook** : « Viviane MOLUH PEYOU Auteure ». **URL à renseigner** dans `src/components/site/Footer.tsx` (constante `FACEBOOK_URL`). Envoyez-moi l'URL exacte et je la mets à jour.
- Aucun autre réseau social affiché (Instagram, LinkedIn, YouTube retirés).

---

## 8. Checklist finale avant publication

- [ ] Uploader les 4 couvertures de livres (bucket `media/covers/`)
- [ ] Renseigner l'URL Facebook exacte dans `Footer.tsx`
- [ ] Créer votre compte admin (section 1)
- [ ] Vérifier que le formulaire newsletter arrive bien dans la liste Brevo `#3`
- [ ] Vérifier que le formulaire contact arrive dans la table `contact_messages`
- [ ] Publier depuis Lovable (bouton *Publish*) ou déployer sur Vercel
- [ ] (optionnel) Brancher un domaine personnalisé
