/* =========================
   PWA Service Worker
   - 사이트 기본 파일을 캐시해서 앱처럼 빠르게 열리게 함
   - Google Sheets CSV 데이터는 실시간 갱신을 위해 캐시하지 않음
========================= */

const CACHE_NAME = "forza-tuning-archive-v3";

const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./archive.html",
  "./style.css",
  "./script.js",
  "./archive.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];


/* =========================
   설치 단계
   - 기본 파일들을 캐시에 저장
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
   활성화 단계
   - 오래된 캐시 삭제
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
   - 기본 사이트 파일은 캐시 우선
   - Google Sheets CSV는 항상 네트워크 우선
========================= */

self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);

  if (requestUrl.hostname.includes("docs.google.com")) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});