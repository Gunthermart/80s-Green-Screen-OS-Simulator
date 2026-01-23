const CACHE_NAME = 'sudoku-pro-v1';

// Liste précise des fichiers à mettre en cache.
// NOTE : J'ai aligné le fichier principal sur 'index.html' pour correspondre au start_url du Manifest.
// Assure-toi que ton fichier HTML s'appelle bien index.html sur le serveur.
const ASSETS_TO_CACHE = [
  '/sudoku/',
  '/sudoku/index.html',
  '/sudoku/manifest.json',
  '/sudoku/screenshots/icon-192x192.png',
  '/sudoku/screenshots/icon-512x512.png',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
];

// Installation : Mise en cache initiale critique
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching critical assets');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  // Force le SW à s'activer immédiatement sans attendre la fermeture des onglets
  self.skipWaiting();
});

// Activation : Nettoyage des vieux caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  // Prend le contrôle des clients immédiatement
  self.clients.claim();
});

// Fetch : Stratégie "Cache First, Network Fallback"
// C'est la stratégie la plus performante pour une PWA, mais tu dois changer CACHE_NAME à chaque mise à jour du code.
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // 1. Cache hit - on retourne la version en cache
      if (response) {
        return response;
      }
      
      // 2. Cache miss - on va chercher sur le réseau
      return fetch(event.request).catch(() => {
        // Optionnel: Si réseau échoue et que c'est une navigation, on pourrait renvoyer index.html
        // if (event.request.mode === 'navigate') return caches.match('/sudoku/index.html');
      });
    })
  );
});
