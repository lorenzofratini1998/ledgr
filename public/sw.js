const CACHE_NAME = "ledgr-pwa-cache-v2";

const ASSETS_TO_CACHE = [];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Exclude Next.js internal data requests (RSC payloads, HMR, etc.)
  if (
    event.request.mode === "navigate" ||
    event.request.headers.get("RSC") === "1" ||
    event.request.headers.get("Next-Router-Prefetch") === "1" ||
    url.pathname.startsWith("/_next/webpack-hmr")
  ) {
    return; // Bypass Service Worker entirely
  }

  // Use Network-First for everything by default to prevent Next.js hydration mismatches
  // and ensure Supabase Auth middleware always runs.
  event.respondWith(
    fetch(event.request)
      .then((response) => response)
      .catch(async () => {
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) return cachedResponse;
        return new Response('Network error or offline', { status: 503, statusText: 'Service Unavailable' });
      })
  );
});
