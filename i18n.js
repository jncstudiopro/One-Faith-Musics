'use strict';
// Interface language is independent of the language of a recorded song.
const translations={
'Normal (voix basse)':['Normal (quiet vocals)','Normal (voz baja)'],
'Pro (sans voix)':['Pro (no vocals)','Pro (sin voz)'],
'Lecteur intégré':['Built-in player','Reproductor integrado'],
'KARAOKÉ PRO · SANS VOIX':['PRO KARAOKE · NO VOCALS','KARAOKE PRO · SIN VOZ'],
'KARAOKÉ NORMAL · VOIX BASSE':['NORMAL KARAOKE · QUIET VOCALS','KARAOKE NORMAL · VOZ BAJA'],
'Sur YouTube':['On YouTube','En YouTube'],
'▶ Sur YouTube':['▶ On YouTube','▶ En YouTube'],
'♫ MP3 · paroles synchronisées':['♫ MP3 · synchronized lyrics','♫ MP3 · letra sincronizada'],
'Langue du site':['Site language','Idioma del sitio'],
'LA FOI EN MUSIQUE':['FAITH IN MUSIC','LA FE EN MÚSICA'],
'Les chansons ↗':['Songs ↗','Canciones ↗'],
'Aller aux chansons':['Skip to songs','Ir a las canciones'],
'DERNIÈRE SORTIE':['LATEST RELEASE','ÚLTIMO LANZAMIENTO'],
'Des mélodies.':['Melodies.','Melodías.'],
'Une même':['One shared','Una misma'],
'foi.':['faith.','fe.'],
'Des chansons pour tourner nos pensées vers Jéhovah, trouver du réconfort et faire vivre notre espérance.':['Songs to turn our thoughts to Jehovah, find comfort and keep our hope alive.','Canciones para dirigir nuestros pensamientos a Jehová, encontrar consuelo y mantener viva nuestra esperanza.'],
'Découvrir la chanson':['Discover the song','Descubrir la canción'],
'LE CATALOGUE':['THE COLLECTION','EL CATÁLOGO'],
'À chaque instant, une chanson.':['A song for every moment.','Una canción para cada momento.'],
'Toutes les chansons ×':['All songs ×','Todas las canciones ×'],
'Langue des chansons':['Song language','Idioma de las canciones'],
'Toutes les langues':['All languages','Todos los idiomas'],
'Par page':['Per page','Por página'],
'Toutes':['All','Todas'],
'Présentation':['Layout','Presentación'],
'2 colonnes':['2 columns','2 columnas'],
'3 colonnes':['3 columns','3 columnas'],
'Écouter la chanson':['Listen to the song','Escuchar la canción'],
'Style musical':['Musical style','Estilo musical'],
'Dernière mise à jour':['Last updated','Última actualización'],
'Version audio mise à jour le':['Audio version updated on','Versión de audio actualizada el'],
'Album':['Album','Álbum'],
'Non précisé':['Not specified','No especificado'],
'Non indiquée':['Not provided','No indicada'],
'Non indiqué':['Not provided','No indicado'],
'▶ Tout écouter':['▶ Play all','▶ Reproducir todo'],
'☷ Ma liste':['☷ My playlist','☷ Mi lista'],
'＋ Ma liste':['＋ My playlist','＋ Mi lista'],
'Ma liste d’écoute':['My playlist','Mi lista de reproducción'],
'Liste d’écoute':['Playlist','Lista de reproducción'],
'Fermer':['Close','Cerrar'],
'Fermer la liste d’écoute':['Close playlist','Cerrar la lista de reproducción'],
'Vider la liste':['Clear playlist','Vaciar la lista'],
'Aléatoire':['Shuffle','Aleatorio'],
'Répétition : non':['Repeat: off','Repetición: no'],
'Répétition : toutes':['Repeat: all','Repetición: todas'],
'Répétition : une':['Repeat: one','Repetición: una'],
'Liste':['Playlist','Lista'],
'Chanson précédente':['Previous song','Canción anterior'],
'Chanson suivante':['Next song','Canción siguiente'],
'Changer le mode de répétition':['Change repeat mode','Cambiar el modo de repetición'],
'Lecteur et liste d’écoute':['Player and playlist','Reproductor y lista de reproducción'],
'À découvrir bientôt':['Available soon','Disponible próximamente'],
'♫ Karaoké':['♫ Karaoke','♫ Karaoke'],
'≡ Paroles':['≡ Lyrics','≡ Letra'],
'◎ Langues':['◎ Languages','◎ Idiomas'],
'↓ Téléchargements':['↓ Downloads','↓ Descargas'],
'Version actuelle':['Current version','Versión actual'],
'Une seule langue disponible pour le moment.':['Only one language is available for now.','Por ahora solo hay un idioma disponible.'],
'Les paroles écrites seront ajoutées prochainement.':['Written lyrics will be added soon.','La letra se añadirá próximamente.'],
'Vidéo MP4':['MP4 video','Vídeo MP4'],
'Audio MP3':['MP3 audio','Audio MP3'],
'Partition PDF':['PDF sheet music','Partitura PDF'],
'À venir':['Coming soon','Próximamente'],
'Télécharger ↗':['Download ↗','Descargar ↗'],
'Une nouvelle langue, bientôt.':['More languages coming soon.','Más idiomas próximamente.'],
'Aucune chanson n’est encore disponible avec ces filtres.':['No songs are available with these filters yet.','Todavía no hay canciones disponibles con estos filtros.'],
'Voir toutes les chansons':['See all songs','Ver todas las canciones'],
'Précédent':['Previous','Anterior'],
'Suivant':['Next','Siguiente'],
'Des créations musicales personnelles, inspirées par la foi en Jéhovah.':['Personal musical creations, inspired by faith in Jehovah.','Creaciones musicales personales, inspiradas por la fe en Jehová.'],
'Écouter avec le cœur.':['Listen with your heart.','Escuchar con el corazón.'],
'À L’ÉCOUTE':['NOW PLAYING','REPRODUCIENDO'],
'VERSION KARAOKÉ':['KARAOKE VERSION','VERSIÓN KARAOKE'],
'Si la lecture intégrée est indisponible,':['If the embedded player is unavailable,','Si el reproductor integrado no está disponible,'],
'ouvrir sur YouTube ↗':['open on YouTube ↗','abrir en YouTube ↗'],
'Fermer le lecteur':['Close player','Cerrar el reproductor'],
'Version karaoké à venir':['Karaoke version coming soon','Versión karaoke próximamente'],
'Pages du catalogue':['Collection pages','Páginas del catálogo'],
'Paroles synchronisées':['Synchronized lyrics','Letra sincronizada'],
'Une même foi nous unit, même dans l’épreuve. Un chant d’appartenance et d’espérance, tourné vers Jéhovah.':['One faith unites us, even through trials. A song of belonging and hope, turned toward Jehovah.','Una misma fe nos une, incluso en las pruebas. Un canto de unidad y esperanza dirigido a Jehová.'],
'Des siècles d’histoires, tant de voix, et pourtant toujours la même foi. Une invitation à marcher sur les traces de fidèles de toutes les générations.':['Centuries of stories, so many voices, yet always the same faith. An invitation to follow faithful people across generations.','Siglos de historias, tantas voces y siempre la misma fe. Una invitación a seguir los pasos de personas fieles de todas las generaciones.'],
'Jéhovah se souviendra. Une chanson de tendresse et de réconfort, portée par l’espoir de retrouver ceux que nous aimons.':['Jehovah will remember. A song of tenderness and comfort, carried by the hope of seeing our loved ones again.','Jehová recordará. Una canción de ternura y consuelo, impulsada por la esperanza de volver a ver a quienes amamos.'],
'La piste ne peut pas être lue. Vérifiez son lien ou réessayez plus tard.':['This track cannot be played. Check its link or try again later.','No se puede reproducir esta pista. Comprueba el enlace o inténtalo más tarde.'],
'Les paroles synchronisées sont indisponibles. La lecture reste accessible.':['Synchronized lyrics are unavailable. Playback is still available.','La letra sincronizada no está disponible. Puedes seguir escuchando.']
};
const translatedTags={'Unité':['Unity','Unidad'],'Espérance':['Hope','Esperanza'],'Foi':['Faith','Fe'],'Réconfort':['Comfort','Consuelo'],'Une même foi':['One shared faith','Una misma fe']};
const originalText=new WeakMap();
function translateText(value,language){
  if(language==='fr')return value;const i=language==='en'?0:1;
  if(translations[value])return translations[value][i];
  const count=value.match(/^(\d+) chansons?$/);if(count)return `${count[1]} ${language==='en'?(count[1]==='1'?'song':'songs'):(count[1]==='1'?'canción':'canciones')}`;
  if(value.startsWith('# '))return '# '+(translatedTags[value.slice(2)]?.[i]||value.slice(2));
  if(value.endsWith(' · Version actuelle'))return value.slice(0,-' · Version actuelle'.length)+' · '+translations['Version actuelle'][i];
  if(value.startsWith('Thème : '))return (language==='en'?'Theme: ':'Tema: ')+(translatedTags[value.slice(8)]?.[i]||value.slice(8));
  if(value.startsWith('Écouter '))return (language==='en'?'Listen to ':'Escuchar ')+value.slice(8);
  return value;
}
window.translatePage=()=>{
  const language=document.documentElement.lang;
  const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let node;
  while((node=walker.nextNode())){
    if(node.parentElement.closest('script,style,.lyrics,.timed-lyrics'))continue;
    const current=node.textContent;const previous=originalText.get(node);
    const source=previous&&previous.output===current?previous.source:current;
    const trim=source.trim();if(!trim)continue;
    const output=source.replace(trim,translateText(trim,language));node.textContent=output;originalText.set(node,{source,output});
  }
  document.querySelectorAll('[aria-label],[title]').forEach(el=>{for(const attr of ['aria-label','title']){if(!el.hasAttribute(attr))continue;const key='original-'+attr;if(!el.hasAttribute('data-'+key))el.setAttribute('data-'+key,el.getAttribute(attr));el.setAttribute(attr,translateText(el.getAttribute('data-'+key),language));}});
  document.title={fr:'One Faith Musics — Des mélodies pour la foi',en:'One Faith Musics — Melodies of faith',es:'One Faith Musics — Melodías de fe'}[language];
};
const SITE_LANGUAGE_KEY='one-faith-musics-site-language';
const savedSiteLanguage=(()=>{try{return localStorage.getItem(SITE_LANGUAGE_KEY);}catch{return null;}})();
if(['fr','en','es'].includes(savedSiteLanguage)){document.documentElement.lang=savedSiteLanguage;document.getElementById('site-language').value=savedSiteLanguage;}
document.getElementById('site-language').addEventListener('change',event=>{document.documentElement.lang=event.target.value;try{localStorage.setItem(SITE_LANGUAGE_KEY,event.target.value);}catch{}render();});
if(['fr','en','es'].includes(savedSiteLanguage))render();
window.translatePage();
