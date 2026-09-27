'use strict';
(()=>{
  const DB_NAME='one-faith-musics-audio';
  const DB_VERSION=1;
  const activeUrls=new Set();
  const supported=()=>!!(window.indexedDB&&window.crypto?.subtle);
  const openDb=()=>new Promise((resolve,reject)=>{
    const request=indexedDB.open(DB_NAME,DB_VERSION);
    request.onupgradeneeded=()=>{const db=request.result;if(!db.objectStoreNames.contains('tracks'))db.createObjectStore('tracks',{keyPath:'id'});if(!db.objectStoreNames.contains('keys'))db.createObjectStore('keys');};
    request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);
  });
  const requestValue=request=>new Promise((resolve,reject)=>{request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});
  async function read(storeName,key){const db=await openDb();try{return await requestValue(db.transaction(storeName,'readonly').objectStore(storeName).get(key));}finally{db.close();}}
  async function write(storeName,value,key){const db=await openDb();try{const transaction=db.transaction(storeName,'readwrite');const completed=new Promise((resolve,reject)=>{transaction.oncomplete=resolve;transaction.onerror=()=>reject(transaction.error);transaction.onabort=()=>reject(transaction.error);});const store=transaction.objectStore(storeName);await requestValue(key===undefined?store.put(value):store.put(value,key));await completed;}finally{db.close();}}
  async function encryptionKey(){let key=await read('keys','audio-key');if(key)return key;key=await crypto.subtle.generateKey({name:'AES-GCM',length:256},false,['encrypt','decrypt']);await write('keys',key,'audio-key');return key;}
  async function cachedRecord(id,revision){const record=await read('tracks',id);return record&&record.revision===revision?record:null;}
  async function decryptRecord(record){const key=await encryptionKey();const bytes=await crypto.subtle.decrypt({name:'AES-GCM',iv:new Uint8Array(record.iv)},key,record.data);const url=URL.createObjectURL(new Blob([bytes],{type:record.type||'audio/mpeg'}));activeUrls.add(url);return url;}
  async function has(id,revision){if(!supported())return false;try{return !!(await cachedRecord(id,revision));}catch{return false;}}
  async function source({id,revision,signal,getSource,onStatus=()=>{}}){
    if(!supported())return {url:await getSource(),cached:false,protected:false};
    const existing=await cachedRecord(id,revision);
    if(existing){onStatus('Lecture depuis cet appareil…');return {url:await decryptRecord(existing),cached:true,protected:true};}
    if(!navigator.onLine)throw Error('Cette chanson n’est pas encore disponible hors connexion.');
    onStatus('Première écoute : mise en mémoire protégée…');
    const remote=await getSource();
    try{
      const response=await fetch(remote,{signal,cache:'no-store'});if(!response.ok)throw Error('Audio inaccessible');
      const raw=await response.arrayBuffer();const key=await encryptionKey();const iv=crypto.getRandomValues(new Uint8Array(12));
      const data=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,raw);
      await write('tracks',{id,revision,iv:Array.from(iv),data,type:response.headers.get('content-type')||'audio/mpeg',savedAt:Date.now()});
      navigator.storage?.persist?.().catch(()=>{});
      const url=URL.createObjectURL(new Blob([raw],{type:response.headers.get('content-type')||'audio/mpeg'}));activeUrls.add(url);
      return {url,cached:false,protected:true};
    }catch(error){if(error.name==='AbortError')throw error;onStatus('Lecture en ligne; la mise en mémoire hors connexion est indisponible.');return {url:remote,cached:false,protected:false};}
  }
  function release(url){if(typeof url==='string'&&url.startsWith('blob:')){URL.revokeObjectURL(url);activeUrls.delete(url);}}
  addEventListener('pagehide',()=>{for(const url of activeUrls)URL.revokeObjectURL(url);activeUrls.clear();});
  window.OFMAudioStore={has,source,release};
})();
