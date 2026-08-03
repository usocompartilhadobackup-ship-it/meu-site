const CACHE_NAME = 'gymflow-v2';
const APP_SHELL = [
  './index.html',
  './manifest.json',
  './css/styles.css',
  './css/login.css',
  './js/firebase-config.js',
  './js/data.js',
  './js/background.js',
  './js/app.js',
  './js/home.js',
  './js/planner.js',
  './js/exercises.js',
  './js/workout.js',
  './js/progress.js',
  './js/settings.js',
  './js/auth.js',
  './img/bg-eclipse.webp',
  './img/watercolor-login.svg',
  './img/watercolor-blob-a.svg',
  './img/watercolor-blob-b.svg',
  './img/watercolor-blob-c.svg',
  './img/icons/icon-192.png',
  './img/icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Cache-first for same-origin GET requests (app shell, exercise gifs/svgs).
// Firebase/API calls and cross-origin requests go straight to the network.
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  if (new URL(request.url).origin !== self.location.origin) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      }).catch(() => cached);
    })
  );
});
