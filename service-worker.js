const CACHE='chemistry-helper-v1';
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(c=>c.addAll(['./','./index.html','./app.js','./manifest.webmanifest']))));
self.addEventListener('fetch',event=>event.respondWith(caches.match(event.request).then(r=>r||fetch(event.request))));
