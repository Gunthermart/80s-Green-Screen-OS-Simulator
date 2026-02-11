const CACHE_NAME = 'agendata-v9.21-bunker-assets';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './icons-192x192.png',
  './icons-512x512.png',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/dexie/dist/dexie.js',
  'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;800&family=Inter:wght@300;400;500;600;700;900&display=swap'
];

// NOTE: On ne met PAS en cache les screenshots pour économiser le stockage inutile.
// Ils ne servent qu'à l'installation.

// 1. INSTALLATION
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[System] Verrouillage des assets graphiques...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 2. ACTIVATION & PURGE
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[System] Purge obsolète:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. INTERCEPTION RESEAU (Network First, Cache Fallback)
self.addEventListener('fetch', (event) => {
  // Stratégie pour les fichiers locaux et CDN critiques
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
