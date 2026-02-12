// INCREMENTER CETTE VALEUR POUR FORCER LA PURGE CHEZ TOUS LES UTILISATEURS
const CACHE_NAME = 'agendata-v9.22-social-cache-v4'; 

const URLS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './screenshot/icons-192x192.png',
  './screenshot/icons-512x512.png',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/dexie/dist/dexie.js',
  'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;800&family=Inter:wght@300;400;500;600;700;900&display=swap'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(URLS_TO_CACHE))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Si le nom du cache trouvé ne correspond pas à la version actuelle, on le détruit
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Purge de l ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchRes) => {
        if(!fetchRes || fetchRes.status !== 200 || fetchRes.type !== 'basic') return fetchRes;
        const resClone = fetchRes.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
        return fetchRes;
      });
    })
  );
});
