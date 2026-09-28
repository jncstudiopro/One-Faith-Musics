'use strict';
const VERSION=new URL(self.location.href).searchParams.get('v')||'1';
const CACHE=`one-faith-musics-shell-${VERSION}`;
const SHELL=['./','./index.html','./style.css','./offline-audio.js','./app.js','./i18n.js','./catalogue.js','./conditions.html','./fr/conditions.html','./en/conditions.html','./es/conditions.html','./assets/favicon.svg','./fr/','./en/','./es/'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('one-faith-musics-shell-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{
  const request=event.request;if(request.method!=='GET')return;
  const url=new URL(request.url);if(url.origin!==self.location.origin)return;
  event.respondWith(fetch(request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(request,copy));}return response;}).catch(async()=>await caches.match(request)||await caches.match(new URL('./index.html',self.location.href))));
});
