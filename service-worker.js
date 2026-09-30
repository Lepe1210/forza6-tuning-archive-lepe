/* =========================
   Forza 6 Tuning Archive
   Service Worker
   - 기본 파일 캐시
   - Google Sheets CSV / Apps Script API는 캐시하지 않고 항상 네트워크에서 읽음
========================= */

const CACHE_NAME = "forza-tuning-archive-v23-b-renewal";

const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./archive.html",
  "./manager.html",
  "./gallery.html",
  "./rivals.html",
  "./guide.html",
  "./discord.html",

  "./style.css?v=20260930-b-renewal-2",
  "./redesign.css?v=20260930-b-renewal-2",
  "./redesign.js?v=20260930-b-renewal-2",
  "./assets/archive-icon.webp",
  "./assets/festival-engraving.webp",
  "./icons/icon-32.png",
  "./assets/fonts/hahmlet-variable.woff2",
  "./assets/fonts/bodoni-moda-latin.woff2",
  "./assets/fonts/bodoni-moda-latin-ext.woff2",

  "./script.js?v=20260930-b-renewal-2",
  "./archive.js?v=20260930-b-renewal-2",
  "./manager.js?v=20260930-b-renewal-2",
  "./gallery.js?v=20260930-b-renewal-2",
  "./rivals.js?v=20260930-b-renewal-2",

  "./manifest.json",

  "./icons/icon-192.png",
  "./icons/icon-512.png"
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

  if (isGoogleDataRequest) {
    event.respondWith(fetch(request));
    return;
  }

  const isHtmlNavigation = request.mode === "navigate";

  if (isHtmlNavigation) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });

          return response;
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            return cachedResponse || caches.match("./index.html");
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

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseClone);
        });

        return response;
      });
    })
  );
});

