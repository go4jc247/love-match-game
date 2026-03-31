const CACHE_NAME = 'love-match-v1';

const ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/src/app.js',
  '/src/game-engine.js',
  '/src/renderer.js',
  '/src/levels.js',
  '/src/powerups.js',
  '/src/bible.js',
  '/src/spouse.js',
  '/src/quiz.js',
  '/src/themes.js',
  '/src/ui.js',
  '/src/audio.js',
  '/src/storage.js',
  '/src/particles.js'
];

// Install — pre-cache all game assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate — remove old caches when a new version deploys
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch — cache-first for static assets, network-first for data requests
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Network-first for API / data requests
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/data/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache-first for everything else (game assets)
  event.respondWith(
    caches.match(event.request)
      .then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          // Only cache same-origin, successful responses
          if (response.ok && url.origin === self.location.origin) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        });
      })
  );
});
