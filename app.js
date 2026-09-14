'use strict';
const songs=window.JEHOVAH_CATALOGUE;
const $=id=>document.getElementById(id);
const AUDIO_WORKER_URL='https://one-faith-musics-audio.jnc-studiopro.workers.dev/audio-url';
const names={fr:'Français',en:'English',es:'Español'};
const state={theme:'Toutes',language:'all',size:6,page:1};
const dateLabel=date=>date?new Intl.DateTimeFormat(document.documentElement.lang,{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(date+'T12:00:00Z')):'';
const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Toronto',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const released=v=>v&&v.releaseDate&&v.releaseDate<=today();
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeUrl=url=>{if(!url)return null;try{const u=new URL(url,location.href);return ['https:','http:'].includes(u.protocol)?u.href:null;}catch{return null;}};
const audioSourceAvailable=version=>!!(safeUrl(version.audio)||version.audioId);
async function signedAudioUrl(trackId,signal){
  if(typeof trackId!=='string'||!trackId.trim())throw Error('Identifiant audio manquant.');
  const response=await fetch(`${AUDIO_WORKER_URL}?id=${encodeURIComponent(trackId)}`,{signal});
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
  $('song-grid').innerHTML=filtered.slice((state.page-1)*size,state.page*size).map(card).join('');
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
  $('latest-link').onclick=()=>{state.theme='Toutes';state.language=latest.lang;$('language').value=latest.lang;state.page=1;render();requestAnimationFrame(()=>document.querySelector(`[data-song="${latest.song.id}"]`)?.scrollIntoView({block:'center'}));};
}
function card(s){const {lang,version:v}=versionOf(s);const available=!!(youtubeId(v.youtube)||audioSourceAvailable(v));return `<article class="song-card" data-song="${esc(s.id)}"><button class="cover ${s.portrait?'portrait':''}" data-action="play" aria-label="Écouter ${esc(s.title)}" ${available?'':'disabled'}><img src="${esc(s.image)}" alt="${esc(s.title)}" width="1672" height="941" loading="lazy">${available?'<span class="play-icon" aria-hidden="true">▶</span>':''}<span class="cover-status">${available?'Écouter la chanson':'À découvrir bientôt'}</span></button><div class="song-body"><div class="song-meta"><time datetime="${esc(v.releaseDate)}">${esc(dateLabel(v.releaseDate))}</time><span lang="${lang}">${names[lang]||esc(lang)}</span></div><h3>${esc(s.title)}</h3><p class="description">${esc(s.description)}</p><div class="song-tags">${s.tags.map(t=>`<button class="song-tag" data-theme="${esc(t)}"># ${esc(t)}</button>`).join('')}</div><div class="actions"><button class="action" data-action="karaoke" aria-expanded="false" aria-controls="karaoke-${s.id}" ${youtubeId(v.karaokeYoutube)||youtubeId(v.karaokeProYoutube)||(safeUrl(v.karaokeAudio)&&safeUrl(v.karaokeTiming||v.timing))||(safeUrl(v.karaokeProAudio)&&safeUrl(v.karaokeProTiming||v.timing))?'':'disabled title="Version karaoké à venir"'}>♫ Karaoké</button><button class="action" data-action="lyrics" aria-expanded="false" aria-controls="lyrics-${s.id}">≡ Paroles</button><button class="action" data-action="downloads" aria-expanded="false" aria-controls="downloads-${s.id}">↓ Téléchargements</button></div><div class="panel karaoke-options" id="karaoke-${s.id}" hidden>${karaokeChoices(s,v)}</div><div class="panel" id="lyrics-${s.id}" hidden>${v.lyrics?`<div class="lyrics" lang="${lang}">${esc(v.lyrics)}</div>`:'<p>Les paroles écrites seront ajoutées prochainement.</p>'}</div><div class="panel downloads" id="downloads-${s.id}" hidden>${[['mp4','Vidéo MP4'],['mp3','Audio MP3'],['score','Partition PDF']].map(([key,label])=>{const url=safeUrl(v.downloads?.[key]);return `<div class="download-row"><span>${label}</span>${url?`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">Télécharger ↗</a>`:'<small>À venir</small>'}</div>`;}).join('')}</div></div></article>`;}
document.addEventListener('click',event=>{
  const theme=event.target.closest('[data-theme]');if(theme){state.theme=theme.dataset.theme;state.page=1;render();$('clear-theme').focus({preventScroll:true});$('catalogue').scrollIntoView();return;}
  const page=event.target.closest('[data-page]');if(page){state.page=Number(page.dataset.page);render();$('catalogue').scrollIntoView();return;}
  const button=event.target.closest('[data-action]');if(!button)return;
  const song=songs.find(s=>s.id===button.closest('[data-song]').dataset.song);const action=button.dataset.action;
  if(['play','karaoke-youtube','karaoke-mp3','karaoke-pro-youtube','karaoke-pro-mp3'].includes(action)){openPlayer(song,action);return;}
  const panel=$(`${action}-${song.id}`);panel.hidden=!panel.hidden;button.setAttribute('aria-expanded',String(!panel.hidden));window.translatePage?.();
});
$('language').addEventListener('change',e=>{state.language=e.target.value;state.page=1;render();});
$('page-size').addEventListener('change',e=>{state.size=e.target.value==='all'?'all':Number(e.target.value);state.page=1;render();});
$('columns').addEventListener('change',e=>$('song-grid').classList.toggle('three',e.target.value==='3'));
$('clear-theme').addEventListener('click',()=>{state.theme='Toutes';state.page=1;render();$('collection-title').focus({preventScroll:true});});
$('reset-filters').addEventListener('click',()=>{state.language='all';state.theme='Toutes';state.page=1;$('language').value='all';render();});
async function openPlayer(song,mode='play'){
  const karaoke=mode!=='play';
  $('player-dialog').classList.toggle('singing-mode',mode.endsWith('mp3'));
  playerAbort?.abort();playerAbort=new AbortController();
  const {version:v}=versionOf(song);const pro=mode.startsWith('karaoke-pro-');const video=mode.endsWith('mp3')?null:youtubeId(karaoke?(pro?v.karaokeProYoutube:v.karaokeYoutube):v.youtube);const audio=mode.endsWith('youtube')?null:safeUrl(karaoke?(pro?v.karaokeProAudio:v.karaokeAudio):v.audio);const audioId=mode.endsWith('youtube')?null:(karaoke?(pro?v.karaokeProAudioId:v.karaokeAudioId):v.audioId);const timing=karaoke?((pro?v.karaokeProTiming:v.karaokeTiming)||v.timing):v.timing;
  $('player-title').textContent=song.title;$('player-mode').textContent=karaoke?(pro?'KARAOKÉ PRO · SANS VOIX':'KARAOKÉ NORMAL · VOIX BASSE'):'À L’ÉCOUTE';$('player-extra').replaceChildren();
  if(audio||audioId){$('player-content').innerHTML=`<img class="audio-art" src="${esc(song.image)}" alt="${esc(song.title)}"><audio controls controlslist="nodownload" preload="metadata"></audio><p class="player-footer" id="audio-status" role="status">Préparation de la piste…</p>`;const player=$('player-content').querySelector('audio');const signal=playerAbort.signal;player.addEventListener('error',()=>{$('audio-status').textContent='La piste ne peut pas être lue. Vérifiez son lien ou réessayez plus tard.';},{signal});if(timing)loadTiming(player,timing,signal);else if(v.lyrics)$('player-extra').innerHTML=`<div class="timed-lyrics lyrics">${esc(v.lyrics)}</div>`;$('player-dialog').showModal();window.translatePage?.();try{const source=audio||await signedAudioUrl(audioId,signal);if(signal.aborted)return;player.src=source;player.load();$('audio-status').textContent='';try{await player.play();}catch(error){if(error.name==='NotAllowedError')$('audio-status').textContent='La piste est prête. Appuyez sur Lecture.';else throw error;}}catch(error){if(signal.aborted)return;$('audio-status').textContent='Impossible de préparer la piste. Réessayez dans un instant.';}return;
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

function karaokeChoices(s,v){return [['normal','Normal (voix basse)',v.karaokeYoutube,v.karaokeAudio,v.karaokeTiming||v.timing],['pro','Pro (sans voix)',v.karaokeProYoutube,v.karaokeProAudio,v.karaokeProTiming||v.timing]].map(([kind,label,video,audio,timing])=>{const readyVideo=!!youtubeId(video),readyAudio=!!(safeUrl(audio)&&safeUrl(timing));const prefix=kind==='pro'?'karaoke-pro':'karaoke';return '<div class="karaoke-kind"><button class="action" data-action="karaoke-'+kind+'" aria-expanded="false" aria-controls="karaoke-'+kind+'-'+s.id+'" '+(readyVideo||readyAudio?'':'disabled')+'>'+label+'</button>'+(!readyVideo&&!readyAudio?'<small>À venir</small>':'')+'<div class="karaoke-options" id="karaoke-'+kind+'-'+s.id+'" hidden>'+(readyVideo?'<button class="action" data-action="'+prefix+'-youtube">▶ Sur YouTube</button>':'')+(readyAudio?'<button class="action" data-action="'+prefix+'-mp3">Lecteur intégré</button>':'')+'</div></div>';}).join('');}
// Discourage ordinary saving from media controls without blocking text selection.
document.addEventListener('contextmenu',event=>{if(event.target.closest('audio,video,.cover img,.audio-art'))event.preventDefault();});
document.addEventListener('dragstart',event=>{if(event.target.closest('.cover img,.audio-art'))event.preventDefault();});
