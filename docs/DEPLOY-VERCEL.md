# 🚀 Guide complet — Déploiement Vercel + Supabase perso

## Pourquoi rien ne s'affiche sur Vercel ?

Votre déploiement Vercel utilise **votre** projet Supabase (`dafgpqzomhoqscjnscsw`),
mais celui-ci est **vide** : aucune table, aucune donnée, aucune image.
Il faut donc :

1. Exécuter le script SQL complet dans votre Supabase
2. Créer le bucket `media` + les dossiers
3. Uploader les images (portrait + couvertures)
4. Créer votre compte admin
5. Ajouter les variables d'environnement sur Vercel

---

## ÉTAPE 1 — Script SQL (une seule fois)

Ouvrez votre Supabase → **SQL Editor** → New query → collez le contenu de
`docs/supabase-setup-complete.sql` → **RUN**.

Ce script crée toutes les tables (books, articles, events, reviews, gallery,
resources, contact_messages, newsletter_subscribers, user_roles), les politiques
RLS, la fonction `has_role`, et insère les livres + notes de lecture.

⚠️ Après exécution, les colonnes `cover_url` des livres pointent vers l'ancien
CDN Lovable (`/__l5e/...`) — inutilisable sur Vercel. On les remplacera à
l'étape 3.

---

## ÉTAPE 2 — Bucket Storage `media`

Dans Supabase → **Storage** → **New bucket** :

- Nom : `media`
- **Public bucket** : ✅ ACTIVÉ (nécessaire pour que Vercel affiche les images)

Puis créez **manuellement** les dossiers en cliquant "Create folder" à
l'intérieur du bucket :

- `media/hero/`     ← portrait de Viviane
- `media/covers/`   ← couvertures de livres
- `media/gallery/`  ← galerie photos
- `media/articles/` ← images des chroniques

> Supabase ne crée pas les dossiers automatiquement, il faut les créer à la main
> (ou uploader un fichier dans un chemin, ça crée le dossier).

Les politiques RLS pour ce bucket sont déjà dans le script SQL (lecture publique +
écriture admin uniquement).

---

## ÉTAPE 3 — Upload des images + mise à jour des URLs

1. Uploadez dans **`media/hero/`** : `viviane-portrait.jpg`
2. Uploadez dans **`media/covers/`** :
   - `les-choix-de-lombre.jpg`
   - `poure.jpg`
   - `latinitas-6e-5e.jpg`
   - `latinitas-4e-3e.jpg`

Pour chaque fichier, cliquez dessus → **Get URL** → copiez l'URL publique
(`https://dafgpqzomhoqscjnscsw.supabase.co/storage/v1/object/public/media/covers/xxx.jpg`).

Puis dans le **SQL Editor**, exécutez (en remplaçant les URLs par les vôtres) :

```sql
UPDATE public.books SET cover_url = 'https://dafgpqzomhoqscjnscsw.supabase.co/storage/v1/object/public/media/covers/les-choix-de-lombre.jpg' WHERE slug = 'les-choix-de-l-ombre';
UPDATE public.books SET cover_url = 'https://dafgpqzomhoqscjnscsw.supabase.co/storage/v1/object/public/media/covers/poure.jpg' WHERE slug = 'poure-mouton-noir-njoya';
UPDATE public.books SET cover_url = 'https://dafgpqzomhoqscjnscsw.supabase.co/storage/v1/object/public/media/covers/latinitas-6e-5e.jpg' WHERE slug = 'latinitas-6e-5e';
UPDATE public.books SET cover_url = 'https://dafgpqzomhoqscjnscsw.supabase.co/storage/v1/object/public/media/covers/latinitas-4e-3e.jpg' WHERE slug = 'latinitas-4e-3e';
```

**Portrait hero** : uploadez dans `media/hero/viviane-portrait.jpg` puis
remplacez la référence dans `src/routes/index.tsx` (ligne où l'image hero est
importée) par l'URL publique Supabase. On peut le faire dans un prochain
message si vous voulez.

---

## ÉTAPE 4 — Créer l'admin

### 4a. Créer le compte utilisateur

Supabase → **Authentication** → **Users** → **Add user** → **Create new user** :

- Email : `moluhviviane@yahoo.fr` (ou celui de votre choix)
- Password : (choisissez un mot de passe fort)
- ✅ **Auto Confirm User** (cochez sinon vous devez confirmer par email)

Notez l'**UUID** de l'utilisateur créé (colonne `ID`).

### 4b. Lui donner le rôle admin

Dans **SQL Editor**, exécutez (remplacez `VOTRE-UUID-ICI`) :

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('VOTRE-UUID-ICI', 'admin');
```

### 4c. Se connecter

Sur votre site Vercel : **https://votre-site.vercel.app/auth**

- Entrez l'email + mot de passe
- Vous êtes redirigé vers `/admin` où vous pouvez gérer livres, chroniques,
  événements, galerie, ressources, avis, abonnés newsletter, messages.

---

## ÉTAPE 5 — Variables d'environnement Vercel

Vercel → votre projet → **Settings** → **Environment Variables** → ajoutez :

| Nom | Valeur |
|---|---|
| `VITE_SUPABASE_URL` | `https://dafgpqzomhoqscjnscsw.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `eyJhbGciOi...QBOrLqnF...` (anon key) |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOi...QKEIjW8b...` (SECRET) |
| `BREVO_API_KEY` | `xkeysib-840a...` |
| `BREVO_LIST_ID` | `3` |
| `NITRO_PRESET` | `vercel` |

Après ajout → **Redeploy** le projet.

---

## ⚠️ Sécurité — ROTATION OBLIGATOIRE

Les clés partagées dans le chat sont **compromises**. Après le premier
déploiement fonctionnel :

1. Supabase → **Settings** → **API** → **Reset service_role key** → mettez à
   jour Vercel + `.env`
2. Brevo → **SMTP & API** → régénérez la clé → mettez à jour Vercel

---

## Récap : pourquoi les chroniques n'apparaissent pas non plus

Elles sont dans le fichier de migration mais **seulement si vous exécutez le
script SQL complet dans votre Supabase**. Une fois l'étape 1 faite, elles
apparaîtront automatiquement sur `/chroniques`.
