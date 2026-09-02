import type { MetadataRoute } from "next"

// Dashboard-oriented default manifest — the kiosk gets its own static one
// at public/kiosk-manifest.webmanifest (Next's manifest.ts convention only
// supports a single manifest at the app root, see manifest.md in
// node_modules/next/dist/docs), linked instead of this one via the
// metadata override in app/kiosk/layout.tsx.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "IT Inventory",
    short_name: "IT Inventory",
    description: "Internal IT equipment inventory and helpdesk tool",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#4f39f6",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  }
}
