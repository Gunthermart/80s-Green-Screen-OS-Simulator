const CACHE_NAME = 'agendata-core-v8.9.12';
const ASSETS_TO_CACHE = [
  './',
  './index.html', // Assure-toi que ton fichier principal s'appelle index.html ou ajoute son nom ici
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
  // On ignore les requêtes non-GET et les extensions Chrome
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Mise à jour du cache avec la nouvelle version
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Si hors ligne et pas de cache, on peut renvoyer une page offline ici (optionnel)
      });

      // Retourner le cache s'il existe, sinon attendre le réseau
      return cachedResponse || fetchPromise;
    })
  );
});
