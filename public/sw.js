self.addEventListener('install', function (event) {
  console.log('[service worker] installing Service worker...', event);
});

self.addEventListener('activate', function (event) {
  console.log('[service worker] activating Service worker...', event);
  return self.clients.claim();
});

self.addEventListener('fetch', function (event) {
  console.log('[service worker] Fetching stuff...', event);
  event.respondWith(fetch(event.request));
});
