# Ajouter les médias soi-même

Tout se renseigne dans catalogue.js, pour chaque version fr, en ou es.

- youtube / audio : vidéo ou URL MP3 chantée publique, seulement si nécessaire.
- audioId : identifiant autorisé par le Worker Cloudflare pour le MP3 chanté dans R2. C'est le choix normal pour les chansons publiées.
- timing : chemin du JSON Easy Kara pour le MP3 chanté.
- karaokeYoutube / karaokeAudio : vidéo ou MP3 karaoké normal, avec voix basse.
- karaokeTiming : JSON du karaoké normal. null utilise timing.
- karaokeProYoutube / karaokeProAudio : vidéo ou MP3 karaoké pro, sans voix.
- karaokeProTiming : JSON du karaoké pro. null utilise timing.

Les liens YouTube complets sont acceptés. Les JSON restent dans lyrics, par exemple lyrics/chanson-fr.json. Les MP3 chantés publiés vont dans le bucket R2 privé, jamais dans GitHub. Dans catalogue.js, renseigner seulement l'identifiant audioId prévu par le Worker, par exemple "nous-sommes-fr". Le chemin R2 et les secrets restent uniquement dans Cloudflare. Réutiliser le JSON uniquement si le minutage correspond. Le lecteur ne modifie pas les voix : fournir le bon mixage.

Pour Nous sommes à toi Jéhovah, la vidéo karaoké fournie est classée sous Normal. Les MP3 avec voix basse et sans voix restent à fournir. Le MP3 chanté original reste disponible depuis la grande image.

Le menu Karaoké présente Normal et Pro, puis les supports disponibles (YouTube ou lecteur intégré). Un choix sans média est indiqué À venir.

## Téléchargements

downloads.mp3 : chanson ; downloads.mp4 : vidéo ; downloads.score : partition. Aucun MP3 karaoké à télécharger. Un lien Drive convient ici. Écrire null sans guillemets pour une ressource absente.

## Ajouter une chanson

Copier un bloc complet de chanson dans catalogue.js en séparant les blocs par une virgule. Modifier id (unique), title, image, description, tags et les versions linguistiques. Chaque releaseDate est au format AAAA-MM-JJ. Une version sans date ou datée dans le futur reste masquée. Conserver les guillemets et virgules ; les retours à la ligne de lyrics se notent \n.

## Protection simple

Le clic droit est bloqué sur les médias intégrés. Le téléchargement natif du lecteur est masqué dans les navigateurs compatibles. Les liens volontairement proposés dans Téléchargements restent utilisables. Cela décourage la copie facile mais ne chiffre pas les fichiers et ne contrôle pas le lecteur YouTube.
