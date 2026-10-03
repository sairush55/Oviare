/**
 * Oviare Service Worker
 * Handles Web Push notifications and notification interactions with privacy-first boundaries.
 */

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
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

/**
 * Fetch listener to satisfy PWA criteria and pass network requests through
 */
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request).catch(async () => {
      const cached = await caches.match(event.request);
      if (cached) return cached;
      return new Response('Offline', {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'text/plain' },
      });
    })
  );
});

