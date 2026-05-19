const CACHE_NAME = 'fc-engineer-v1';
const STATIC_ASSETS = [
  '/',
  '/field-engineer',
  '/manifest.json',
];

const API_CACHE = 'fc-api-v1';
const PHOTO_QUEUE_KEY = 'fc-photo-queue';

// Install: cache static shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME && k !== API_CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: network-first for API, cache-first for static
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (url.pathname.startsWith('/api/')) {
    // Network-first for API — fall back to cache on failure
    event.respondWith(
      fetch(event.request.clone())
        .then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(API_CACHE).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache-first for static assets
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});

// Background sync for photo upload queue
self.addEventListener('sync', (event) => {
  if (event.tag === 'photo-upload') {
    event.waitUntil(processPhotoQueue());
  }
});

async function processPhotoQueue() {
  const cache = await caches.open('fc-photo-queue');
  const keys = await cache.keys();
  for (const request of keys) {
    const response = await cache.match(request);
    if (!response) continue;
    try {
      const blob = await response.blob();
      const uploadRequest = new Request(request.url, { method: 'PUT', body: blob });
      await fetch(uploadRequest);
      await cache.delete(request);
    } catch {
      // Remain in queue for next sync
    }
  }
}

// Message handler for cache-busting and status
self.addEventListener('message', (event) => {
  if (event.data.type === 'SKIP_WAITING') self.skipWaiting();
  if (event.data.type === 'GET_LAST_SYNC') {
    event.ports[0]?.postMessage({ lastSync: Date.now() });
  }
});
