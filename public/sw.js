self.addEventListener('push', event => {
  const data = event.data.json();
  console.log('Push Received:', data);

  self.registration.showNotification(data.title, {
    body: data.body,
    icon: '/vite.svg',
    data: { url: data.url }
  });
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  if (event.notification.data.url) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});
