# Organisation des langues

Le site utilise un seul dépôt GitHub, un seul Worker Cloudflare et un seul bucket R2.

## Adresses du site

- Français : `https://jncstudiopro.github.io/One-Faith-Musics/fr/`
- English : `https://jncstudiopro.github.io/One-Faith-Musics/en/`
- Español : `https://jncstudiopro.github.io/One-Faith-Musics/es/`

La préférence choisie dans l’en-tête est conservée dans le navigateur et détermine la langue de l’interface. Le réglage **Langue des chansons** reste indépendant : un visiteur peut garder toute l’interface en espagnol et demander les chansons françaises. Ce deuxième choix est également mémorisé.

## Ajouter une traduction avec le gestionnaire

1. Sélectionner la chanson existante.
2. Dans l’onglet **Chanson**, choisir `en` ou `es` dans **Langue de cette version**.
3. Entrer le titre, l’album, le style, les tags, la description et l’image propres à cette langue.
4. Compléter **Version et médias** avec la date, les identifiants R2, YouTube, les paroles, le JSON Easy Kara et les téléchargements.
5. Enregistrer.

L’identifiant technique de la chanson reste commun aux langues. Les informations visibles et les médias sont enregistrés dans `versions.fr`, `versions.en` ou `versions.es`.

## Dossiers créés automatiquement

Chaque langue possède tout son contenu :

```text
fr/
  assets/
    social/
  lyrics/
  partitions/
  partage/
en/
  assets/
  lyrics/
  partitions/
  partage/
es/
  assets/
  lyrics/
  partitions/
  partage/
```

Les fichiers communs au fonctionnement du site (`app.js`, `style.css`, `i18n.js` et `catalogue.js`) restent à la racine afin de n’être maintenus qu’une seule fois.

Dans R2, les pistes suivent le même principe : `fr/album/piste.mp3`, `en/album/piste.mp3`, `es/album/piste.mp3`.

Le Worker reçoit séparément la langue, le dossier de l’album et l’identifiant audio. Il peut donc construire le chemin R2 sans liste de chansons codée en dur.
