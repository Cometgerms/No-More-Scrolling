const assetUrl = (path) => new URL(path, self.registration.scope).href;
self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    try {
      // A partially published deployment must never replace a working app.
      for (const [path, integrity] of ASSETS) {
        const url = assetUrl(path);
        const response = await fetch(new Request(url, { cache: 'reload', integrity }));
        if (!response.ok) throw new Error(`Missing asset: ${path}`);
        await cache.put(url, response);
      }
    } catch (error) {
      await caches.delete(CACHE);
      throw error;
    }
  })());
});
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    // Keep two previous builds for tabs still executing their old bundles.
    const previous = (await caches.keys()).filter((key) => key.startsWith('nms-') && key !== CACHE);
    await Promise.all(previous.slice(0, -2).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') event.waitUntil(self.skipWaiting());
});
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const scope = new URL(self.registration.scope);
  if (event.request.method !== 'GET' || url.origin !== scope.origin || !url.pathname.startsWith(scope.pathname)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    if (event.request.mode === 'navigate') return (await cache.match(assetUrl('./index.html'))) || fetch(event.request);
    const current = await cache.match(event.request);
    if (current) return current;
    if (url.pathname.startsWith(`${scope.pathname}assets/`)) {
      const previous = (await caches.keys()).filter((key) => key.startsWith('nms-') && key !== CACHE).reverse();
      for (const key of previous) {
        const response = await (await caches.open(key)).match(event.request);
        if (response) return response;
      }
    }
    return fetch(event.request);
  })());
});
