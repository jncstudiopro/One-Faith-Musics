'use strict';
const songs=window.JEHOVAH_CATALOGUE;
const $=id=>document.getElementById(id);
const AUDIO_WORKER_URL='https://one-faith-musics-audio.jnc-studiopro.workers.dev/audio-url';
const names={fr:'Français',en:'English',es:'Español'};
const SITE_VERSION=document.querySelector('meta[name="site-version"]')?.content||'1.0000';
const CURRENT_YEAR=new Date().getFullYear();
const CONTENT_LANGUAGE_KEY='one-faith-musics-content-language';
const PAGE_SIZE_KEY='one-faith-musics-page-size';
const COLUMNS_KEY='one-faith-musics-columns';
const SHUFFLE_KEY='one-faith-musics-shuffle';
const REPEAT_KEY='one-faith-musics-repeat';
const readPreference=(key,fallback)=>{try{return localStorage.getItem(key)||fallback;}catch{return fallback;}};
const savePreference=(key,value)=>{try{localStorage.setItem(key,value);}catch{}}
const pathLanguage=location.pathname.match(/\/(fr|en|es)\/(?:index\.html)?$/)?.[1];
const SITE_ROOT_URL=pathLanguage?new URL('../',location.href):new URL('./',location.href);
const preferredLanguage=readPreference(CONTENT_LANGUAGE_KEY,pathLanguage||'fr');
const preferredSize=readPreference(PAGE_SIZE_KEY,'6');
const preferredColumns=readPreference(COLUMNS_KEY,'2');
const state={theme:'Toutes',language:['all','fr','en','es'].includes(preferredLanguage)?preferredLanguage:(pathLanguage||'fr'),size:preferredSize==='all'?'all':([6,12,24].includes(Number(preferredSize))?Number(preferredSize):6),columns:['2','3'].includes(preferredColumns)?preferredColumns:'2',page:1};
let pageSongs=[];
const dateLabel=date=>date?new Intl.DateTimeFormat(document.documentElement.lang,{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(date+'T12:00:00Z')):'';
const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Toronto',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const released=v=>v&&v.releaseDate&&v.releaseDate<=today();
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeUrl=url=>{if(!url)return null;try{const u=new URL(url,location.href);return ['https:','http:'].includes(u.protocol)?u.href:null;}catch{return null;}};
const versionedStaticUrl=value=>{if(!value)return value;let url;try{url=new URL(value,SITE_ROOT_URL);}catch{return value;}if(!['https:','http:'].includes(url.protocol))return value;if(url.origin===location.origin)url.searchParams.set('v',SITE_VERSION);return url.href;};
songs.forEach(song=>{song.image=versionedStaticUrl(song.image);Object.values(song.versions||{}).forEach(version=>{if(version.image)version.image=versionedStaticUrl(version.image);});});
const r2Part=value=>typeof value==='string'&&(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).test(value);
const r2SourceAvailable=(version,trackId)=>r2Part(trackId)&&r2Part(version.albumId);
const audioSourceAvailable=version=>!!(safeUrl(version.audio)||r2SourceAvailable(version,version.audioId));
async function signedAudioUrl(trackId,language,albumId,signal){
  if(!r2Part(trackId)||!Object.hasOwn(names,language)||!r2Part(albumId))throw Error('Emplacement audio invalide.');
  const query=new URLSearchParams({id:trackId,language,album:albumId});
  const response=await fetch(`${AUDIO_WORKER_URL}?${query}`,{signal});
  if(!response.ok)throw Error('Impossible d’obtenir l’URL audio.');
  const data=await response.json();const url=safeUrl(data?.url);
  if(!url)throw Error('Le Worker n’a pas renvoyé une URL audio valide.');
  const source=new URL(url);source.hash=new URLSearchParams({ofm:`${language}|${albumId}|${trackId}|${Date.now()+Math.max(30,Number(data.expiresIn)||300)*1000}`});
  return source.href;
}
const audioRenewals=new WeakMap();
function signedAudioContext(player){try{const url=new URL(player.currentSrc||player.src);const value=new URLSearchParams(url.hash.slice(1)).get('ofm');if(!value)return null;const [language,albumId,trackId,expiresAt]=value.split('|');return {language,albumId,trackId,expiresAt:Number(expiresAt)};}catch{return null;}}
async function waitForAudioMetadata(player,signal){if(player.readyState>=1)return;await new Promise((resolve,reject)=>{const done=()=>{cleanup();resolve();},failed=()=>{cleanup();reject(Error('Audio unavailable'));},aborted=()=>{cleanup();reject(new DOMException('Aborted','AbortError'));},timer=setTimeout(failed,15000),cleanup=()=>{clearTimeout(timer);player.removeEventListener('loadedmetadata',done);player.removeEventListener('error',failed);signal?.removeEventListener('abort',aborted);};player.addEventListener('loadedmetadata',done,{once:true});player.addEventListener('error',failed,{once:true});signal?.addEventListener('abort',aborted,{once:true});});}
async function renewSignedAudio(player,force=false){
  const context=signedAudioContext(player);if(!context||(!force&&Date.now()<context.expiresAt-10000))return;
  if(audioRenewals.has(player))return audioRenewals.get(player);
  const position=Number.isFinite(player.currentTime)?player.currentTime:0;const resume=!player.paused;const status=player.closest('#player-content')?.querySelector('#audio-status')||$('playlist-status');player.pause();if(status)status.textContent='Renouvellement de l’accès audio…';
  const task=(async()=>{const source=await signedAudioUrl(context.trackId,context.language,context.albumId);player.src=source;player.load();await waitForAudioMetadata(player);if(position>0&&Number.isFinite(player.duration))player.currentTime=Math.min(position,Math.max(0,player.duration-.1));if(status)status.textContent='';if(resume)await player.play();})().catch(()=>{if(status)status.textContent='Impossible de renouveler l’accès audio. Réessayez.';}).finally(()=>audioRenewals.delete(player));
  audioRenewals.set(player,task);return task;
}
for(const eventName of ['play','seeking'])document.addEventListener(eventName,event=>{if(event.target instanceof HTMLAudioElement)renewSignedAudio(event.target);},true);
document.addEventListener('error',event=>{if(event.target instanceof HTMLAudioElement){const context=signedAudioContext(event.target);if(context&&Date.now()>=context.expiresAt-10000)renewSignedAudio(event.target,true);}},true);
function copyrightNotice(){return `<p class="copyright-notice">${CURRENT_YEAR} © One Faith Musics — Tous droits réservés. Écoute en ligne uniquement. Aucun téléchargement, enregistrement, copie, redistribution ou réutilisation n’est autorisé (<a href="${new URL('conditions.html',SITE_ROOT_URL).href}">voir conditions d’utilisation</a>).</p>`;}
document.querySelectorAll('.current-year').forEach(element=>{element.textContent=CURRENT_YEAR;});
const playerNoticeObserver=new MutationObserver(()=>{const audio=$('player-content')?.querySelector('audio');if(audio&&!$('player-content').querySelector('.copyright-notice'))audio.insertAdjacentHTML('afterend',copyrightNotice());});
playerNoticeObserver.observe($('player-content'),{childList:true,subtree:true});
const youtubeId=value=>{if(typeof value!=='string')return null;const text=value.trim();if(/^[\w-]{11}$/.test(text))return text;try{const url=new URL(text);if(!['https:','http:'].includes(url.protocol))return null;const host=url.hostname.toLowerCase();const id=host==='youtu.be'?url.pathname.slice(1).split('/')[0]:['youtube.com','www.youtube.com','m.youtube.com','www.youtube-nocookie.com'].includes(host)?url.searchParams.get('v')||url.pathname.match(/^\/(?:embed|shorts)\/([\w-]{11})/)?.[1]:null;return id&&/^[\w-]{11}$/.test(id)?id:null;}catch{return null;}};
const hasReleaseDate=v=>!!(v&&v.releaseDate);
const versionOf=s=>{const lang=state.language==='all'?Object.keys(s.versions).filter(l=>hasReleaseDate(s.versions[l])).sort((a,b)=>s.versions[b].releaseDate.localeCompare(s.versions[a].releaseDate))[0]:state.language;return {lang,version:s.versions[lang]};};
const detailsOf=(song,language=state.language)=>{const version=song.versions?.[language]||{};return {title:version.title||song.title||song.id,image:version.image||song.image||'assets/favicon.svg',portrait:version.portrait??song.portrait??false,description:version.description??song.description??'',album:version.album??song.album??'',style:version.style??song.style??'',tags:Array.isArray(version.tags)?version.tags:(Array.isArray(song.tags)?song.tags:[])};};
const languageHome=language=>new URL(`${language}/`,SITE_ROOT_URL).href;
const songLanguageUrl=(songId,language)=>{const url=new URL(languageHome(language));url.searchParams.set('song',songId);return url.href;};
document.querySelectorAll('a.brand').forEach(link=>{link.href=languageHome(pathLanguage||document.documentElement.lang||'fr');});
const deepLinkParams=new URLSearchParams(location.search);
const deepLinkSongId=deepLinkParams.get('song');
const deepLinkLanguage=deepLinkParams.get('lang');
const deepLinkSong=songs.find(song=>song.id===deepLinkSongId)||null;
let deepLinkPending=!!deepLinkSong;
if(deepLinkSong&&Object.hasOwn(names,deepLinkLanguage)&&hasReleaseDate(deepLinkSong.versions?.[deepLinkLanguage]))state.language=deepLinkLanguage;
let playerAbort=null;
function render(){
  renderLatest();
  $('active-theme').hidden=state.theme==='Toutes';
  $('active-theme-name').textContent=`Thème : ${state.theme}`;
  const filtered=songs.filter(s=>{const available=state.language==='all'?Object.values(s.versions).some(hasReleaseDate):hasReleaseDate(s.versions[state.language]);if(!available)return false;const {lang}=versionOf(s);return state.theme==='Toutes'||detailsOf(s,lang).tags.includes(state.theme);}).sort((a,b)=>versionOf(b).version.releaseDate.localeCompare(versionOf(a).version.releaseDate));
  const size=state.size==='all'?Math.max(1,filtered.length):state.size;
  if(deepLinkPending){
    const deepLinkIndex=filtered.findIndex(song=>song.id===deepLinkSong?.id);
    if(deepLinkIndex>=0)state.page=Math.floor(deepLinkIndex/size)+1;
    else deepLinkPending=false;
  }
  const pages=Math.max(1,Math.ceil(filtered.length/size));state.page=Math.min(state.page,pages);
  $('result-count').textContent=`${filtered.length} chanson${filtered.length===1?'':'s'}`;
  $('empty').hidden=filtered.length>0;
  pageSongs=filtered.slice((state.page-1)*size,state.page*size);
  $('song-grid').innerHTML=pageSongs.map(card).join('');
  $('pagination').innerHTML=pages>1?`<button data-page="${state.page-1}" ${state.page===1?'disabled':''}>Précédent</button><span>${state.page} / ${pages}</span><button data-page="${state.page+1}" ${state.page===pages?'disabled':''}>Suivant</button>`:'';
  window.translatePage?.();
  if(deepLinkPending){
    deepLinkPending=false;
    requestAnimationFrame(()=>{
      const target=[...document.querySelectorAll('[data-song]')].find(element=>element.dataset.song===deepLinkSong?.id);
      target?.scrollIntoView({block:'center',behavior:'smooth'});
    });
  }
}
function renderLatest(){
  const candidates=state.language==='all'?songs.flatMap(song=>Object.entries(song.versions).filter(([,v])=>released(v)).map(([lang,v])=>({song,lang,date:v.releaseDate}))):songs.filter(song=>released(song.versions[state.language])).map(song=>({song,lang:state.language,date:song.versions[state.language].releaseDate}));
  candidates.sort((a,b)=>b.date.localeCompare(a.date));
  const latest=candidates[0];const art=document.querySelector('.intro-art');if(!latest){$('latest-release').hidden=true;art.hidden=true;return;}
  $('latest-release').hidden=false;art.hidden=false;
  const details=detailsOf(latest.song,latest.lang);art.querySelector('img').src=details.image;art.querySelector('img').alt=details.title;art.classList.toggle('portrait',!!details.portrait);
  art.querySelector('.art-caption').textContent=details.title;
  $('latest-title').textContent=details.title;$('latest-date').dateTime=latest.date;$('latest-date').textContent=dateLabel(latest.date);
  $('latest-link').onclick=()=>{state.theme='Toutes';state.page=1;render();requestAnimationFrame(()=>document.querySelector(`[data-song="${latest.song.id}"]`)?.scrollIntoView({block:'center'}));};
}
function card(s){const {lang,version:v}=versionOf(s);const d=detailsOf(s,lang);const audioReady=audioSourceAvailable(v);const available=!!(youtubeId(v.youtube)||audioReady);const normalKaraokeReady=!!((safeUrl(v.karaokeAudio)||v.karaokeAudioId||safeUrl(v.audio)||v.audioId)&&safeUrl(v.karaokeTiming||v.timing));return `<article class="song-card" data-song="${esc(s.id)}"><button class="cover ${d.portrait?'portrait':''}" data-action="play" aria-label="Écouter ${esc(d.title)}" ${available?'':'disabled'}><img src="${esc(d.image)}" alt="${esc(d.title)}" width="1672" height="941" loading="lazy">${available?'<span class="play-icon" aria-hidden="true">▶</span>':''}<span class="cover-status">${available?'Écouter la chanson':'À découvrir bientôt'}</span></button><div class="song-body"><div class="song-meta"><time datetime="${esc(v.releaseDate)}">${esc(dateLabel(v.releaseDate))}</time><button class="info-button" data-action="info" aria-expanded="false" aria-controls="info-${s.id}" aria-label="Informations sur ${esc(d.title)}">i</button></div><h3>${esc(d.title)}</h3><p class="description">${esc(d.description)}</p><div class="song-tags">${d.tags.map(t=>`<button class="song-tag" data-theme="${esc(t)}"># ${esc(t)}</button>`).join('')}</div><div class="song-info" id="info-${s.id}" role="tooltip" hidden><dl><div><dt>Style musical</dt><dd>${esc(d.style||'Non précisé')}</dd></div><div><dt>Version audio mise à jour le</dt><dd>${esc(v.lastUpdated?dateLabel(v.lastUpdated):'Non indiquée')}</dd></div><div><dt>Album</dt><dd>${esc(d.album||'Non indiqué')}</dd></div></dl></div><div class="actions"><button class="action" data-action="queue" ${audioReady?'':'disabled'}>＋ Ma liste</button><button class="action" data-action="karaoke" aria-expanded="false" aria-controls="karaoke-${s.id}" ${youtubeId(v.karaokeYoutube)||youtubeId(v.karaokeProYoutube)||normalKaraokeReady||((safeUrl(v.karaokeProAudio)||v.karaokeProAudioId)&&safeUrl(v.karaokeProTiming||v.timing))?'':'disabled title="Version karaoké à venir"'}>♫ Karaoké</button><button class="action" data-action="lyrics" aria-expanded="false" aria-controls="lyrics-${s.id}">≡ Paroles</button><button class="action" data-action="languages" aria-expanded="false" aria-controls="languages-${s.id}">◎ Langues</button><button class="action" data-action="downloads" aria-expanded="false" aria-controls="downloads-${s.id}">↓ Téléchargements</button></div><div class="panel karaoke-options" id="karaoke-${s.id}" hidden>${karaokeChoices(s,v)}</div><div class="panel" id="lyrics-${s.id}" hidden>${v.lyrics?`<div class="lyrics" lang="${lang}">${esc(v.lyrics)}</div>`:'<p>Les paroles écrites seront ajoutées prochainement.</p>'}</div><div class="panel language-options" id="languages-${s.id}" hidden>${languageChoices(s,lang)}</div><div class="panel downloads" id="downloads-${s.id}" hidden>${[['mp4','Vidéo MP4'],['mp3','Audio MP3'],['score','Partition PDF']].map(([key,label])=>{const url=safeUrl(v.downloads?.[key]);return `<div class="download-row"><span>${label}</span>${url?`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">Télécharger ↗</a>`:'<small>À venir</small>'}</div>`;}).join('')}</div></div></article>`;}
function languageChoices(song,currentLanguage){const languages=Object.entries(song.versions).filter(([,version])=>hasReleaseDate(version)).map(([language])=>language);return languages.map(language=>language===currentLanguage?`<span class="language-current" lang="${esc(language)}">${esc(names[language]||language)} · Version actuelle</span>`:`<button class="language-link" data-song-language="${esc(language)}" lang="${esc(language)}">${esc(names[language]||language)} →</button>`).join('')+(languages.length===1?'<small>Une seule langue disponible pour le moment.</small>':'');}
let infoHoverTimer=null;
function closeInfoBubbles(except=null){document.querySelectorAll('.song-info:not([hidden])').forEach(panel=>{if(panel===except)return;panel.hidden=true;document.querySelector(`[aria-controls="${panel.id}"]`)?.setAttribute('aria-expanded','false');});}
function positionInfoBubble(button,panel){const margin=8,gap=9,buttonRect=button.getBoundingClientRect();panel.style.left='0px';panel.style.top='0px';const panelRect=panel.getBoundingClientRect();const left=Math.max(margin,Math.min(buttonRect.right-panelRect.width,window.innerWidth-panelRect.width-margin));const above=buttonRect.bottom+gap+panelRect.height>window.innerHeight&&buttonRect.top-gap-panelRect.height>=margin;const top=above?buttonRect.top-gap-panelRect.height:Math.min(buttonRect.bottom+gap,window.innerHeight-panelRect.height-margin);panel.classList.toggle('above',above);panel.style.left=`${left}px`;panel.style.top=`${Math.max(margin,top)}px`;panel.style.setProperty('--arrow-left',`${Math.max(12,Math.min(panelRect.width-12,buttonRect.left+buttonRect.width/2-left))}px`);}
function openInfoBubble(button){const panel=$(button.getAttribute('aria-controls'));if(!panel)return;closeInfoBubbles(panel);panel.hidden=false;button.setAttribute('aria-expanded','true');positionInfoBubble(button,panel);}
document.addEventListener('mouseover',event=>{if(!matchMedia('(hover:hover)').matches)return;const button=event.target.closest('.info-button');if(!button||button.contains(event.relatedTarget))return;clearTimeout(infoHoverTimer);infoHoverTimer=setTimeout(()=>openInfoBubble(button),450);});
document.addEventListener('mouseout',event=>{if(!matchMedia('(hover:hover)').matches)return;const button=event.target.closest('.info-button');if(!button||button.contains(event.relatedTarget))return;clearTimeout(infoHoverTimer);const panel=$(button.getAttribute('aria-controls'));if(event.relatedTarget&&panel?.contains(event.relatedTarget))return;panel?.setAttribute('hidden','');button.setAttribute('aria-expanded','false');});
document.addEventListener('scroll',()=>closeInfoBubbles(),true);
document.addEventListener('click',event=>{
  closeInfoBubbles(event.target.closest('.info-button')?$(event.target.closest('.info-button').getAttribute('aria-controls')):null);
  const theme=event.target.closest('[data-theme]');if(theme){state.theme=theme.dataset.theme;state.page=1;render();$('clear-theme').focus({preventScroll:true});$('catalogue').scrollIntoView();return;}
  const page=event.target.closest('[data-page]');if(page){state.page=Number(page.dataset.page);render();$('catalogue').scrollIntoView();return;}
  const languageLink=event.target.closest('[data-song-language]');if(languageLink){const songCard=languageLink.closest('[data-song]');state.language=languageLink.dataset.songLanguage;savePreference(CONTENT_LANGUAGE_KEY,state.language);$('language').value=state.language;state.page=1;render();requestAnimationFrame(()=>document.querySelector(`[data-song="${songCard.dataset.song}"]`)?.scrollIntoView({block:'center'}));return;}
  const button=event.target.closest('[data-action]');if(!button)return;
  const song=songs.find(s=>s.id===button.closest('[data-song]').dataset.song);const action=button.dataset.action;
  if(action==='info'){const panel=$(button.getAttribute('aria-controls'));if(panel.hidden)openInfoBubble(button);else{panel.hidden=true;button.setAttribute('aria-expanded','false');}return;}
  if(action==='play'){const {version}=versionOf(song);if(audioSourceAvailable(version))startPagePlaylist(song);else openPlayer(song,action);return;}
  if(action==='queue'){addSongToPlaylist(song);return;}
  if(['karaoke-youtube','karaoke-mp3','karaoke-pro-youtube','karaoke-pro-mp3'].includes(action)){openPlayer(song,action);return;}
  const panel=$(`${action}-${song.id}`);panel.hidden=!panel.hidden;button.setAttribute('aria-expanded',String(!panel.hidden));window.translatePage?.();
});
$('language').value=state.language;
$('page-size').value=String(state.size);
$('columns').value=state.columns;
$('song-grid').classList.toggle('three',state.columns==='3');
$('language').addEventListener('change',e=>{state.language=e.target.value;savePreference(CONTENT_LANGUAGE_KEY,state.language);state.page=1;render();});
$('page-size').addEventListener('change',e=>{state.size=e.target.value==='all'?'all':Number(e.target.value);savePreference(PAGE_SIZE_KEY,String(state.size));state.page=1;render();});
$('columns').addEventListener('change',e=>{state.columns=e.target.value;savePreference(COLUMNS_KEY,state.columns);$('song-grid').classList.toggle('three',state.columns==='3');});
$('clear-theme').addEventListener('click',()=>{state.theme='Toutes';state.page=1;render();$('collection-title').focus({preventScroll:true});});
$('reset-filters').addEventListener('click',()=>{state.language='all';savePreference(CONTENT_LANGUAGE_KEY,'all');state.theme='Toutes';state.page=1;$('language').value='all';render();});

const playlistAudio=$('playlist-audio');
let playlistAbort=null;
const PLAYLIST_SESSION_KEY='one-faith-musics-session-playlist-v2';

function readPlaylist(){try{const value=JSON.parse(sessionStorage.getItem(PLAYLIST_SESSION_KEY)||'[]');return Array.isArray(value)?value.filter(entry=>entry&&songs.some(song=>song.id===entry.songId)&&Object.hasOwn(names,entry.lang)):[];}catch{return [];}}
let playlist=readPlaylist();
let playlistIndex=playlist.length?0:-1;


let playerPanelOpen=false;
let shuffle=readPreference(SHUFFLE_KEY,'false')==='true';
let repeat=['off','all','one'].includes(readPreference(REPEAT_KEY,'off'))?readPreference(REPEAT_KEY,'off'):'off';
function playlistEntry(song,lang=versionOf(song).lang){const version=song.versions[lang];return version&&audioSourceAvailable(version)?{songId:song.id,lang}:null;}
function playlistSong(entry){return songs.find(song=>song.id===entry?.songId);}
function savePlaylist(){try{sessionStorage.setItem(PLAYLIST_SESSION_KEY,JSON.stringify(playlist));}catch{}renderPlaylist();}
function playlistLabel(){return repeat==='one'?'Répétition : une':repeat==='all'?'Répétition : toutes':'Répétition : non';}
function renderPlaylist(){
  const current=playlistSong(playlist[playlistIndex]);
  $('playlist-count').textContent=playlist.length;$('queue-count').textContent=playlist.length;$('show-playlist').disabled=!playlist.length;
  $('playlist-player').hidden=!playlist.length||!playerPanelOpen;
  $('playlist-shuffle').setAttribute('aria-pressed',String(shuffle));$('playlist-repeat').dataset.mode=repeat;$('playlist-repeat').textContent=playlistLabel();
  if(current){const details=detailsOf(current,playlist[playlistIndex]?.lang);$('playlist-cover').src=details.image;$('playlist-cover').alt=details.title;$('playlist-title').textContent=details.title;}
  $('queue-items').innerHTML=playlist.map((entry,index)=>{const song=playlistSong(entry);const title=song?detailsOf(song,entry.lang).title:entry.songId;return `<li class="${index===playlistIndex?'current':''}"><button data-queue-index="${index}"><span>${index===playlistIndex?'▶':'♫'}</span>${esc(title)} <small>${esc(names[entry.lang]||entry.lang)}</small></button><button data-queue-remove="${index}" aria-label="Retirer ${esc(title)}">×</button></li>`;}).join('');
  window.translatePage?.();
}
function replacePlaylist(entries,start=0){playlist=entries.filter(Boolean);playlistIndex=playlist.length?Math.max(0,Math.min(start,playlist.length-1)):-1;savePlaylist();if(playlist.length)loadPlaylistTrack(playlistIndex);}
function addSongToPlaylist(song){const entry=playlistEntry(song);if(!entry)return;const existing=playlist.findIndex(item=>item.songId===entry.songId&&item.lang===entry.lang);if(existing<0){playlist.push(entry);if(playlistIndex<0)playlistIndex=playlist.length-1;savePlaylist();$('playlist-status').textContent='Ajoutée à votre liste.';}else{$('playlist-status').textContent='Cette chanson est déjà dans votre liste.';}}
function startPagePlaylist(song){const entry=playlistEntry(song);if(!entry)return;if(playlist.length){let selected=playlist.findIndex(item=>item.songId===entry.songId&&item.lang===entry.lang);if(selected<0){playlist.push(entry);selected=playlist.length-1;savePlaylist();}loadPlaylistTrack(selected);return;}const entries=pageSongs.map(item=>playlistEntry(item)).filter(Boolean);const selected=entries.findIndex(item=>item.songId===song.id&&item.lang===entry.lang);replacePlaylist(entries,selected<0?0:selected);}
async function loadPlaylistTrack(index,autoplay=true){
  if(index<0||index>=playlist.length)return;playerPanelOpen=true;playlistIndex=index;const entry=playlist[index];const song=playlistSong(entry);const version=song?.versions[entry.lang];if(!song||!version)return;
  playlistAbort?.abort();playlistAbort=new AbortController();playlistAudio.pause();playlistAudio.removeAttribute('src');playlistAudio.load();$('playlist-status').textContent='Préparation de la piste…';renderPlaylist();
  try{const source=safeUrl(version.audio)||await signedAudioUrl(version.audioId,entry.lang,version.albumId,playlistAbort.signal);if(playlistAbort.signal.aborted)return;playlistAudio.src=source;playlistAudio.load();$('playlist-status').textContent='';if(autoplay){try{await playlistAudio.play();}catch(error){if(error.name==='NotAllowedError')$('playlist-status').textContent='La piste est prête. Appuyez sur Lecture.';else throw error;}}}catch(error){if(error.name!=='AbortError')$('playlist-status').textContent='Impossible de préparer cette piste.';}
}
function nextPlaylist(manual=false){if(!playlist.length)return;if(shuffle&&playlist.length>1){let next=playlistIndex;while(next===playlistIndex)next=Math.floor(Math.random()*playlist.length);loadPlaylistTrack(next);return;}if(playlistIndex<playlist.length-1){loadPlaylistTrack(playlistIndex+1);return;}if(repeat==='all'||manual)loadPlaylistTrack(0);}
function previousPlaylist(){if(!playlist.length)return;if(playlistAudio.currentTime>4){playlistAudio.currentTime=0;return;}loadPlaylistTrack(playlistIndex>0?playlistIndex-1:playlist.length-1);}
$('play-visible').addEventListener('click',()=>{
  const entries=pageSongs.map(song=>playlistEntry(song)).filter(Boolean);let added=0;
  for(const entry of entries){if(!playlist.some(item=>item.songId===entry.songId&&item.lang===entry.lang)){playlist.push(entry);added++;}}
  if(playlistIndex<0&&playlist.length)playlistIndex=0;
  savePlaylist();
  $('playlist-status').textContent=added?`${added} chanson${added===1?'':'s'} ajoutée${added===1?'':'s'} depuis cette page.`:'Les chansons de cette page sont déjà dans votre liste.';
});
$('show-playlist').addEventListener('click',()=>{if(!playlist.length)return;playerPanelOpen=true;$('playlist-player').hidden=false;const open=$('playlist-queue').hidden;$('playlist-queue').hidden=!open;$('queue-toggle').setAttribute('aria-expanded',String(open));});
$('queue-toggle').addEventListener('click',()=>{const open=$('playlist-queue').hidden;$('playlist-queue').hidden=!open;$('queue-toggle').setAttribute('aria-expanded',String(open));});
$('close-queue').addEventListener('click',()=>{$('playlist-queue').hidden=true;$('queue-toggle').setAttribute('aria-expanded','false');$('queue-toggle').focus({preventScroll:true});});
$('playlist-toggle').addEventListener('click',()=>{if(!playlist.length)return;if(!playlistAudio.src){loadPlaylistTrack(Math.max(0,playlistIndex));return;}playlistAudio.paused?playlistAudio.play():playlistAudio.pause();});
$('playlist-next').addEventListener('click',()=>nextPlaylist(true));
$('playlist-previous').addEventListener('click',previousPlaylist);
$('playlist-shuffle').addEventListener('click',()=>{shuffle=!shuffle;savePreference(SHUFFLE_KEY,String(shuffle));renderPlaylist();});
$('playlist-repeat').addEventListener('click',()=>{repeat=repeat==='off'?'all':repeat==='all'?'one':'off';savePreference(REPEAT_KEY,repeat);renderPlaylist();});
$('clear-playlist').addEventListener('click',()=>{playlistAbort?.abort();playlistAudio.pause();playlistAudio.removeAttribute('src');playlist=[];playlistIndex=-1;playerPanelOpen=false;$('playlist-queue').hidden=true;savePlaylist();});
$('queue-items').addEventListener('click',event=>{const play=event.target.closest('[data-queue-index]');if(play){loadPlaylistTrack(Number(play.dataset.queueIndex));return;}const remove=event.target.closest('[data-queue-remove]');if(!remove)return;const index=Number(remove.dataset.queueRemove);playlist.splice(index,1);if(!playlist.length){playlistAudio.pause();playlistAudio.removeAttribute('src');playlistIndex=-1;playerPanelOpen=false;$('playlist-queue').hidden=true;}else if(index===playlistIndex){playlistIndex=Math.min(index,playlist.length-1);loadPlaylistTrack(playlistIndex);}else if(index<playlistIndex)playlistIndex--;savePlaylist();});
playlistAudio.addEventListener('play',()=>{$('playlist-toggle').textContent='❚❚';$('playlist-toggle').setAttribute('aria-label','Pause');});
playlistAudio.addEventListener('pause',()=>{$('playlist-toggle').textContent='▶';$('playlist-toggle').setAttribute('aria-label','Lecture');});
playlistAudio.addEventListener('ended',()=>{if(repeat==='one'){playlistAudio.currentTime=0;playlistAudio.play();}else nextPlaylist(false);});
playlistAudio.addEventListener('error',()=>{$('playlist-status').textContent='La piste ne peut pas être lue.';});
renderPlaylist();

async function openPlayer(song,mode='play'){
  const karaoke=mode!=='play';
  $('player-dialog').classList.toggle('singing-mode',mode.endsWith('mp3'));
  playerAbort?.abort();playerAbort=new AbortController();
  const {lang,version:v}=versionOf(song);const details=detailsOf(song,lang);const pro=mode.startsWith('karaoke-pro-');const video=mode.endsWith('mp3')?null:youtubeId(karaoke?(pro?v.karaokeProYoutube:v.karaokeYoutube):v.youtube);const karaokeAudio=pro?v.karaokeProAudio:(v.karaokeAudio||v.audio);const karaokeAudioId=pro?v.karaokeProAudioId:(v.karaokeAudioId||v.audioId);const audio=mode.endsWith('youtube')?null:safeUrl(karaoke?karaokeAudio:v.audio);const audioId=mode.endsWith('youtube')?null:(karaoke?karaokeAudioId:v.audioId);const timing=karaoke?((pro?v.karaokeProTiming:v.karaokeTiming)||v.timing):v.timing;const r2Ready=r2SourceAvailable(v,audioId);
  $('player-title').textContent=details.title;$('player-mode').textContent=karaoke?(pro?'KARAOKÉ PRO · SANS VOIX':'KARAOKÉ NORMAL · VOIX BASSE'):'À L’ÉCOUTE';$('player-extra').replaceChildren();
  if(audio||r2Ready){$('player-content').innerHTML=`<img class="audio-art" src="${esc(details.image)}" alt="${esc(details.title)}"><audio controls controlslist="nodownload" preload="metadata"></audio><p class="player-footer" id="audio-status" role="status">Préparation de la piste…</p>`;const player=$('player-content').querySelector('audio');const signal=playerAbort.signal;player.addEventListener('error',()=>{$('audio-status').textContent='La piste ne peut pas être lue. Vérifiez son lien ou réessayez plus tard.';},{signal});if(timing)loadTiming(player,timing,signal);else if(v.lyrics)$('player-extra').innerHTML=`<div class="timed-lyrics lyrics">${esc(v.lyrics)}</div>`;$('player-dialog').showModal();window.translatePage?.();try{const source=audio||await signedAudioUrl(audioId,lang,v.albumId,signal);if(signal.aborted)return;player.src=source;player.load();$('audio-status').textContent='';try{await player.play();}catch(error){if(error.name==='NotAllowedError')$('audio-status').textContent='La piste est prête. Appuyez sur Lecture.';else throw error;}}catch(error){if(signal.aborted)return;$('audio-status').textContent='Impossible de préparer la piste. Réessayez dans un instant.';}return;
  }else if(video){$('player-content').innerHTML=`<iframe class="video-frame" src="https://www.youtube-nocookie.com/embed/${video}?autoplay=1&rel=0" title="${esc(details.title)}${karaoke?' — Karaoké':''}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe><p class="player-footer">Si la lecture intégrée est indisponible, <a href="https://www.youtube.com/watch?v=${video}" target="_blank" rel="noopener noreferrer">ouvrir sur YouTube ↗</a></p>`;
  }else{return;}
  $('player-dialog').showModal();window.translatePage?.();
}
async function loadTiming(player,url,signal){
  try{const source=versionedStaticUrl(url);if(!safeUrl(source))throw Error();const response=await fetch(source,{signal});if(!response.ok)throw Error();const json=await response.json();if(!Array.isArray(json.lines))throw Error();
    const lines=json.lines;const clean=text=>String(text||'').replace(/\[[^\]]*\]/g,'').replace(/\/\//g,'').trim();
    if(signal.aborted)return;
    const singing=$('player-dialog').classList.contains('singing-mode');
    $('player-extra').innerHTML='<div class="timed-lyrics" aria-label="Paroles synchronisées"></div>';const container=$('player-extra').firstElementChild;
    container.innerHTML=lines.map(line=>`<p>${(line.syllables||[]).map(segment=>`<span>${esc(clean(segment.text))}</span>`).join(' ')}</p>`).join('');
    if(signal.aborted)return;
    const rows=[...container.children];let previousLine=-1;
    if(singing){
      const updateStage=()=>{
        const time=player.currentTime;
        let index=lines.findIndex(line=>time<line.endTime);
        if(index<0)index=lines.length-1;
        rows.forEach((row,i)=>{row.hidden=i!==index&&i!==index+1&&i!==index+2;row.classList.toggle('up-next',i>index);row.classList.toggle('current-line',i===index);(lines[i].syllables||[]).forEach((segment,j)=>{row.children[j].classList.toggle('active',time>=segment.startTime&&time<segment.endTime);row.children[j].classList.toggle('sung',time>=segment.endTime);});});
        if(previousLine!==index){previousLine=index;fitStage();}
      };
      const fitStage=()=>{container.style.fontSize='';let size=parseFloat(getComputedStyle(container).fontSize);while((container.scrollHeight>container.clientHeight+1||container.scrollWidth>container.clientWidth+1)&&size>16){size-=1;container.style.fontSize=size+'px';}};
      const observer=new ResizeObserver(fitStage);observer.observe($('player-extra'));signal.addEventListener('abort',()=>observer.disconnect(),{once:true});
      for(const event of ['timeupdate','seeked','loadedmetadata','play','ended'])player.addEventListener(event,updateStage,{signal});
      updateStage();return;
    }
    const update=()=>{const time=player.currentTime;let current=-1;lines.forEach((line,i)=>{const active=time>=line.startTime&&time<line.endTime;rows[i].classList.toggle('current-line',active);if(active)current=i;(line.syllables||[]).forEach((seg,j)=>{rows[i].children[j].classList.toggle('active',time>=seg.startTime&&time<seg.endTime);rows[i].children[j].classList.toggle('sung',active&&time>=seg.endTime);});});if(current>=0&&current!==previousLine){const row=rows[current];container.scrollTop+=row.getBoundingClientRect().top-container.getBoundingClientRect().top-container.clientHeight/2+row.clientHeight/2;}previousLine=current;};
    for(const event of ['timeupdate','seeked','loadedmetadata','play'])player.addEventListener(event,update,{signal});update();
  }catch(error){if(error.name!=='AbortError')$('player-extra').innerHTML='<p class="player-footer">Les paroles synchronisées sont indisponibles. La lecture reste accessible.</p>';}
}
$('close-player').addEventListener('click',()=>$('player-dialog').close());
$('player-dialog').addEventListener('click',event=>{if(event.target===$('player-dialog')){const r=event.target.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)event.target.close();}});
$('player-dialog').addEventListener('close',()=>{playerAbort?.abort();$('player-content').replaceChildren();$('player-extra').replaceChildren();});
render();

function karaokeChoices(s,v){return [['normal','Normal (voix basse)',v.karaokeYoutube,v.karaokeAudio||v.audio,v.karaokeAudioId||v.audioId,v.karaokeTiming||v.timing],['pro','Pro (sans voix)',v.karaokeProYoutube,v.karaokeProAudio,v.karaokeProAudioId,v.karaokeProTiming||v.timing]].map(([kind,label,video,audio,audioId,timing])=>{const readyVideo=!!youtubeId(video),readyAudio=!!((safeUrl(audio)||r2SourceAvailable(v,audioId))&&safeUrl(timing));const prefix=kind==='pro'?'karaoke-pro':'karaoke';return '<div class="karaoke-kind"><button class="action" data-action="karaoke-'+kind+'" aria-expanded="false" aria-controls="karaoke-'+kind+'-'+s.id+'" '+(readyVideo||readyAudio?'':'disabled')+'>'+label+'</button>'+(!readyVideo&&!readyAudio?'<small>À venir</small>':'')+'<div class="karaoke-options" id="karaoke-'+kind+'-'+s.id+'" hidden>'+(readyVideo?'<button class="action" data-action="'+prefix+'-youtube">▶ Sur YouTube</button>':'')+(readyAudio?'<button class="action" data-action="'+prefix+'-mp3">♫ MP3 · paroles synchronisées</button>':'')+'</div></div>';}).join('');}
// Discourage ordinary saving from media controls without blocking text selection.
document.addEventListener('dragstart',event=>{if(event.target.closest('.cover img,.audio-art'))event.preventDefault();});
