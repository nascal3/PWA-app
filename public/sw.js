self.addEventListener('install', function (event) {
  console.log('[service worker] installing Service worker...', event);
  event.waitUntil(
      caches.open('static')
          .then(function(cache) {
            console.log('[service worker] pre caching app shell');
            cache.add('/src/js/app.js');
          })
  )
});

self.addEventListener('activate', function (event) {
  console.log('[service worker] activating Service worker...', event);
  return self.clients.claim();
});

self.addEventListener('fetch', function (event) {
  event.respondWith(
      caches.match(event.request)
          .then(function (response) {
            if (response) {
              return response;
            } else {
              return fetch(event.request);
            }
          })
  );
});
