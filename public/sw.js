var CACHE_STATIC_NAME = 'static-v15';
var CACHE_DYNAMIC_NAME = 'dynamic-v7';
var STATIC_FILES = [
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
];

// TRIM CACHED FILES AND ASSESTS
// function trimCache(cacheName, maxItems) {
//   caches.open(cacheName)
//       .then(function (cache) {
//         return cache.keys()
//             .then(function (keys) {
//               if (keys.length > maxItems) {
//                 cache.delete(keys[0])
//                     .then(trimCache(cacheName, maxItems));
//               }
//             });
//       })
//
// }

self.addEventListener('install', function (event) {
  console.log('[service worker] installing Service worker...', event);
  event.waitUntil(
      caches.open(CACHE_STATIC_NAME)
          .then(function(cache) {
            console.log('[service worker] pre caching app shell');
            cache.addAll(STATIC_FILES);
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

function isInArray (string, array) {
  for (var i = 0; i < array.length; i++) {
    if (array[i] === string) {
      return true;
    }
  }
  return false;
}

// FETCH FROM CACHE THEN FROM NETWORK
self.addEventListener('fetch', function (event) {
  var url = 'https://httpbin.org/get';

  if (event.request.url.indexOf(url) > 1) {
    event.respondWith(
        caches.open(CACHE_DYNAMIC_NAME)
            .then(function (cache) {
              return fetch(event.request)
                  .then(function (res) {
                    // CLEAN/TRIM CACHE
                    // trimCache(CACHE_DYNAMIC_NAME, 3);
                    cache.put(event.request, res.clone());
                    return res;
                  });
            })
    );
  } else if (isInArray(event.request.url, STATIC_FILES)) {
    event.respondWith(
      caches.match(event.request)
    );
  } else {
    event.respondWith(
      caches.match(event.request)
          .then(function (response) {
            if (response) {
              return response;
            } else {
              return fetch(event.request)
                  .then(function (res) {
                    return caches.open(CACHE_DYNAMIC_NAME)
                        .then(function (cache) {
                          cache.put(event.request.url, res.clone());
                          return res;
                        })
                  })
                  .catch(function (err) {
                    return caches.open(CACHE_STATIC_NAME)
                        .then(function (cache) {
                          if (event.request.headers.get('accept').includes('text/html')) {
                            return cache.match('/offline.html');
                          }
                        });
                  });
            }
          })
    );
  }

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
