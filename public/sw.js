/* SkillsBet Service Worker — Push Notifications + PWA */
const CACHE_NAME = 'skillsbet-v1';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

/* ── Push Notification Handler ── */
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: 'SkillsBet', body: event.data.text() };
  }

  const { title = 'SkillsBet', body = '', icon = '/icon.svg', url = '/lobby', tag } = payload;

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon,
      badge: '/icon.svg',
      tag: tag || 'skillsbet',
      data: { url },
      vibrate: [200, 100, 200],
      requireInteraction: false,
    })
  );
});

/* ── Notification Click → Open / Focus App ── */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/lobby';

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        const existing = clients.find(
          (c) => new URL(c.url).pathname === new URL(targetUrl, self.location.origin).pathname
        );
        if (existing) return existing.focus();
        return self.clients.openWindow(targetUrl);
      })
  );
});
