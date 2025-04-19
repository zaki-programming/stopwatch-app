self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("timer-cache-v1").then((cache) => {
      return cache.addAll([
        "index.html",
        "style.css",
        "script.js",
        "manifest.json",
        "icon-192.png",
        "icon-512.png",
        "service-worker.js"
      ]);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});