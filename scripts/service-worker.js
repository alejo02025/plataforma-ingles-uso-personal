/* Only application files enter these caches. PDFs and progress remain in IndexedDB. */
const CACHE = `language-os:${RELEASE}`;
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      let next = 0;
      try {
        await Promise.all(
          Array.from({ length: 6 }, async () => {
            while (next < FILES.length) {
              const url = FILES[next++];
              const response = await fetch(url, { cache: 'reload' });
              if (!response.ok) throw new Error(`Offline download failed: ${url}`);
              if (url.endsWith('/index.html'))
                await cache.put(url.slice(0, -'index.html'.length), response.clone());
              await cache.put(url, response);
            }
          }),
        );
      } catch (error) {
        await caches.delete(CACHE);
        throw error;
      }
    })(),
  );
});
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      await self.clients.claim();
      // Retain the previous release for tabs still using its JavaScript. Never touch learner storage.
      const old = (await caches.keys())
        .filter((key) => key.startsWith('language-os:') && key !== CACHE)
        .sort()
        .reverse();
      await Promise.all(old.slice(2).map((key) => caches.delete(key)));
    })(),
  );
});
self.addEventListener('message', (event) => {
  if (event.data?.type === 'ACTIVATE_RELEASE') self.skipWaiting();
  if (event.data?.type === 'RELEASE')
    event.ports[0]?.postMessage({ build: RELEASE, offlineReady: true });
});
self.addEventListener('fetch', (event) => {
  const request = event.request,
    url = new URL(request.url);
  if (
    request.method !== 'GET' ||
    url.origin !== self.location.origin ||
    !url.pathname.startsWith(ROOT + '/')
  )
    return;
  if (
    url.pathname.endsWith('/sw.js') ||
    url.pathname.endsWith('/version.json') ||
    (url.pathname.includes('/local-ai/') && url.pathname.endsWith('.bin'))
  )
    return;
  event.respondWith(
    (async () => {
      const own = await caches.open(CACHE);
      if (request.mode === 'navigate' || url.pathname.endsWith('/briefing.json')) {
        try {
          const response = await fetch(request, { cache: 'no-store' });
          if (response.ok) {
            await own.put(url.pathname, response.clone());
            return response;
          }
        } catch {}
        const cached = await own.match(url.pathname);
        if (cached) return cached;
        return new Response(
          'This screen has not been saved for offline use. Open the app once with a connection.',
          { status: 503, headers: { 'Content-Type': 'text/plain' } },
        );
      }
      const saved =
        (await own.match(request, { ignoreSearch: true })) ||
        (await caches.match(request, { ignoreSearch: true }));
      if (saved) return saved;
      return fetch(request);
    })(),
  );
});
