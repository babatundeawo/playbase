/* Service worker: opens the game instantly and keeps it working without a connection.
   The build fills in VERSION (a fingerprint of every file) and FILES (the list to keep on the device).
   A new version waits in the background until the visitor taps "Refresh" in the update notice. */
'use strict';

const VERSION = '%VERSION%';
const CACHE = 'pb-nm-precache-' + VERSION;
const FILES = JSON.parse('%PRECACHE%');
const scope = self.registration.scope;
const abs = (path) => new URL(path, scope).href;

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(FILES.map(abs))));
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) {
      if (key.startsWith('pb-nm-') && key !== CACHE) await caches.delete(key);
    }
    await self.clients.claim();
  })());
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !url.href.startsWith(scope)) return;
  event.respondWith(respond(request, url));
});

async function respond(request, url) {
  const cache = await caches.open(CACHE);
  if (request.mode === 'navigate') {
    const home = new URL(scope).pathname;
    const isHome = url.pathname === home || url.pathname === home + 'index.html';
    const hit = await cache.match(isHome ? abs('index.html') : request, { ignoreSearch: true });
    if (hit) return hit;
    try {
      return await fetch(request);
    } catch (err) {
      return (await cache.match(abs('offline.html'))) || Response.error();
    }
  }
  const hit = await cache.match(request, { ignoreSearch: true });
  if (hit) return hit;
  try {
    return await fetch(request);
  } catch (err) {
    return Response.error();
  }
}
