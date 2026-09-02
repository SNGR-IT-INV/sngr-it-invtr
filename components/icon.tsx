"use client"

// Single import point for icons across the app. Pulls in the offline icon
// registration (lib/icons.ts) as a side effect, so every file that renders
// an icon guarantees the data is registered first — regardless of which
// route/client bundle it ends up in.
import "@/lib/icons"

// The /offline entry has no network-fetch code path and no deferred-mount
// logic — it reads registered icon data synchronously, so it renders
// correctly in the initial SSR output. The default "@iconify/react" entry
// is built for the online/API-fetch case and defers rendering until after
// mount even when data happens to be pre-registered.
export { Icon } from "@iconify/react/offline"
