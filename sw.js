const CACHE_NAME = 'gymflow-v5';
const FIREBASE_VERSION = '9.23.0';
const APP_SHELL = [
  './index.html',
  './manifest.json',
  './css/styles.css',
  './css/login.css',
  './css/cosmos.css',
  './js/firebase-config.js',
  './js/utils.js',
  './js/data.js',
  './js/storage.js',
  './js/app.js',
  './js/home.js',
  './js/planner.js',
  './js/exercises.js',
  './js/workout.js',
  './js/progress.js',
  './js/settings.js',
  './js/auth.js',
  './js/background.js',
  './js/black-hole.js',
  './img/bg-eclipse.webp',
  './img/space-helix.webp',
  './img/space-pillars.webp',
  './img/space-sombrero.webp',
  './img/space-spiral.webp',
  './img/icons/icon-192.png',
  './img/icons/icon-512.png',
  ...['app', 'firestore', 'auth'].map(m =>
    `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-${m}-compat.js`)
];
const CACHEABLE_ORIGINS = [self.location.origin, 'https://www.gstatic.com', 'https://fonts.googleapis.com', 'https://fonts.gstatic.com'];

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

async function fetchAndCache(request){
  const response = await fetch(request);
  if(response.ok){
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
  }
  return response;
}

// Páginas: rede primeiro, cache sem internet. Demais arquivos: cache primeiro.
// Chamadas ao Firestore e ao Auth não passam por aqui e nunca são guardadas.
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if(request.method !== 'GET') return;
  if(!CACHEABLE_ORIGINS.includes(new URL(request.url).origin)) return;

  if(request.mode === 'navigate'){
    event.respondWith(fetchAndCache(request).catch(() => caches.match('./index.html')));
    return;
  }
  event.respondWith(caches.match(request).then((cached) => cached || fetchAndCache(request)));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) =>
      windows.length ? windows[0].focus() : self.clients.openWindow('./index.html'))
  );
});
