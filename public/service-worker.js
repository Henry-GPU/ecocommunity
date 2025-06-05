/* eslint-disable no-restricted-globals */
const BASE_URL = 'http://localhost:5000';

const CACHE_NAME = 'icon-cache-v';
const urlsToCache = [
  `${BASE_URL}/icons/admin-dashboard.png`,
  `${BASE_URL}/icons/settings.png`,
  `${BASE_URL}/icons/communities.png`,
  `${BASE_URL}/icons/logout.png`,
  `${BASE_URL}/icons/placeholder.png`
];

const CACHE_ASSETS = self.__WB_MANIFEST || urlsToCache;

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Archivos cacheados');
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
});

self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!cacheWhitelist.includes(cacheName)) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    );
});