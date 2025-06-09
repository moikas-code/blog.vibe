// Custom service worker for blog post caching
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  event.waitUntil(clients.claim());
});

// Cache blog posts when visited
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Check if this is a blog post request
  if (url.pathname.startsWith('/posts/') && request.method === 'GET') {
    event.respondWith(
      caches.open('blog-posts-v1').then(async (cache) => {
        try {
          // Try network first
          const networkResponse = await fetch(request);
          
          // Clone the response before caching
          if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
          }
          
          return networkResponse;
        } catch (error) {
          // If network fails, try cache
          const cachedResponse = await cache.match(request);
          
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // If both fail, return offline page
          return caches.match('/offline');
        }
      })
    );
  }
});

// Background sync for updating posts
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-posts') {
    event.waitUntil(syncPosts());
  }
});

async function syncPosts() {
  const cache = await caches.open('blog-posts-v1');
  const requests = await cache.keys();
  
  // Update cached posts
  for (const request of requests) {
    try {
      const response = await fetch(request);
      if (response.ok) {
        await cache.put(request, response);
      }
    } catch (error) {
      console.error('Failed to sync:', request.url);
    }
  }
}

// Periodic background sync
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-posts') {
    event.waitUntil(syncPosts());
  }
});

// Message handling for manual cache updates
self.addEventListener('message', (event) => {
  if (event.data.type === 'CACHE_POST') {
    caches.open('blog-posts-v1').then((cache) => {
      cache.add(event.data.url);
    });
  }
  
  if (event.data.type === 'CLEAR_CACHE') {
    caches.delete('blog-posts-v1').then(() => {
      console.log('Blog posts cache cleared');
    });
  }
});