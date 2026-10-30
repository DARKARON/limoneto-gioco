const CACHE = 'limoneto-gioco-v86';
const CORE = ['./', './index.html', './manifest.webmanifest', './icona-192.png', './icona-512.png', './icona-maskable.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE).catch(() => null)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// pagina sempre dalla rete se c'è campo (così arrivano gli aggiornamenti), altrimenti dalla cache
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const salva = (res) => {
    if (res && res.status === 200 && (res.type === 'basic' || res.type === 'cors')) {
      const copia = res.clone();
      caches.open(CACHE).then((c) => c.put(req, copia));
    }
    return res;
  };
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req, { cache: 'no-store' }).then(salva).catch(() => caches.match(req).then((h) => h || caches.match('./index.html'))));
    return;
  }
  e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then(salva)));
});
