# Ajouter les médias soi-même

Double-cliquer sur `Ouvrir-Gestionnaire.cmd` pour ouvrir le gestionnaire local. Choisir une chanson existante pour modifier ses informations ou cliquer sur **Nouvelle chanson**. Le bouton d'enregistrement met à jour `catalogue.js` et crée d'abord une sauvegarde horodatée.

Tout se renseigne dans catalogue.js, pour chaque version fr, en ou es.

- youtube / audio : vidéo ou URL MP3 chantée publique, seulement si nécessaire.
- audioId : nom technique du MP3 chanté dans R2. Le bouton **Générer** du gestionnaire le crée automatiquement.
- timing : chemin du JSON Easy Kara pour le MP3 chanté.
- karaokeYoutube / karaokeAudio : vidéo ou MP3 karaoké normal, avec voix basse.
- karaokeTiming : JSON du karaoké normal. null utilise timing.
- karaokeProYoutube / karaokeProAudio : vidéo ou MP3 karaoké pro, sans voix.
- karaokeProTiming : JSON du karaoké pro. null utilise timing.

Les liens YouTube complets sont acceptés. Les JSON restent dans lyrics, par exemple lyrics/chanson-fr.json. Les MP3 publiés vont dans le bucket R2 privé, jamais dans GitHub. Le Worker construit désormais leur chemin automatiquement à partir de l'identifiant.

La convention R2 est toujours `audio/IDENTIFIANT.mp3`. Après avoir cliqué sur **Générer** dans le gestionnaire, téléverser le fichier sous le nom affiché. Exemples :

- chanson : `audio/nous-sommes-fr.mp3`
- karaoké normal : `audio/nous-sommes-fr-karaoke.mp3`
- karaoké pro : `audio/nous-sommes-fr-karaoke-pro.mp3`

Laisser le champ vide tant que le MP3 correspondant n'est pas présent dans R2. Il n'est plus nécessaire de modifier le Worker pour ajouter une chanson. Réutiliser le JSON uniquement si le minutage correspond. Le lecteur ne modifie pas les voix : fournir le bon mixage.

Pour Nous sommes à toi Jéhovah, la vidéo karaoké fournie est classée sous Normal. Les MP3 avec voix basse et sans voix restent à fournir. Le MP3 chanté original reste disponible depuis la grande image.

Le menu Karaoké présente Normal et Pro, puis les supports disponibles (YouTube ou lecteur intégré). Un choix sans média est indiqué À venir.

## Téléchargements

Pour une partition, cliquer sur **Choisir…** à côté de **Partition PDF**. Le gestionnaire copie automatiquement le fichier dans `downloads/partitions` et crée son lien. Ce PDF doit être envoyé sur GitHub avec les autres fichiers du site.

Pour un MP3 ou un MP4 à télécharger, coller l'adresse complète de l'hébergeur dans le champ correspondant. Aucun MP3 karaoké n'est proposé au téléchargement. Laisser un champ vide pour une ressource absente.

## Ajouter une chanson

Copier un bloc complet de chanson dans catalogue.js en séparant les blocs par une virgule. Modifier id (unique), title, image, description, tags et les versions linguistiques. Chaque releaseDate est au format AAAA-MM-JJ. Une version sans date ou datée dans le futur reste masquée. Conserver les guillemets et virgules ; les retours à la ligne de lyrics se notent \n.

## Protection simple

Le clic droit est bloqué sur les médias intégrés. Le téléchargement natif du lecteur est masqué dans les navigateurs compatibles. Les liens volontairement proposés dans Téléchargements restent utilisables. Cela décourage la copie facile mais ne chiffre pas les fichiers et ne contrôle pas le lecteur YouTube.
