const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/styles.css",
  "/index.js",
  "/manifest.webmanifest",
  "/db.js"
];

  const CACHE_NAME = 'static-cache-v13';
  const DATA_CACHE_NAME = 'data-cache-v8';

  //Install service worker
  self.addEventListener('install', evt => {
      evt.waitUntil(
          caches.open(CACHE_NAME).then(cache =>{
              console.log('Your files were pre-cached successfully');
              return cache.addAll(FILES_TO_CACHE);
          })
      );
      self.skipWaiting();
  });

  // Activate Service Worker
  self.addEventListener('activate', evt => {
      evt.waitUntil(
          caches.keys().then(keyList => {
              return Promise.all(
                  keyList.map( key => {
                      if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                          console.log('Removing old cache data', key);
                          return caches.delete(key);
                      }
                  })
              );
          })
      );
      self.clients.claim();
  });

  // 5. Fetch Files
  self.addEventListener('fetch',  evt =>{
      if (evt.request.url.includes('/api/')) {
          console.log('[Service Worker] Fetch (data)', evt.request.url);

          evt.respondWith(
              caches.open(DATA_CACHE_NAME).then(cache => {
                  return fetch(evt.request)
                      .then(response  => {
                          if (response.status === 200) {
                              cache.put(evt.request.url, response.clone());
                          }
                          return response;
                      })
                      .catch(err => {
                          return cache.match(evt.request);
                      });
              })
          );

          return;
      }

      evt.respondWith(
          caches.open(CACHE_NAME).then( cache => {
              return cache.match(evt.request).then(response => {
                  return response || fetch(evt.request)
              });

          })
      );
  });


//   Trying to fix ServiceWorker's 'fetch': Object that was not a Response was passed to respondWith() error by replacing it with await rather than .then(), according to stackoverflow.


  // self.addEventListener("fetch", function (evt) {
//   if (evt.request.url.includes("/api/")) {
//     evt.respondWith(
//       caches.open(DATA_CACHE_NAME).then(cache => {
//         return fetch(evt.request)
//           .then(response => {
//             if (response.status === 200) {
//               cache.put(evt.request.url, response.clone());
//             }
//             return response;
//           })
//           .catch(err => {
//             // Network request failed, try to get it from the cache.
//             return cache.match(evt.request);
//           });
//       }).catch(err => console.log(err))
//     );
//     return;
//   }
//   evt.respondWith(
//     caches.open(CACHE_NAME).then(cache => {
//       return cache.match(evt.request).then(response => {
//         return response || fetch(evt.request);
//       });
//     })
//   );
// }); 

// https://stackoverflow.com/questions/57905153/serviceworkers-fetch-object-that-was-not-a-response-was-passed-to-respondwit
// evt.respondWith((async () => {
//     const cachedResponse = await caches.match(evt.request);
//     if (cachedResponse) {
//       return cachedResponse;
//     }
  
//     const response = await fetch(evt.request);
  
//     if (!response || response.status !== 200 || response.type !== 'basic') {
//       return response;
//     }
  
//     if (ENABLE_DYNAMIC_CACHING) {
//       const responseToCache = response.clone();
//       const cache = await caches.open(DYNAMIC_CACHE)
//       await cache.put(evt.request, response.clone());
//     }
  
//     return response;
//   })());
  