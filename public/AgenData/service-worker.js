const CACHE_NAME = 'agendata-v9.1-core';
const DYNAMIC_CACHE = 'agendata-v9.1-dynamic';

const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './manifest.json',
    './screenshot/icons-192x192.png',
    './screenshot/icons-512x512.png',
    'https://cdn.tailwindcss.com',
    'https://unpkg.com/dexie/dist/dexie.js',
    'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Inter:wght@300;400;500;600;700&display=swap'
];

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW] Mise en cache du noyau v9.1');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME && key !== DYNAMIC_CACHE) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) return;

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                // Update background pour index.html
                if (event.request.url.includes('index.html')) {
                    fetch(event.request).then((networkResponse) => {
                         caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse.clone()));
                    });
                }
                return cachedResponse;
            }
            return fetch(event.request).then((networkResponse) => {
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic' && networkResponse.type !== 'cors') {
                    return networkResponse;
                }
                const responseToCache = networkResponse.clone();
                caches.open(DYNAMIC_CACHE).then((cache) => {
                    cache.put(event.request, responseToCache);
                });
                return networkResponse;
            }).catch(() => console.log('[SW] Offline fallback needed'));
        })
    );
});
