import type { Metadata } from "next"

// Passthrough on purpose — no visual chrome added here. Its only job is
// pointing the kiosk at its own manifest (front-desk-appropriate name,
// start_url) instead of the dashboard one in app/manifest.ts. See
// design-system/sngr-it-inventory/pages/kiosk.md for why this route group
// otherwise stays free of any dashboard-style layout.
export const metadata: Metadata = {
  title: "IT Inventory — Kiosk",
  manifest: "/kiosk-manifest.webmanifest",
}

export default function KioskLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
