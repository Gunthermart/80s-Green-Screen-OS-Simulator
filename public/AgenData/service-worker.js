const CACHE_NAME = 'agendata-v9.21-social-cache';
const URLS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icons-192x192.png', // Doit correspondre à l'emplacement réel
  './icons-512x512.png', // Doit correspondre à l'emplacement réel
  // Dépendances critiques (CDNs)
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/dexie/dist/dexie.js',
  'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;800&family=Inter:wght@300;400;500;600;700;900&display=swap'
];

// 1. INSTALLATION
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force l'activation immédiate du nouveau SW
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

// 2. ACTIVATION (Nettoyage immédiat des anciens caches)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim(); // Prend le contrôle des clients immédiatement
});

// 3. INTERCEPTION (Cache First, Network Fallback)
self.addEventListener('fetch', (event) => {
  // On ignore les requêtes non-GET ou vers d'autres origines non gérées
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Hit Cache
        if (response) {
          return response;
        }
        // Miss Cache -> Réseau
        return fetch(event.request).then(
          (response) => {
            // Vérification validité réponse
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            // Mise en cache dynamique des nouvelles ressources
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            return response;
          }
        );
      })
  );
});
