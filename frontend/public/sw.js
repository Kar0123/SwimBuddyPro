const CACHE_NAME = 'swimbuddy-pro-v1.2';
const urlsToCache = [
  '/',
  '/static/css/main.css',
  '/static/js/main.js', 
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('SwimBuddy Pro SW: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('SwimBuddy Pro SW: Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('SwimBuddy Pro SW: Skip waiting');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('SwimBuddy Pro SW: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('SwimBuddy Pro SW: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('SwimBuddy Pro SW: Claiming clients');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Handle API requests differently (always try network first for live data)
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Clone the response for caching
          const responseClone = response.clone();
          
          // Cache successful API responses for offline fallback
          if (response.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          
          return response;
        })
        .catch(() => {
          // If network fails, try to serve from cache
          console.log('SwimBuddy Pro SW: Network failed, serving from cache:', event.request.url);
          return caches.match(event.request);
        })
    );
    return;
  }

  // Handle app shell and static resources (cache first)
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request)
          .then((fetchResponse) => {
            // Don't cache non-successful responses
            if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
              return fetchResponse;
            }

            // Clone the response for caching
            const responseToCache = fetchResponse.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return fetchResponse;
          })
          .catch(() => {
            // If both cache and network fail, provide offline page
            if (event.request.destination === 'document') {
              return caches.match('/');
            }
          });
      })
  );
});

// Handle background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('SwimBuddy Pro SW: Background sync:', event.tag);
  
  if (event.tag === 'swimmer-search') {
    event.waitUntil(
      // Retry failed swimmer searches when back online
      retryFailedSearches()
    );
  }
});

async function retryFailedSearches() {
  // Implementation for retrying searches when back online
  console.log('SwimBuddy Pro SW: Retrying failed searches...');
}

// Handle push notifications (future feature)
self.addEventListener('push', (event) => {
  console.log('SwimBuddy Pro SW: Push received');
  
  const options = {
    body: event.data ? event.data.text() : 'New swimming data available!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Updates',
        icon: '/icons/search-96x96.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/close-96x96.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('SwimBuddy Pro', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('SwimBuddy Pro SW: Notification clicked');
  
  event.notification.close();

  if (event.action === 'explore') {
    // Open app to show updates
    event.waitUntil(
      clients.openWindow('/?notification=true')
    );
  }
});
