const CACHE = 'noor-academy-shell-v1';
const SHELL = ['./','./index.html','./manifest.webmanifest','./icons/noor-icon.svg','./assets/local-records.js'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;
  if (url.pathname.endsWith('/actions')) return;
  event.respondWith(fetch(req).then(res => {
    if (res.ok && (req.mode === 'navigate' || SHELL.some(p => url.pathname.endsWith(p.replace('./',''))))) {
      const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy));
    }
    return res;
  }).catch(() => caches.match(req).then(hit => hit || caches.match('./index.html'))));
});
