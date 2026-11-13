// QuizMaster service worker.
// Pages: network first, saved copy when offline, branded offline page last.
// Files (styles, scripts, images, fonts): saved copy first, refreshed quietly.
// A new version waits until the player taps "Refresh" (see js/pwa.js).
const CACHE_NAME = "playbase-quizmaster-v1";
const CACHE_PREFIX = "playbase-quizmaster-";

const FILES_TO_CACHE = [
  "./",
  "index.html",
  "offline.html",
  "privacy.html",
  "manifest.json",
  "css/fonts.css",
  "css/tokens.css",
  "css/style.css",
  "js/theme-init.js",
  "js/effects.js",
  "js/pwa.js",
  "js/app.js",
  "js/periods.js",
  "js/questions.js",
  "js/static-page.js",
  "js/firebase-config.js",
  "js/firebase-env.js",
  "assets/fonts/inter-latin-400-normal.woff2",
  "assets/fonts/inter-latin-500-normal.woff2",
  "assets/fonts/inter-latin-600-normal.woff2",
  "assets/fonts/sora-latin-600-normal.woff2",
  "assets/fonts/sora-latin-700-normal.woff2",
  "assets/fonts/sora-latin-800-normal.woff2",
  "assets/images/icons/favicon.svg",
  "assets/images/icons/favicon-32.png",
  "assets/images/icons/apple-touch-icon.png",
  "assets/images/icons/icon-192.png",
  "assets/images/icons/icon-512.png"
];

// Other hosts whose files we also keep: the Firebase scripts.
// (The typefaces are served from this site, so they are not listed here.)
const EXTRA_HOSTS = [
  { host: "www.gstatic.com", prefix: "/firebasejs/" }
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches
      .keys()
      .then(function (names) {
        return Promise.all(
          names.filter(function (name) { return name.indexOf(CACHE_PREFIX) === 0 && name !== CACHE_NAME; })
            .map(function (name) { return caches.delete(name); })
        );
      })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("message", function (event) {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

async function pageRequest(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const saved = await caches.match(request, { ignoreSearch: true });
    return saved || (await caches.match("offline.html"));
  }
}

async function fileRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  const saved = await cache.match(request);
  const refresh = fetch(request)
    .then(function (response) {
      if (response.ok || response.type === "opaque") {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(function () { return null; });
  if (saved) {
    return saved;
  }
  const fresh = await refresh;
  return fresh || new Response("You are offline.", { status: 503, statusText: "Offline" });
}

self.addEventListener("fetch", function (event) {
  const request = event.request;
  if (request.method !== "GET") {
    return;
  }
  const url = new URL(request.url);
  const isOurFile = url.origin === self.location.origin;
  const isExtra = EXTRA_HOSTS.some(function (item) {
    return url.hostname === item.host && url.pathname.startsWith(item.prefix);
  });
  if (!isOurFile && !isExtra) {
    return; // leave all other requests (like the database) alone
  }
  event.respondWith(request.mode === "navigate" ? pageRequest(request) : fileRequest(request));
});
