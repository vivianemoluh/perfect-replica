# Guide de l'auteure — Gérer le site Viviane Moluh Peyou

Ce guide explique, étape par étape, comment gérer votre site sans aucune
connaissance technique.

## Se connecter à l'espace admin

1. Allez sur votre site puis ajoutez `/auth` à la fin de l'adresse.
2. Entrez votre email (`vivianemoluh.auteure@gmail.com`) et votre mot de passe.
3. Cliquez sur **Se connecter**. Vous arrivez sur le **Tableau de bord**.

Le tableau de bord affiche en temps réel : nombre de livres, chroniques
publiées, événements, photos, messages reçus (avec une **pastille rouge**
indiquant les messages non lus) et abonnés à la newsletter.

---

## 1. Comment ajouter un livre

1. Menu de gauche → **Livres**.
2. Cliquez sur **Ajouter** (en haut à droite).
3. Remplissez : Titre (FR), Titre (EN), Genre, Année, Ordre d'affichage.
4. Rédigez le Résumé (FR) et le Résumé (EN).
5. Sous **Couverture**, cliquez pour choisir une image : elle est
   **automatiquement envoyée sur Cloudinary** et un aperçu apparaît.
6. Laissez l'interrupteur **Publié** activé pour l'afficher sur le site.
7. Cliquez sur **Enregistrer**.

Le livre apparaît immédiatement sur la page **Livres** du site.
Pour corriger un livre : icône **crayon**. Pour le supprimer : icône
**corbeille**.

---

## 2. Comment publier un article (chronique / note de lecture)

1. Menu de gauche → **Chroniques**.
2. Cliquez sur **Ajouter**.
3. Remplissez le Titre et le contenu.
4. Choisissez la **catégorie** :
   - *Notes de lecture* pour une critique d'ouvrage,
   - *Réflexions personnelles* ou *Actualités* selon le cas.
5. Vérifiez que **Publié** est activé.
6. Cliquez sur **Enregistrer**.

L'article apparaît immédiatement dans la page **Chroniques**.

---

## 3. Comment uploader une photo dans la galerie

1. Menu de gauche → **Galerie**.
2. Dans « Ajouter une photo » :
   - Cliquez sur le champ **Image** et choisissez une photo → elle est
     **envoyée automatiquement sur Cloudinary** et un aperçu s'affiche.
   - Écrivez une **Légende (FR)** et une **Légende (EN)** (facultatif).
   - Choisissez la **Catégorie** (Dédicaces, Événements, Rencontres,
     Portraits).
3. Cliquez sur **Enregistrer**.

La photo apparaît **immédiatement** dans la galerie publique.
Pour supprimer une photo : survolez-la et cliquez sur **Supprimer**.

---

## 4. Comment envoyer une newsletter via Brevo

Les inscriptions du site sont enregistrées dans votre base **et** ajoutées
automatiquement à votre liste Brevo (liste n° 3). Pour écrire et envoyer une
campagne :

1. Connectez-vous sur **https://app.brevo.com**.
2. Menu **Campagnes** → **Créer une campagne** → **Email**.
3. Donnez un nom, un objet, puis choisissez l'expéditeur.
4. À l'étape **Destinataires**, sélectionnez votre **liste d'abonnés**
   (celle alimentée par le site).
5. Rédigez le contenu avec l'éditeur Brevo (glisser-déposer).
6. Cliquez sur **Envoyer** (ou **Programmer** pour plus tard).

Astuce : vous pouvez vérifier le nombre d'abonnés dans le **Tableau de bord**
admin (carte « Abonnés newsletter »).

---

## En cas de problème

- **Un bouton Enregistrer ne fonctionne pas / erreur de permission** :
  l'administrateur technique doit exécuter une seule fois le script
  `docs/livraison-finale.sql` dans Supabase (SQL Editor).
- **Une image ne s'affiche pas** : ré-essayez l'upload, la connexion a pu
  être interrompue.
