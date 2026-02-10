// MISE A JOUR CRITIQUE : Incrémentation de la version pour purger l'ancien cache
const CACHE_NAME = 'agendata-core-v8.9.14';

const ASSETS_TO_CACHE = [
  './',
  './index.html', // Assurez-vous que votre fichier HTML s'appelle bien index.html sur le serveur
  './manifest.json',
  './screenshot/icons-192x192.png',
  './screenshot/icons-512x512.png',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/dexie/dist/dexie.js',
  'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Inter:wght@300;400;500;600;700&display=swap'
];

// 1. INSTALLATION : Mise en cache immédiate des actifs vitaux
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Installation du noyau v8.9.14');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  // Force l'activation immédiate sans attendre la fermeture des onglets
  self.skipWaiting();
});

// 2. ACTIVATION : Purge des versions obsolètes (Nettoyage impitoyable)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Destruction obsolète :', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. INTERCEPTION : Stratégie Stale-While-Revalidate
// Priorité vitesse (Cache) -> Puis mise à jour en arrière-plan (Réseau)
self.addEventListener('fetch', (event) => {
  // On ignore les requêtes non-GET et les extensions Chrome
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Si la réponse réseau est valide, on met à jour le cache
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // En cas de coupure réseau, on ne fait rien, le cache a déjà répondu
        // console.log('[SW] Mode Hors-Ligne actif');
      });

      // On sert le cache tout de suite s'il existe, sinon on attend le réseau
      return cachedResponse || fetchPromise;
    })
  );
});
