const CACHE = "alpha-cohort-v1";
const FILES = [
  "./", "index.html", "login.html", "adlog.html", "admin.html",
  "css/style.css", "css/login.css", "css/admin.css",
  "js/script.js", "js/login.js", "js/admin.js", "js/theme.js",
  "icons/icon-192.png", "icons/icon-512.png"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  const req = e.request;
  // Only handle GET, and never touch the Google Apps Script calls (live data)
  if (req.method !== "GET" || req.url.includes("script.google.com")) return;
  e.respondWith(
    fetch(req)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
        return res;
      })
      .catch(() => caches.match(req))
  );
});
