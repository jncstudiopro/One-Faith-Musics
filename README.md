# One Faith Musics
 
Site statique préparé pour un dépôt GitHub nommé `One Faith Musics`. Aucun outil de compilation ni dépendance à installer.

## Aperçu

Ouvrir `index.html` pour le catalogue. Pour YouTube et le chargement des JSON, utiliser un serveur HTTP local ou GitHub Pages (la lecture depuis une URL `file:` peut être refusée par YouTube).

## Contenu

Modifier `catalogue.js` pour ajouter une chanson, ses thèmes et ses versions linguistiques. Les descriptions actuelles sont des propositions éditoriales à relire. Les trois illustrations fournies sont converties en WebP. L’image carrée est conservée entière en attendant son remplacement.

La seule vidéo fournie est associée à « Nous sommes à toi Jéhovah ». Aucun MP3, téléchargement, karaoké ou texte traduit n’a été inventé. Le JSON fourni précédemment à titre d’exemple n’est pas utilisé comme contenu définitif.

Chaque entrée possède `versions.fr`, et peut recevoir `versions.en` ou `versions.es`. Le filtre de langue porte sur les paroles/versions disponibles, pas sur la langue de l’interface. Chaque version contient :

- `youtube` : identifiant de la vidéo chantée (11 caractères).
- `audio` : URL directe d’un MP3, qui prend priorité sur YouTube.
- `karaokeYoutube` ou `karaokeAudio` : version karaoké.
- `lyrics` : texte des paroles, séparé par des sauts de ligne.
- `timing` : chemin d’un JSON Easy Kara pour le lecteur audio. Le support préparé utilise `lines`, `syllables`, `startTime`, `endTime` pour un suivi par segment. Les repères doivent correspondre exactement à l’audio ; les décalages éventuels sont à normaliser. Le rendu ne reproduit pas encore tous les effets et paramètres Easy Kara.
- `downloads` : URLs `mp4`, `mp3` et `score` (partition PDF). Les liens Drive de partage conviennent ici ; ils peuvent ouvrir la page Drive avant le téléchargement.

Les filtres de langue et thème se combinent. Pagination de 6, 12, 24 chansons ou toutes. Choix de 2 ou 3 colonnes sur grand écran, 2 sur écran intermédiaire et 1 sur téléphone.

## GitHub Pages

Le site utilise des chemins relatifs compatibles avec `https://UTILISATEUR.github.io/OneFaithMusics/`. Pour une future mise en ligne, envoyer le contenu du dossier à la racine du dépôt, puis choisir Settings → Pages → Deploy from a branch → main → / (root).

Cette livraison n’est pas publiée. Un site GitHub Pages classique est public même si son dépôt est privé. La balise `noindex` demande aux moteurs de ne pas indexer les pages ; elle ne contrôle pas l’accès. Déterminer le niveau de confidentialité avant d’activer Pages.

Les polices Google Fonts disposent de polices locales de secours. YouTube ne se charge qu’à l’ouverture du lecteur. La lecture YouTube dépend des autorisations d’intégration de la vidéo. Le MP3 via Drive doit encore être testé avec un vrai lien : une URL de partage n’est pas nécessairement une source audio directe.

## Dates et langues
Chaque version contient releaseDate au format AAAA-MM-JJ. Les versions sans date ou avec une date future ne sont pas présentées comme sorties. La date de référence suit America/Toronto. Le haut de page sélectionne la dernière version sortie, toutes langues confondues ; les cartes suivent la date de la version affichée. En cas de dates identiques, l’ordre du catalogue départage les chansons.
Le sélecteur Langue du site traduit l’interface en français, anglais ou espagnol. Il ne traduit pas les enregistrements ni les paroles : les versions musicales sont ajoutées séparément. Les titres originaux sont conservés. Les dates de sortie des versions anglaises et espagnoles restent à fournir.


## Nous sommes à toi Jéhovah — paroles
Les paroles françaises fournies sont intégrées, sans indications entre crochets. Les échos entre parenthèses sont conservés. Le fichier lyrics/nous-sommes-fr.json contient 67 lignes et 342 segments minutés (première entrée : 14,015 s). Il sera utilisé dès qu’une source audio directe sera renseignée.
Le test du MP3 Drive du 12 septembre 2026 a échoué : téléchargement interdit aux lecteurs, également refusé via la connexion Drive. Le site conserve donc YouTube et ne présente pas ce lien comme un téléchargement disponible. La synchronisation avec le MP3 reste à vérifier à l’écoute. Aucun droit de partage n’a été modifié.


## Test audio après ouverture des permissions
Le MP3 Drive est maintenant téléchargeable (11 976 960 octets). Le lecteur HTML du navigateur a toutefois refusé l’adresse Drive directe. Une copie est donc intégrée dans audio/nous-sommes-fr.mp3 ; elle est servie avec le site, et le lien Drive sert au téléchargement. Inclure le dossier audio lors de l’import GitHub. Le navigateur reconnaît une durée de 299,424 secondes, contre 299,456 secondes dans le projet Easy Kara. Les paroles suivent le temps de lecture, segment par segment ; le calage à l’oreille reste à confirmer.

