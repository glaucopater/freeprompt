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

// Listen for skip waiting message from registration
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const requestOrigin = url.origin;
  const requestPath = url.pathname;
  
  // Skip Netlify function calls - they should never be cached
  if (requestPath.startsWith('/.netlify/functions/')) {
    return;
  }
  
  // Handle Web Share Target API POST requests
  // This must be checked before other fetch handlers
  if (event.request.method === 'POST' && requestPath === '/share-target/') {
    console.warn('[SW] Share target POST intercepted:', requestPath);
    event.respondWith(handleShareTarget(event));
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

// Handle Web Share Target API POST requests
async function handleShareTarget(event) {
  try {
    console.warn('[SW] Processing share target request...');
    const formData = await event.request.formData();
    const file = formData.get('photos'); // Matches manifest.json param name
    const text = formData.get('text');
    const title = formData.get('title');
    const urlParam = formData.get('url');
    
    console.warn('[SW] Form data received:', {
      hasFile: !!file,
      fileType: file instanceof File ? file.type : 'not a file',
      fileName: file instanceof File ? file.name : 'N/A',
      fileSize: file instanceof File ? file.size : 0,
      text: text || 'none',
      title: title || 'none',
      url: urlParam || 'none'
    });
    
    // Generate a unique ID for this share session
    const shareId = `share_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    console.warn('[SW] Generated shareId:', shareId);
    
    // Store file data in IndexedDB to avoid URL length limits
    // This is more robust for large files (images, audio)
    let fileData = null;
    if (file && file instanceof File) {
      // Check file size - warn if very large (>10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        console.warn(`Large file detected: ${file.size} bytes. Processing may be slow.`);
      }
      
      // Convert file to base64 for storage
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let binary = '';
      // Process in chunks to avoid blocking
      const chunkSize = 8192; // 8KB chunks
      for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.slice(i, i + chunkSize);
        binary += String.fromCharCode.apply(null, chunk);
      }
      const base64 = btoa(binary);
      
      fileData = {
        base64: base64,
        filename: file.name,
        mimetype: file.type,
        size: file.size,
        type: file.type.startsWith('image/') ? 'image' : 
              file.type.startsWith('audio/') ? 'audio' : 'unknown'
      };
      
      // Store in IndexedDB
      console.warn('[SW] Storing file data in IndexedDB...');
      await storeShareData(shareId, {
        file: fileData,
        text: text || null,
        title: title || null,
        url: urlParam || null,
        timestamp: Date.now()
      });
      console.warn('[SW] File data stored successfully');
    } else {
      // Store text-only share
      console.warn('[SW] No file found, storing text-only share...');
      await storeShareData(shareId, {
        file: null,
        text: text || null,
        title: title || null,
        url: urlParam || null,
        timestamp: Date.now()
      });
      console.warn('[SW] Text-only share stored successfully');
    }
    
    // Build redirect URL with share ID (not file data)
    const redirectUrl = new URL('/', self.location.origin);
    redirectUrl.searchParams.set('shareId', shareId);
    
    // Notify open clients about the shared content
    const clients = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
    console.warn('[SW] Found', clients.length, 'open client(s)');
    if (clients.length > 0) {
      // If there's an open client, send message with share ID
      console.warn('[SW] Sending postMessage to client with shareId:', shareId);
      clients[0].postMessage({
        type: 'SHARED_CONTENT',
        shareId: shareId,
        file: fileData ? {
          name: fileData.filename,
          type: fileData.mimetype,
          size: fileData.size
        } : null,
        text: text,
        title: title,
        url: urlParam
      });
      // Send debug message
      clients[0].postMessage({
        type: 'DEBUG_MESSAGE',
        prefix: 'SW',
        message: `Share processed: ${fileData ? fileData.filename : 'text-only'}`,
        data: { shareId, hasFile: !!fileData }
      });
      await clients[0].focus();
      console.warn('[SW] postMessage sent and client focused');
    }
    
    // Redirect to app with share ID
    console.warn('[SW] Redirecting to:', redirectUrl.toString());
    return Response.redirect(redirectUrl.toString(), 303);
  } catch (error) {
    console.error('Error handling share target:', error);
    // Redirect to app even on error
    return Response.redirect(new URL('/', self.location.origin).toString(), 303);
  }
}

// Store share data in IndexedDB
async function storeShareData(shareId, data) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ShareTargetDB', 1);
    
    request.onerror = () => {
      console.error('IndexedDB open error:', request.error);
      // Fallback to sessionStorage if IndexedDB fails
      try {
        sessionStorage.setItem(`share_${shareId}`, JSON.stringify(data));
        resolve();
      } catch (e) {
        reject(e);
      }
    };
    
    request.onsuccess = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('shares')) {
        // Database not initialized, use sessionStorage fallback
        try {
          sessionStorage.setItem(`share_${shareId}`, JSON.stringify(data));
          resolve();
        } catch (e) {
          reject(e);
        }
        return;
      }
      
      const transaction = db.transaction(['shares'], 'readwrite');
      const store = transaction.objectStore('shares');
      const putRequest = store.put(data, shareId);
      
      putRequest.onsuccess = () => {
        // Clean up old shares (older than 1 hour)
        const cleanupTransaction = db.transaction(['shares'], 'readwrite');
        const cleanupStore = cleanupTransaction.objectStore('shares');
        const cleanupRequest = cleanupStore.openCursor();
        
        cleanupRequest.onsuccess = (e) => {
          const cursor = e.target.result;
          if (cursor) {
            if (data.timestamp - cursor.value.timestamp > 3600000) { // 1 hour
              cleanupStore.delete(cursor.primaryKey);
            }
            cursor.continue();
          }
        };
        
        resolve();
      };
      
      putRequest.onerror = () => {
        // Fallback to sessionStorage
        try {
          sessionStorage.setItem(`share_${shareId}`, JSON.stringify(data));
          resolve();
        } catch {
          reject(putRequest.error);
        }
      };
    };
    
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('shares')) {
        // Use shareId as the key directly (no keyPath needed)
        const objectStore = db.createObjectStore('shares');
        objectStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

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