// Cache versioning: Use build-time version or commit ref for automatic cache invalidation
// Netlify provides COMMIT_REF, or we can use a timestamp-based version
// This ensures new deployments automatically invalidate old caches
const CACHE_VERSION = 'v1'; // This will be replaced at build time with actual version
const CACHE_NAME = `freeprompt-cache-${CACHE_VERSION}`;

// Don't cache index.html - it changes with each build and contains asset hashes
// Caching it causes 404s when old HTML references new asset hashes
const urlsToCache = [
  '/favicon.png',
  '/images/logo-no-bg.png',
  // Add other static assets you want to cache
];

self.addEventListener('install', (event) => {
  // Force the new service worker to activate immediately
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.warn('Opened cache');
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
  } catch {
    // If we can't determine origin, be conservative and only handle relative URLs
    serviceWorkerOrigin = null;
  }
  
  // Only intercept same-origin requests
  // Skip external CDN requests, API calls, and other cross-origin resources
  if (serviceWorkerOrigin && requestOrigin !== serviceWorkerOrigin) {
    // Let the browser handle external requests normally
    return;
  }
  
  // Only intercept navigation requests (HTML pages)
  // Let the browser handle all asset requests (JS, CSS, images, etc.) directly
  // This prevents the service worker from interfering with asset loading
  const isNavigationRequest = event.request.mode === 'navigate' || 
                              requestPath === '/' || 
                              requestPath === '/index.html';
  
  if (!isNavigationRequest) {
    // Don't intercept asset requests - let browser handle them directly
    return;
  }

  // Network-first strategy for navigation requests (HTML pages)
  // This ensures we always get the latest HTML with correct asset hashes
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        return response;
      })
      .catch((_error) => {
        // Fallback to cache only if network fails completely
        return caches.match(event.request);
      })
  );
});

self.addEventListener('activate', (event) => {
  // Clean up old caches: delete all caches that don't match the current cache name
  // This ensures new deployments automatically invalidate prior PWA caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete all caches that don't match the current cache name
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Take control of all clients immediately
      return self.clients.claim();
    })
  );
});