// Service worker disabled — online-only operation.
// Kept as a stub so browsers that cached the old SW will receive this,
// unregister cleanly, and clear their caches.
const CACHE_NAME = 'disabled';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))))
  );
  self.clients.claim();
});
