const CACHE = 'linedist-v5';
const ASSETS = [
  '/',
  '/index.html'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => {
        console.log('Caching assets...');
        return c.addAll(ASSETS);
      })
      .then(() => {
        console.log('Cache complete');
        return self.skipWaiting();
      })
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  e.respondWith(
    caches.open(CACHE).then(cache => {
      return cache.match(e.request, { ignoreSearch: true }).then(cached => {
        if (cached) return cached;

        return fetch(e.request).then(res => {
          if (res.ok && res.type !== 'opaque') {
            cache.put(e.request, res.clone());
          }
          return res;
        }).catch(() => cache.match('/index.html'));
      });
    })
  );
});