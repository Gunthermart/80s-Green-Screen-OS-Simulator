const CACHE_NAME = 'agendata-core-v8.9.12';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './screenshot/screenshot-mobile.jpg',
  './screenshot/screenshot-desktop.jpg',
  './screenshot/icons-192x192.png',
  './screenshot/icons-512x512.png',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/dexie/dist/dexie.js',
  'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Inter:wght@300;400;500;600;700&display=swap'
];

// 1. INSTALLATION : Mise en cache des ressources critiques
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Pré-chargement des actifs système');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 2. ACTIVATION : Nettoyage des vieux caches (Mise à jour version)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[ServiceWorker] Suppression ancien cache', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. INTERCEPTION : Stratégie "Stale-While-Revalidate"
// On sert le cache immédiatement pour la vitesse, tout en mettant à jour le cache en arrière-plan.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // En cas d'absence de réseau et de cache, l'application reste fonctionnelle sur sa logique de base
      });

      return cachedResponse || fetchPromise;
    })
  );
