'use strict';
const songs=window.JEHOVAH_CATALOGUE;
const $=id=>document.getElementById(id);
const AUDIO_WORKER_URL='https://one-faith-musics-audio.jnc-studiopro.workers.dev/audio-url';
const names={fr:'Français',en:'English',es:'Español'};
const CONTENT_LANGUAGE_KEY='one-faith-musics-content-language';
const PAGE_SIZE_KEY='one-faith-musics-page-size';
const COLUMNS_KEY='one-faith-musics-columns';
const PLAYLIST_KEY='one-faith-musics-playlist';
const SHUFFLE_KEY='one-faith-musics-shuffle';
const REPEAT_KEY='one-faith-musics-repeat';
const readPreference=(key,fallback)=>{try{return localStorage.getItem(key)||fallback;}catch{return fallback;}};
const savePreference=(key,value)=>{try{localStorage.setItem(key,value);}catch{}}
const preferredLanguage=readPreference(CONTENT_LANGUAGE_KEY,'fr');
const preferredSize=readPreference(PAGE_SIZE_KEY,'6');
const preferredColumns=readPreference(COLUMNS_KEY,'2');
const state={theme:'Toutes',language:['all','fr','en','es'].includes(preferredLanguage)?preferredLanguage:'fr',size:preferredSize==='all'?'all':([6,12,24].includes(Number(preferredSize))?Number(preferredSize):6),columns:['2','3'].includes(preferredColumns)?preferredColumns:'2',page:1};
let pageSongs=[];
const dateLabel=date=>date?new Intl.DateTimeFormat(document.documentElement.lang,{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(date+'T12:00:00Z')):'';
const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Toronto',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const released=v=>v&&v.releaseDate&&v.releaseDate<=today();
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeUrl=url=>{if(!url)return null;try{const u=new URL(url,location.href);return ['https:','http:'].includes(u.protocol)?u.href:null;}catch{return null;}};
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
  return url;
}
const youtubeId=value=>{if(typeof value!=='string')return null;const text=value.trim();if(/^[\w-]{11}$/.test(text))return text;try{const url=new URL(text);if(!['https:','http:'].includes(url.protocol))return null;const host=url.hostname.toLowerCase();const id=host==='youtu.be'?url.pathname.slice(1).split('/')[0]:['youtube.com','www.youtube.com','m.youtube.com','www.youtube-nocookie.com'].includes(host)?url.searchParams.get('v')||url.pathname.match(/^\/(?:embed|shorts)\/([\w-]{11})/)?.[1]:null;return id&&/^[\w-]{11}$/.test(id)?id:null;}catch{return null;}};
const versionOf=s=>{const lang=state.language==='all'?Object.keys(s.versions).filter(l=>released(s.versions[l])).sort((a,b)=>s.versions[b].releaseDate.localeCompare(s.versions[a].releaseDate))[0]:state.language;return {lang,version:s.versions[lang]};};
let playerAbort=null;
function render(){
  renderLatest();
  $('active-theme').hidden=state.theme==='Toutes';
  $('active-theme-name').textContent=`Thème : ${state.theme}`;
  const filtered=songs.filter(s=>(state.theme==='Toutes'||s.tags.includes(state.theme))&&(state.language==='all'?Object.values(s.versions).some(released):released(s.versions[state.language]))).sort((a,b)=>versionOf(b).version.releaseDate.localeCompare(versionOf(a).version.releaseDate));
  const size=state.size==='all'?Math.max(1,filtered.length):state.size;
  const pages=Math.max(1,Math.ceil(filtered.length/size));state.page=Math.min(state.page,pages);
  $('result-count').textContent=`${filtered.length} chanson${filtered.length===1?'':'s'}`;
  $('empty').hidden=filtered.length>0;
  pageSongs=filtered.slice((state.page-1)*size,state.page*size);
  $('song-grid').innerHTML=pageSongs.map(card).join('');
  $('pagination').innerHTML=pages>1?`<button data-page="${state.page-1}" ${state.page===1?'disabled':''}>Précédent</button><span>${state.page} / ${pages}</span><button data-page="${state.page+1}" ${state.page===pages?'disabled':''}>Suivant</button>`:'';
  window.translatePage?.();
}
function renderLatest(){
  const candidates=songs.flatMap(song=>Object.entries(song.versions).filter(([,v])=>released(v)).map(([lang,v])=>({song,lang,date:v.releaseDate})));
  candidates.sort((a,b)=>b.date.localeCompare(a.date));
  const latest=candidates[0];if(!latest){$('latest-release').hidden=true;return;}
  $('latest-release').hidden=false;
  const art=document.querySelector('.intro-art');art.querySelector('img').src=latest.song.image;art.querySelector('img').alt=latest.song.title;art.classList.toggle('portrait',!!latest.song.portrait);
  art.querySelector('.art-caption').textContent=latest.song.title;
  $('latest-title').textContent=latest.song.title;$('latest-date').dateTime=latest.date;$('latest-date').textContent=dateLabel(latest.date);
  $('latest-link').onclick=()=>{state.theme='Toutes';state.language=latest.lang;savePreference(CONTENT_LANGUAGE_KEY,latest.lang);$('language').value=latest.lang;state.page=1;render();requestAnimationFrame(()=>document.querySelector(`[data-song="${latest.song.id}"]`)?.scrollIntoView({block:'center'}));};
}
function card(s){const {lang,version:v}=versionOf(s);const audioReady=audioSourceAvailable(v);const available=!!(youtubeId(v.youtube)||audioReady);return `<article class="song-card" data-song="${esc(s.id)}"><button class="cover ${s.portrait?'portrait':''}" data-action="play" aria-label="Écouter ${esc(s.title)}" ${available?'':'disabled'}><img src="${esc(s.image)}" alt="${esc(s.title)}" width="1672" height="941" loading="lazy">${available?'<span class="play-icon" aria-hidden="true">▶</span>':''}<span class="cover-status">${available?'Écouter la chanson':'À découvrir bientôt'}</span></button><div class="song-body"><div class="song-meta"><time datetime="${esc(v.releaseDate)}">${esc(dateLabel(v.releaseDate))}</time><button class="info-button" data-action="info" aria-expanded="false" aria-controls="info-${s.id}" aria-label="Informations sur ${esc(s.title)}">i</button></div><h3>${esc(s.title)}</h3><p class="description">${esc(s.description)}</p><div class="song-tags">${s.tags.map(t=>`<button class="song-tag" data-theme="${esc(t)}"># ${esc(t)}</button>`).join('')}</div><div class="panel song-info" id="info-${s.id}" hidden><dl><div><dt>Style musical</dt><dd>${esc(s.style||'Non précisé')}</dd></div><div><dt>Version audio mise à jour le</dt><dd>${esc(v.lastUpdated?dateLabel(v.lastUpdated):'Non indiquée')}</dd></div><div><dt>Album</dt><dd>${esc(s.album||'Non indiqué')}</dd></div></dl></div><div class="actions"><button class="action" data-action="queue" ${audioReady?'':'disabled'}>＋ Ma liste</button><button class="action" data-action="karaoke" aria-expanded="false" aria-controls="karaoke-${s.id}" ${youtubeId(v.karaokeYoutube)||youtubeId(v.karaokeProYoutube)||((safeUrl(v.karaokeAudio)||v.karaokeAudioId)&&safeUrl(v.karaokeTiming||v.timing))||((safeUrl(v.karaokeProAudio)||v.karaokeProAudioId)&&safeUrl(v.karaokeProTiming||v.timing))?'':'disabled title="Version karaoké à venir"'}>♫ Karaoké</button><button class="action" data-action="lyrics" aria-expanded="false" aria-controls="lyrics-${s.id}">≡ Paroles</button><button class="action" data-action="languages" aria-expanded="false" aria-controls="languages-${s.id}">◎ Langues</button><button class="action" data-action="downloads" aria-expanded="false" aria-controls="downloads-${s.id}">↓ Téléchargements</button></div><div class="panel karaoke-options" id="karaoke-${s.id}" hidden>${karaokeChoices(s,v)}</div><div class="panel" id="lyrics-${s.id}" hidden>${v.lyrics?`<div class="lyrics" lang="${lang}">${esc(v.lyrics)}</div>`:'<p>Les paroles écrites seront ajoutées prochainement.</p>'}</div><div class="panel language-options" id="languages-${s.id}" hidden>${languageChoices(s,lang)}</div><div class="panel downloads" id="downloads-${s.id}" hidden>${[['mp4','Vidéo MP4'],['mp3','Audio MP3'],['score','Partition PDF']].map(([key,label])=>{const url=safeUrl(v.downloads?.[key]);return `<div class="download-row"><span>${label}</span>${url?`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">Télécharger ↗</a>`:'<small>À venir</small>'}</div>`;}).join('')}</div></div></article>`;}
function languageChoices(song,currentLanguage){const languages=Object.entries(song.versions).filter(([,version])=>released(version)).map(([language])=>language);return languages.map(language=>language===currentLanguage?`<span class="language-current" lang="${esc(language)}">${esc(names[language]||language)} · Version actuelle</span>`:`<button class="language-link" data-song-language="${esc(language)}" lang="${esc(language)}">${esc(names[language]||language)} →</button>`).join('')+(languages.length===1?'<small>Une seule langue disponible pour le moment.</small>':'');}
document.addEventListener('click',event=>{
  const theme=event.target.closest('[data-theme]');if(theme){state.theme=theme.dataset.theme;state.page=1;render();$('clear-theme').focus({preventScroll:true});$('catalogue').scrollIntoView();return;}
  const page=event.target.closest('[data-page]');if(page){state.page=Number(page.dataset.page);render();$('catalogue').scrollIntoView();return;}
  const languageLink=event.target.closest('[data-song-language]');if(languageLink){const songCard=languageLink.closest('[data-song]');state.language=languageLink.dataset.songLanguage;savePreference(CONTENT_LANGUAGE_KEY,state.language);$('language').value=state.language;state.page=1;render();requestAnimationFrame(()=>document.querySelector(`[data-song="${songCard.dataset.song}"]`)?.scrollIntoView({block:'center'}));return;}
  const button=event.target.closest('[data-action]');if(!button)return;
  const song=songs.find(s=>s.id===button.closest('[data-song]').dataset.song);const action=button.dataset.action;
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
$('reset-filters').addEventListener('click',()=>{state.language='fr';savePreference(CONTENT_LANGUAGE_KEY,'fr');state.theme='Toutes';state.page=1;$('language').value='fr';render();});

const playlistAudio=$('playlist-audio');
let playlistAbort=null;
let playlistIndex=-1;
let playlist=readPlaylist();
let shuffle=readPreference(SHUFFLE_KEY,'false')==='true';
let repeat=['off','all','one'].includes(readPreference(REPEAT_KEY,'off'))?readPreference(REPEAT_KEY,'off'):'off';
function readPlaylist(){try{const value=JSON.parse(localStorage.getItem(PLAYLIST_KEY)||'[]');return Array.isArray(value)?value.filter(entry=>entry&&songs.some(song=>song.id===entry.songId)&&Object.hasOwn(names,entry.lang)):[];}catch{return [];}}
function playlistEntry(song,lang=versionOf(song).lang){const version=song.versions[lang];return version&&audioSourceAvailable(version)?{songId:song.id,lang}:null;}
function playlistSong(entry){return songs.find(song=>song.id===entry?.songId);}
function savePlaylist(){try{localStorage.setItem(PLAYLIST_KEY,JSON.stringify(playlist));}catch{}renderPlaylist();}
function playlistLabel(){return repeat==='one'?'Répétition : une':repeat==='all'?'Répétition : toutes':'Répétition : non';}
function renderPlaylist(){
  const current=playlistSong(playlist[playlistIndex]);
  $('playlist-count').textContent=playlist.length;$('queue-count').textContent=playlist.length;$('show-playlist').disabled=!playlist.length;
  $('playlist-player').hidden=!playlist.length;
  $('playlist-shuffle').setAttribute('aria-pressed',String(shuffle));$('playlist-repeat').dataset.mode=repeat;$('playlist-repeat').textContent=playlistLabel();
  if(current){$('playlist-cover').src=current.image;$('playlist-cover').alt=current.title;$('playlist-title').textContent=current.title;}
  $('queue-items').innerHTML=playlist.map((entry,index)=>{const song=playlistSong(entry);return `<li class="${index===playlistIndex?'current':''}"><button data-queue-index="${index}"><span>${index===playlistIndex?'▶':'♫'}</span>${esc(song?.title||entry.songId)} <small>${esc(names[entry.lang]||entry.lang)}</small></button><button data-queue-remove="${index}" aria-label="Retirer ${esc(song?.title||entry.songId)}">×</button></li>`;}).join('');
  window.translatePage?.();
}
function replacePlaylist(entries,start=0){playlist=entries.filter(Boolean);playlistIndex=playlist.length?Math.max(0,Math.min(start,playlist.length-1)):-1;savePlaylist();if(playlist.length)loadPlaylistTrack(playlistIndex);}
function addSongToPlaylist(song){const entry=playlistEntry(song);if(!entry)return;const existing=playlist.findIndex(item=>item.songId===entry.songId&&item.lang===entry.lang);if(existing<0){playlist.push(entry);if(playlistIndex<0)playlistIndex=playlist.length-1;savePlaylist();$('playlist-status').textContent='Ajoutée à votre liste.';}else{$('playlist-status').textContent='Cette chanson est déjà dans votre liste.';}}
function startPagePlaylist(song){const entry=playlistEntry(song);if(!entry)return;if(playlist.length){let selected=playlist.findIndex(item=>item.songId===entry.songId&&item.lang===entry.lang);if(selected<0){playlist.push(entry);selected=playlist.length-1;savePlaylist();}loadPlaylistTrack(selected);return;}const entries=pageSongs.map(item=>playlistEntry(item)).filter(Boolean);const selected=entries.findIndex(item=>item.songId===song.id&&item.lang===entry.lang);replacePlaylist(entries,selected<0?0:selected);}
async function loadPlaylistTrack(index,autoplay=true){
  if(index<0||index>=playlist.length)return;playlistIndex=index;const entry=playlist[index];const song=playlistSong(entry);const version=song?.versions[entry.lang];if(!song||!version)return;
  playlistAbort?.abort();playlistAbort=new AbortController();playlistAudio.pause();playlistAudio.removeAttribute('src');playlistAudio.load();$('playlist-status').textContent='Préparation de la piste…';renderPlaylist();
  try{const source=safeUrl(version.audio)||await signedAudioUrl(version.audioId,entry.lang,version.albumId,playlistAbort.signal);if(playlistAbort.signal.aborted)return;playlistAudio.src=source;playlistAudio.load();$('playlist-status').textContent='';if(autoplay){try{await playlistAudio.play();}catch(error){if(error.name==='NotAllowedError')$('playlist-status').textContent='La piste est prête. Appuyez sur Lecture.';else throw error;}}}catch(error){if(error.name!=='AbortError')$('playlist-status').textContent='Impossible de préparer cette piste.';}
}
function nextPlaylist(manual=false){if(!playlist.length)return;if(shuffle&&playlist.length>1){let next=playlistIndex;while(next===playlistIndex)next=Math.floor(Math.random()*playlist.length);loadPlaylistTrack(next);return;}if(playlistIndex<playlist.length-1){loadPlaylistTrack(playlistIndex+1);return;}if(repeat==='all'||manual)loadPlaylistTrack(0);}
function previousPlaylist(){if(!playlist.length)return;if(playlistAudio.currentTime>4){playlistAudio.currentTime=0;return;}loadPlaylistTrack(playlistIndex>0?playlistIndex-1:playlist.length-1);}
$('play-visible').addEventListener('click',()=>{const entries=pageSongs.map(song=>playlistEntry(song)).filter(Boolean);if(entries.length)replacePlaylist(entries);});
$('show-playlist').addEventListener('click',()=>{if(!playlist.length)return;$('playlist-player').hidden=false;const open=$('playlist-queue').hidden;$('playlist-queue').hidden=!open;$('queue-toggle').setAttribute('aria-expanded',String(open));});
$('queue-toggle').addEventListener('click',()=>{const open=$('playlist-queue').hidden;$('playlist-queue').hidden=!open;$('queue-toggle').setAttribute('aria-expanded',String(open));});
$('playlist-toggle').addEventListener('click',()=>{if(!playlist.length)return;if(!playlistAudio.src){loadPlaylistTrack(Math.max(0,playlistIndex));return;}playlistAudio.paused?playlistAudio.play():playlistAudio.pause();});
$('playlist-next').addEventListener('click',()=>nextPlaylist(true));
$('playlist-previous').addEventListener('click',previousPlaylist);
$('playlist-shuffle').addEventListener('click',()=>{shuffle=!shuffle;savePreference(SHUFFLE_KEY,String(shuffle));renderPlaylist();});
$('playlist-repeat').addEventListener('click',()=>{repeat=repeat==='off'?'all':repeat==='all'?'one':'off';savePreference(REPEAT_KEY,repeat);renderPlaylist();});
$('clear-playlist').addEventListener('click',()=>{playlistAbort?.abort();playlistAudio.pause();playlistAudio.removeAttribute('src');playlist=[];playlistIndex=-1;savePlaylist();});
$('queue-items').addEventListener('click',event=>{const play=event.target.closest('[data-queue-index]');if(play){loadPlaylistTrack(Number(play.dataset.queueIndex));return;}const remove=event.target.closest('[data-queue-remove]');if(!remove)return;const index=Number(remove.dataset.queueRemove);playlist.splice(index,1);if(!playlist.length){playlistAudio.pause();playlistAudio.removeAttribute('src');playlistIndex=-1;}else if(index===playlistIndex){playlistIndex=Math.min(index,playlist.length-1);loadPlaylistTrack(playlistIndex);}else if(index<playlistIndex)playlistIndex--;savePlaylist();});
playlistAudio.addEventListener('play',()=>{$('playlist-toggle').textContent='❚❚';$('playlist-toggle').setAttribute('aria-label','Pause');});
playlistAudio.addEventListener('pause',()=>{$('playlist-toggle').textContent='▶';$('playlist-toggle').setAttribute('aria-label','Lecture');});
playlistAudio.addEventListener('ended',()=>{if(repeat==='one'){playlistAudio.currentTime=0;playlistAudio.play();}else nextPlaylist(false);});
playlistAudio.addEventListener('error',()=>{$('playlist-status').textContent='La piste ne peut pas être lue.';});
renderPlaylist();

async function openPlayer(song,mode='play'){
  const karaoke=mode!=='play';
  $('player-dialog').classList.toggle('singing-mode',mode.endsWith('mp3'));
  playerAbort?.abort();playerAbort=new AbortController();
  const {lang,version:v}=versionOf(song);const pro=mode.startsWith('karaoke-pro-');const video=mode.endsWith('mp3')?null:youtubeId(karaoke?(pro?v.karaokeProYoutube:v.karaokeYoutube):v.youtube);const audio=mode.endsWith('youtube')?null:safeUrl(karaoke?(pro?v.karaokeProAudio:v.karaokeAudio):v.audio);const audioId=mode.endsWith('youtube')?null:(karaoke?(pro?v.karaokeProAudioId:v.karaokeAudioId):v.audioId);const timing=karaoke?((pro?v.karaokeProTiming:v.karaokeTiming)||v.timing):v.timing;const r2Ready=r2SourceAvailable(v,audioId);
  $('player-title').textContent=song.title;$('player-mode').textContent=karaoke?(pro?'KARAOKÉ PRO · SANS VOIX':'KARAOKÉ NORMAL · VOIX BASSE'):'À L’ÉCOUTE';$('player-extra').replaceChildren();
  if(audio||r2Ready){$('player-content').innerHTML=`<img class="audio-art" src="${esc(song.image)}" alt="${esc(song.title)}"><audio controls controlslist="nodownload" preload="metadata"></audio><p class="player-footer" id="audio-status" role="status">Préparation de la piste…</p>`;const player=$('player-content').querySelector('audio');const signal=playerAbort.signal;player.addEventListener('error',()=>{$('audio-status').textContent='La piste ne peut pas être lue. Vérifiez son lien ou réessayez plus tard.';},{signal});if(timing)loadTiming(player,timing,signal);else if(v.lyrics)$('player-extra').innerHTML=`<div class="timed-lyrics lyrics">${esc(v.lyrics)}</div>`;$('player-dialog').showModal();window.translatePage?.();try{const source=audio||await signedAudioUrl(audioId,lang,v.albumId,signal);if(signal.aborted)return;player.src=source;player.load();$('audio-status').textContent='';try{await player.play();}catch(error){if(error.name==='NotAllowedError')$('audio-status').textContent='La piste est prête. Appuyez sur Lecture.';else throw error;}}catch(error){if(signal.aborted)return;$('audio-status').textContent='Impossible de préparer la piste. Réessayez dans un instant.';}return;
  }else if(video){$('player-content').innerHTML=`<iframe class="video-frame" src="https://www.youtube-nocookie.com/embed/${video}?autoplay=1&rel=0" title="${esc(song.title)}${karaoke?' — Karaoké':''}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe><p class="player-footer">Si la lecture intégrée est indisponible, <a href="https://www.youtube.com/watch?v=${video}" target="_blank" rel="noopener noreferrer">ouvrir sur YouTube ↗</a></p>`;
  }else{return;}
  $('player-dialog').showModal();window.translatePage?.();
}
async function loadTiming(player,url,signal){
  try{const source=safeUrl(url);if(!source)throw Error();const response=await fetch(source,{signal});if(!response.ok)throw Error();const json=await response.json();if(!Array.isArray(json.lines))throw Error();
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

function karaokeChoices(s,v){return [['normal','Normal (voix basse)',v.karaokeYoutube,v.karaokeAudio,v.karaokeAudioId,v.karaokeTiming||v.timing],['pro','Pro (sans voix)',v.karaokeProYoutube,v.karaokeProAudio,v.karaokeProAudioId,v.karaokeProTiming||v.timing]].map(([kind,label,video,audio,audioId,timing])=>{const readyVideo=!!youtubeId(video),readyAudio=!!((safeUrl(audio)||r2SourceAvailable(v,audioId))&&safeUrl(timing));const prefix=kind==='pro'?'karaoke-pro':'karaoke';return '<div class="karaoke-kind"><button class="action" data-action="karaoke-'+kind+'" aria-expanded="false" aria-controls="karaoke-'+kind+'-'+s.id+'" '+(readyVideo||readyAudio?'':'disabled')+'>'+label+'</button>'+(!readyVideo&&!readyAudio?'<small>À venir</small>':'')+'<div class="karaoke-options" id="karaoke-'+kind+'-'+s.id+'" hidden>'+(readyVideo?'<button class="action" data-action="'+prefix+'-youtube">▶ Sur YouTube</button>':'')+(readyAudio?'<button class="action" data-action="'+prefix+'-mp3">Lecteur intégré</button>':'')+'</div></div>';}).join('');}
// Discourage ordinary saving from media controls without blocking text selection.
document.addEventListener('contextmenu',event=>{if(event.target.closest('audio,video,.cover img,.audio-art'))event.preventDefault();});
document.addEventListener('dragstart',event=>{if(event.target.closest('.cover img,.audio-art'))event.preventDefault();});
