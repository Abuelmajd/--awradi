const CACHE_NAME = 'awradi-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/vite.svg',
];

// Install event: cache the app shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event: serve from cache, fall back to network, and update cache
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(response => {
        const fetchPromise = fetch(event.request).then(networkResponse => {
          // If we got a valid response, update the cache
          if (networkResponse && networkResponse.ok) {
            // We only cache GET requests
            if (event.request.method === 'GET') {
               cache.put(event.request, networkResponse.clone());
            }
          }
          return networkResponse;
        }).catch(error => {
            console.error('Fetch failed:', error);
            // Optionally, return a fallback offline page if one is cached
        });

        // Return the cached response immediately if it exists,
        // and let the fetch happen in the background (stale-while-revalidate strategy)
        return response || fetchPromise;
      });
    })
  );
});

// Activate event: clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
