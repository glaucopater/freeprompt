const CACHE_NAME = 'freeprompt-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/favicon.png',
  '/images/logo-no-bg.png',
  // Add other assets you want to cache
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const requestOrigin = url.origin;
  const requestPath = url.pathname;
  
  // Skip Netlify function calls - they should never be cached
  if (requestPath.startsWith('/.netlify/functions/')) {
    return;
  }
  
  // Get the service worker's origin from registration scope
  // Fallback: try self.location.origin, or extract from registration scope
  let serviceWorkerOrigin;
  try {
    // Try to get origin from registration scope
    if (self.registration && self.registration.scope) {
      const scopeUrl = new URL(self.registration.scope);
      serviceWorkerOrigin = scopeUrl.origin;
    } else if (self.location) {
      serviceWorkerOrigin = self.location.origin;
    }
  } catch (e) {
    // If we can't determine origin, be conservative and only handle relative URLs
    serviceWorkerOrigin = null;
  }
  
  // Only intercept same-origin requests
  // Skip external CDN requests, API calls, and other cross-origin resources
  if (serviceWorkerOrigin && requestOrigin !== serviceWorkerOrigin) {
    // Let the browser handle external requests normally
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request).catch((error) => {
          // Re-throw the error so the browser can handle it
          throw error;
        });
      })
      .catch((error) => {
        // Re-throw to let the browser handle the error
        throw error;
      })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});