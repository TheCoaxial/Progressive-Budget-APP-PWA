const FILES_TO_CACHE = [
    '/',
    '/index.html',
    '/styles.css',
    '/index.js',
    '/manifest.json',
    '/icons/icon-192x192.png',
    "/icons/icon-512x512.png"
];

const CACHE_NAME = 'cache-v1';
const DATA_CACHE_NAME = 'runtime';

self.addEventListener('install', function(event)  {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {cache.addAll(FILES_TO_CACHE)})
      );
    self.skipWaiting();
});

self.addEventListener("activate", function (evt) {
  evt.waitUntil(
      caches.keys().then(keyList => {
          return Promise.all(
              keyList.map(key => {
                  if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                      console.log("Removing old cache data", key);
                      return caches.delete(key);
                  }
              })
          );
      })
  );

  self.clients.claim();
});

self.addEventListener("fetch", function(event) {
  if (event.request.url.includes("/api/")) {
      event.respondWith(
      caches.open(DATA_CACHE).then(cache => {
          return fetch(event.request)
          .then(response => {
              if (response.status === 200) {
              cache.put(event.request.url, response.clone());
          }
              return response;
          })
          .catch(err => {
              return cache.match(event.request);
          });
      }).catch(err => console.log(err))
  );
  return;
  }
  event.respondWith(
      caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
  })
  );
});