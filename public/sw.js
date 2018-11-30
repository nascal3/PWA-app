var CACHE_STATIC_NAME = 'static-v13';
var CACHE_DYNAMIC_NAME = 'dynamic-v5';

self.addEventListener('install', function (event) {
  console.log('[service worker] installing Service worker...', event);
  event.waitUntil(
      caches.open(CACHE_STATIC_NAME)
          .then(function(cache) {
            console.log('[service worker] pre caching app shell');
            cache.addAll([
              '/',
              '/index.html',
              '/offline.html',
              '/src/js/app.js',
              '/src/js/feed.js',
               '/src/js/material.min.js',
              '/src/css/app.css',
              '/src/css/feed.css',
               '/src/images/main-image.jpg',
               'https://fonts.googleapis.com/css?family=Roboto:400,700',
               'https://fonts.googleapis.com/icon?family=Material+Icons',
               'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
            ]);
          })
  )
});

self.addEventListener('activate', function (event) {
  console.log('[service worker] activating Service worker...', event);
  event.waitUntil(
     caches.keys()
         .then(function (keyList) {
           return Promise.all(keyList.map(function (key) {
             if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
               console.log('[Service worker] remove old cache', key);
               return caches.delete(key);
             }
           }))
         })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', function (event) {
  event.respondWith(
      caches.open(CACHE_DYNAMIC_NAME)
          .then(function (cache) {
            return fetch(event.request)
                .then(function (res) {
                  cache.put(event.request, res.clone());
                  return res;
                });
          })
  );
});

// DYNAMIC CACHING
// self.addEventListener('fetch', function (event) {
//   event.respondWith(
//       caches.match(event.request)
//           .then(function (response) {
//             if (response) {
//               return response;
//             } else {
//               return fetch(event.request)
//                   .then(function (res) {
//                     return caches.open(CACHE_DYNAMIC_NAME)
//                         .then(function (cache) {
//                           cache.put(event.request.url, res.clone());
//                           return res;
//                         })
//                   })
//                   .catch(function (err) {
//                     return caches.open(CACHE_STATIC_NAME)
//                         .then(function (cache) {
//                           return cache.match('/offline.html');
//                         });
//                   });
//             }
//           })
//   );
// });

// CACHE ONLY
// self.addEventListener('fetch', function (event) {
//   event.respondWith(
//       caches.match(event.request)
//   );
// });

// FETCH FROM NETWORK THEN FROM CACHE IF RESOURCE MISSING
// self.addEventListener('fetch', function (event) {
//   event.respondWith(
//       fetch(event.request)
//           .then(function(res) {
//             return caches.open(CACHE_DYNAMIC_NAME)
//               .then(function (cache) {
//                 cache.put(event.request.url, res.clone());
//                 return res;
//               })
//           })
//           .catch(function (err) {
//             return caches.match(event.request);
//           })
//   );
// });

// NETWORK ONLY
// self.addEventListener('fetch', function (event) {
//   event.respondWith(
//       fetch(event.request)
//   );
// });
