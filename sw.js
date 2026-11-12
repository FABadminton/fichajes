// Fichajes FAB · service worker: permite instalar la app y que se abra al instante.
// Las llamadas al servidor (Apps Script) nunca se guardan: los datos siempre son los del momento.
const VERSION = 'fichajes-fab-v4';
const BASE = ['./', './index.html', './config.js', './manifest.webmanifest', './logo.png', './icons/icon-192.png', './icons/icon-512.png'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(VERSION).then((c) => c.addAll(BASE))); self.skipWaiting(); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const u = new URL(e.request.url);
  const tipografia = /fonts\.(googleapis|gstatic)\.com$/.test(u.hostname);
  if (u.origin !== self.location.origin && !tipografia) return; // servidor y librerías: directo a la red
  // Abre con la copia guardada (instantáneo) y la actualiza en segundo plano para la próxima vez.
  e.respondWith(caches.open(VERSION).then((c) => c.match(e.request).then((guardada) => {
    const red = fetch(e.request).then((r) => { if (r.ok || r.type === 'opaque') c.put(e.request, r.clone()); return r; })
      .catch(() => guardada || c.match('./index.html'));
    return guardada || red;
  })));
});
