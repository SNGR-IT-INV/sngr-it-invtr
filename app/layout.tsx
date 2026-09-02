import type { Metadata, Viewport } from "next"
import { Inter, Geist_Mono } from "next/font/google"
import { NuqsAdapter } from "nuqs/adapters/next/app"
import { RegisterServiceWorker } from "@/app/register-service-worker"
import { TooltipProvider } from "@/components/ui/tooltip"
import "./globals.css"

// Named "--font-sans" to match what globals.css's @theme block actually
// reads. The previous setup (Geist, exposed as "--font-geist-sans") was
// never connected to "--font-sans" anywhere, so the UI was silently falling
// back to a browser default font this whole time, not Geist.
const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "IT Inventory",
  description: "Internal IT equipment inventory and helpdesk tool",
}

// Matches --primary in app/globals.css (light/dark) — see app/manifest.ts
// for where the same hex values come from.
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#4f39f6" },
    { media: "(prefers-color-scheme: dark)", color: "#615fff" },
  ],
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <RegisterServiceWorker />
        <NuqsAdapter>
          <TooltipProvider>{children}</TooltipProvider>
        </NuqsAdapter>
      </body>
    </html>
  )
}
