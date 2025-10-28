const CACHE = 'milan-crochet-v1';
const ASSETS = [
  '/milan-crochet/',
  '/milan-crochet/index.html',
  '/milan-crochet/css/style.css',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k => k !== CACHE && caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  if (request.method !== 'GET') return;
  e.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((resp) => {
      const copy = resp.clone();
      caches.open(CACHE).then((cache) => cache.put(request, copy));
      return resp;
    }).catch(() => cached))
  );
});