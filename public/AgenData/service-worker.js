const CACHE_NAME = 'agendata-v9-core';
const DYNAMIC_CACHE = 'agendata-v9-dynamic';

// LISTE DES ACTIFS CRITIQUES À PRÉ-CHARGER
// Si un seul de ces fichiers échoue, l'installation échoue.
const ASSETS_TO_CACHE = [
    './',
    './agendata_v4.html',
    './manifest.json',
    // Dépendances CDN (Crucial pour le mode hors ligne)
    'https://cdn.tailwindcss.com',
    'https://unpkg.com/dexie/dist/dexie.js',
    'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Inter:wght@300;400;500;600;700&display=swap'
];

// 1. INSTALLATION : On met en cache le coeur du système
self.addEventListener('install', (event) => {
    // Force le SW à prendre le contrôle immédiatement sans attendre
    self.skipWaiting();
    
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW] Mise en cache du noyau v9.0');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// 2. ACTIVATION : Nettoyage des anciennes versions (v8, etc.)
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME && key !== DYNAMIC_CACHE) {
                        console.log('[SW] Suppression ancien cache:', key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

// 3. INTERCEPTION RÉSEAU (Stratégie Hybride)
self.addEventListener('fetch', (event) => {
    // On ignore les requêtes non-GET et les extensions Chrome
    if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) return;

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            // A. Stratégie Cache-First pour les assets statiques (Fonts, Libs)
            if (cachedResponse) {
                // On retourne le cache, mais on update en background si c'est le HTML
                if (event.request.url.includes('.html')) {
                    const fetchPromise = fetch(event.request).then((networkResponse) => {
                        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse.clone()));
                    });
                }
                return cachedResponse;
            }

            // B. Réseau pour le reste (avec mise en cache dynamique)
            return fetch(event.request).then((networkResponse) => {
                // Vérification de validité
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic' && networkResponse.type !== 'cors') {
                    return networkResponse;
                }

                // On clone la réponse car elle ne peut être consommée qu'une fois
                const responseToCache = networkResponse.clone();

                caches.open(DYNAMIC_CACHE).then((cache) => {
                    cache.put(event.request, responseToCache);
                });

                return networkResponse;
            }).catch(() => {
                // C. Fallback Offline (si tout échoue)
                // Ici on pourrait retourner une page hors ligne générique si nécessaire
                console.log('[SW] Hors ligne et ressource non cachée');
            });
        })
    );
});
