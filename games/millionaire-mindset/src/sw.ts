/// <reference lib="webworker" />
// Service worker: precaches the whole site so it opens instantly and works offline.
// The build injects __PRECACHE__ (every file to cache) and __BUILD_ID__ (a hash of
// their contents). A new build gets a new cache; the old one is deleted once the
// new worker takes over, which only happens after the player taps "Refresh".

declare const __PRECACHE__: string[];
declare const __BUILD_ID__: string;

const sw = self as unknown as ServiceWorkerGlobalScope;
const CACHE = `pb-mm-${__BUILD_ID__}`;
const scope = new URL(sw.registration.scope);
const abs = (p: string) => new URL(p, scope).href;

sw.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(__PRECACHE__.map(abs))));
});

sw.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys()) if (key.startsWith("pb-mm-") && key !== CACHE) await caches.delete(key);
      await sw.clients.claim();
    })(),
  );
});

sw.addEventListener('message', (event) => {
  if ((event.data as { type?: string } | null)?.type === 'SKIP_WAITING') void sw.skipWaiting();
});

sw.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== sw.location.origin) return; // never touch the Groq API or other sites
  event.respondWith(req.mode === 'navigate' ? navigation(req, url) : assetFirst(req));
});

async function navigation(req: Request, url: URL): Promise<Response> {
  const cache = await caches.open(CACHE);
  const isApp = url.pathname === scope.pathname || url.pathname === scope.pathname + 'index.html';
  if (isApp) {
    const hit = await cache.match(abs('index.html'));
    if (hit) return hit;
  }
  try {
    return await fetch(req);
  } catch {
    return (await cache.match(abs('offline.html'))) ?? Response.error();
  }
}

async function assetFirst(req: Request): Promise<Response> {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(req, { ignoreSearch: true });
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok && res.type === 'basic') void cache.put(req, res.clone());
  return res;
}
