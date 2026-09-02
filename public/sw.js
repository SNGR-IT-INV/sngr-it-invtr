// Minimal, hand-rolled service worker — not a full offline app-shell setup.
// Its job is narrow on purpose: (1) satisfy Chrome's "has a registered
// service worker" installability heuristic, (2) let genuinely static,
// content-hashed assets survive a connectivity blip. It must NEVER touch
// page navigations, RSC payloads, or API/Server Action requests — every
// dashboard and kiosk page reads live DB data (force-dynamic, see
// HANDOFF.md), so caching those would silently show stale inventory data.
// See the PWA plan (installability + kiosk draft resilience) for why a
// library (@serwist/next) was tried and dropped: it's built around either
// a webpack plugin (doesn't run under this project's Turbopack build) or
// an undocumented CLI build step — not worth the risk versus this file,
// which is small enough to read start to finish and be sure of.

const CACHE_NAME = "static-v1"

// Same-origin, never-changes-per-request assets. Anything else — pages,
// RSC payloads, /api/*, the kiosk's Server Action — falls through to a
// plain network fetch, untouched.
const STATIC_ALLOWLIST = [
  "/icon-192.png",
  "/icon-512.png",
  "/manifest.webmanifest",
  "/kiosk-manifest.webmanifest",
  "/favicon.ico",
]

function isCacheableStaticAsset(url) {
  if (url.origin !== self.location.origin) return false
  // Next's build output under /_next/static/ is content-hashed — safe to
  // cache indefinitely, a new deploy just gets new URLs.
  if (url.pathname.startsWith("/_next/static/")) return true
  return STATIC_ALLOWLIST.includes(url.pathname)
}

self.addEventListener("install", () => {
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  )
})

self.addEventListener("fetch", (event) => {
  const request = event.request
  if (request.method !== "GET") return

  const url = new URL(request.url)
  if (!isCacheableStaticAsset(url)) return

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(request)
      if (cached) return cached
      const response = await fetch(request)
      if (response.ok) cache.put(request, response.clone())
      return response
    })
  )
})
