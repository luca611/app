const cacheName = 'pwaname'; // PWA id here
const appFiles = [
  'index.html',
  'app.js',
  'favicon.png',
  'manifest.json',
  'pwaicon.png',
  'style.css',
  'sw.js',
  './resources/icons/inform.svg'
  // add all PWA files here (except pwaversion.txt)
];

// Caches all the PWA shell files (appFiles array) when the app is launched
self.addEventListener('install', (e) => {
  console.log('[Service Worker] Install');
  e.waitUntil(
    (async () => {
      const cache = await caches.open(cacheName);
      try {
        await cache.addAll(appFiles);
      } catch (error) {
        console.error('Failed to cache app files:', error);
      }
    })()
  );
});

// Called when the app fetches a resource like an image, caches it automatically except for pwaversion.txt, which is always fetched
self.addEventListener('fetch', (e) => {
  e.respondWith(
    (async () => {
      if (e.request.url.includes('pwaversion.txt')) {
        console.log(`[Service Worker] Fetching version info: ${e.request.url}`);
        return fetch(e.request);
      } else {
        const cachedResponse = await caches.match(e.request);
        console.log(`[Service Worker] Fetching resource: ${e.request.url}`);
        if (cachedResponse) {
          return cachedResponse;
        }
        try {
          const response = await fetch(e.request);
          const cache = await caches.open(cacheName);
          console.log(`[Service Worker] Caching new resource: ${e.request.url}`);
          cache.put(e.request, response.clone());
          return response;
        } catch (error) {
          console.error('Fetch failed:', error);
          throw error;
        }
      }
    })()
  );
});

// Called when the service worker is activated
self.addEventListener('activate', (e) => {
  console.log('[Service Worker] Activated');
  e.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((name) => {
          if (name !== cacheName) {
            console.log(`[Service Worker] Deleting old cache: ${name}`);
            return caches.delete(name);
          }
        })
      );
    })()
  );
});
