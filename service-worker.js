const CACHE_NAME = "kob-keramika-cache-v1";

const FILES_TO_CACHE = [
  "/kob-keramika-web./",
  "/kob-keramika-web./index.html",
  "/kob-keramika-web./manifest.webmanifest",
  "/kob-keramika-web./logo.png"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(FILES_TO_CACHE)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.map(k => k !== CACHE_NAME && caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(cached =>
      cached || fetch(event.request).catch(() =>
        caches.match("/kob-keramika-web./index.html")
      )
    )
  );
});