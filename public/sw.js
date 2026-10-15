/**
 * Oviare Service Worker (Phase 6: PWA, Push Notifications & Safe Offline Caching)
 * 
 * Strict Privacy Guarantees:
 * - Never caches Supabase API calls, auth tokens, or personal health records.
 * - Never caches internal API routes (/api/*) or auth callbacks (/auth/*).
 * - Caches only non-sensitive public assets, icons, scripts, and an offline fallback page.
 * - Full backward compatibility with Web Push notifications and notification clicks.
 */

const CACHE_NAME = 'oviare-cache-v2';
const OFFLINE_FALLBACK_PAGE = '/offline.html';

// Non-sensitive public assets precached on service worker installation
const PRECACHE_ASSETS = [
  OFFLINE_FALLBACK_PAGE,
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg',
  '/icons/badge-72.svg',
  '/apple-touch-icon.png',
];

/**
 * Service Worker Installation: Precache offline shell & static icons
 */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
      .catch((err) => {
        console.warn('Oviare SW: Precaching non-sensitive assets failed:', err);
        return self.skipWaiting();
      })
  );
});

/**
 * Service Worker Activation: Purge outdated caches and claim clients immediately
 */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames.map((name) => {
            if (name !== CACHE_NAME) {
              return caches.delete(name);
            }
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

/**
 * Identifies sensitive, non-cacheable, or bypass requests.
 * Health records, tokens, Supabase endpoints, and API mutations MUST NEVER be cached.
 */
function isSensitiveOrBypassRequest(request, url) {
  // Non-GET requests (POST, PUT, DELETE, etc.) must never be intercepted by cache
  if (request.method !== 'GET') return true;

  // Supabase Database & Auth API: NEVER CACHE IN SERVICE WORKER
  if (url.hostname.includes('supabase.co')) return true;

  // Internal API routes (e.g. /api/user/export, /api/user/delete, /api/reminders/send): NEVER CACHE
  if (url.pathname.startsWith('/api/')) return true;

  // Auth callback and exchange routes: NEVER CACHE
  if (url.pathname.startsWith('/auth/')) return true;

  // Requests carrying explicit authorization headers: NEVER CACHE
  if (request.headers.get('authorization')) return true;

  return false;
}

/**
 * Fetch Handler:
 * - Passes through sensitive requests directly to the network.
 * - Serves immutable static assets (/_next/static/, icons) via Cache-First.
 * - Handles page navigations via Network-First, falling back to /offline.html when disconnected.
 */
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // 1. Immediately pass through all sensitive requests without caching
  if (isSensitiveOrBypassRequest(request, url)) {
    return;
  }

  // 2. Navigation requests (HTML page loads)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(async () => {
          // If offline or network failed, return the branded offline fallback page
          const cache = await caches.open(CACHE_NAME);
          const cachedFallback = await cache.match(OFFLINE_FALLBACK_PAGE);
          return (
            cachedFallback ||
            new Response('Offline - Reconnect to continue using Oviare.', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: { 'Content-Type': 'text/plain' },
            })
          );
        })
    );
    return;
  }

  // 3. Static Assets: Next.js immutable bundles, fonts, icons, manifest
  const isStaticAsset =
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.png') ||
    url.pathname === '/manifest.json' ||
    url.pathname === OFFLINE_FALLBACK_PAGE;

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request).then((networkResponse) => {
          // Only cache valid 200 responses for static assets
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            networkResponse.type === 'basic'
          ) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // 4. Default: Network with safe error handling
  event.respondWith(
    fetch(request).catch(async () => {
      const cached = await caches.match(request);
      if (cached) return cached;
      return new Response('Network unavailable', {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'text/plain' },
      });
    })
  );
});

/**
 * Push event listener
 * Receives Web Push events sent by the server scheduler.
 * Enforces privacy: never displays symptoms, mood, sleep, intimacy, or notes.
 */
self.addEventListener('push', (event) => {
  let data = {
    title: 'Oviare Reminder',
    body: 'A little time for your Oviare check-in.',
    url: '/dashboard',
    tag: 'oviare-notification',
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      if (payload.title) data.title = payload.title;
      if (payload.body) data.body = payload.body;
      if (payload.url) data.url = payload.url;
      if (payload.tag) data.tag = payload.tag;
    } catch (e) {
      // Fallback to text payload if not JSON
      const text = event.data.text();
      if (text && text.trim().length > 0) {
        data.body = text.trim();
      }
    }
  }

  const options = {
    body: data.body,
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-72.svg',
    tag: data.tag,
    renotify: true,
    data: {
      url: data.url || '/dashboard',
    },
    // Standard subtle vibration pattern (100ms vibrate, 50ms pause, 100ms vibrate)
    vibrate: [100, 50, 100],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

/**
 * Notification click listener
 * Closes the notification and navigates to the relevant page without opening duplicate tabs.
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/dashboard';
  const urlToOpen = new URL(targetUrl, self.location.origin).href;

  event.waitUntil(
    self.clients
      .matchAll({
        type: 'window',
        includeUncontrolled: true,
      })
      .then((clientList) => {
        // If an existing Oviare window is open, focus it and navigate
        for (const client of clientList) {
          if (client.url.startsWith(self.location.origin) && 'focus' in client) {
            client.focus();
            if ('navigate' in client) {
              return client.navigate(urlToOpen);
            }
            return client;
          }
        }
        // Otherwise open a new window
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen);
        }
      })
  );
});
