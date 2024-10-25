/* eslint-disable no-restricted-globals */
import url from './components/serveo.js';

const CACHE_NAME = 'icon-cache-v';
const urlsToCache = [
  `${url}/icons/admin-dashboard.png`,
  `${url}/icons/settings.png`,
  `${url}/icons/communities.png`,
  `${url}/icons/logout.png`,
  `${url}/icons/placeholder.png`
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