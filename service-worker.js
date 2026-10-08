/* =========================
   Forza 6 Tuning Archive
   Service Worker
   - 기본 파일 캐시
   - Google Sheets CSV / Apps Script API는 캐시하지 않고 항상 네트워크에서 읽음
========================= */

const CACHE_NAME = "forza-tuning-archive-v32-main3";

const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./archive.html",
  "./manager.html",
  "./gallery.html",
  "./rivals.html",
  "./guide.html",
  "./guide.css?v=20260930-lepe-guide-1",
  "./guide.js?v=20260930-lepe-guide-1",
  "./assets/lepe-guide.webp",
  "./discord.html",

  "./style.css?v=20261002-summary-contrast-1",
  "./redesign.css?v=20261002-summary-contrast-1",
  "./redesign.js?v=20261002-summary-contrast-1",
  "./assets/archive-icon.webp",
  "./assets/festival-engraving.webp",
  "./icons/icon-32.png",
  "./assets/fonts/hahmlet-variable.woff2",
  "./assets/fonts/bodoni-moda-latin.woff2",
  "./assets/fonts/bodoni-moda-latin-ext.woff2",

  "./script.js?v=20261008-main3-1",
  "./archive.js?v=20261002-summary-contrast-1",
  "./manager.js?v=20261002-summary-contrast-1",
  "./gallery.js?v=20261002-summary-contrast-1",
  "./rivals.js?v=20261002-summary-contrast-1",

  "./manifest.json",

  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/archive-192-v2.png",
  "./icons/archive-512-v2.png",
  "./assets/rivals/dtm-1990s.webp",
  "./assets/rivals/alms-2000s.webp",
  "./assets/rivals/lemans-1967.webp",
  "./assets/rivals/dtm-car-001.webp",
  "./assets/rivals/dtm-car-002.webp",
  "./assets/rivals/dtm-car-003.webp",
  "./assets/rivals/dtm-car-004.webp",
  "./assets/rivals/alms-2000s-car-001.webp",
  "./assets/rivals/alms-2000s-car-002.webp",
  "./assets/rivals/alms-2000s-car-003.webp",
  "./assets/rivals/lemans-1967-car001.webp",
  "./assets/rivals/lemans-1967-car002.webp"
];


/* =========================
   설치 시 기본 파일 캐시
========================= */

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );

  self.skipWaiting();
});


/* =========================
   이전 캐시 삭제
========================= */

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );

  self.clients.claim();
});


/* =========================
   요청 처리
   - Google Sheets / Apps Script는 캐시하지 않음
   - HTML 문서는 네트워크 우선
   - 그 외 정적 파일은 캐시 우선
========================= */

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const requestUrl = new URL(request.url);

  if (request.method !== "GET") {
    return;
  }

  const isGoogleDataRequest =
    requestUrl.hostname.includes("docs.google.com") ||
    requestUrl.hostname.includes("script.google.com") ||
    requestUrl.hostname.includes("googleusercontent.com");

  if (isGoogleDataRequest || requestUrl.origin !== self.location.origin) {
    event.respondWith(fetch(request));
    return;
  }

  const isHtmlNavigation = request.mode === "navigate";

  const isManifest = requestUrl.pathname.endsWith("/manifest.json");

  if (isHtmlNavigation || isManifest) {
    event.respondWith(
      fetch(request, { cache: "no-cache" })
        .then((response) => {
          const responseClone = response.clone();

          if (response.ok) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }

          return response;
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            return cachedResponse || (isHtmlNavigation ? caches.match("./index.html") : Response.error());
          });
        })
    );

    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then((response) => {
        const responseClone = response.clone();

        if (response.ok) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }

        return response;
      });
    })
  );
});
