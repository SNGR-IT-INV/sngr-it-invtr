import { cookies, headers as nextHeaders } from "next/headers"
import { redirect } from "next/navigation"

import { AppSidebar } from "@/components/layout/app-sidebar"
import { SiteHeader } from "@/components/layout/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { auth } from "@/lib/auth"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Kiosk auth (a shared front-desk login, not per-person) is a separate,
  // not-yet-built mechanism — see its own TODOs in app/kiosk/*. This only
  // covers the admin dashboard, where each IT staffer needs their own
  // session.
  const session = await auth.api.getSession({ headers: await nextHeaders() })
  if (!session) {
    // A layout has no reliable way to read the exact path that was
    // requested (that needs middleware, which this app doesn't run) — land
    // on the dashboard overview after signing in rather than guessing.
    redirect("/auth/sign-in")
  }

  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false"

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar user={session.user} />
      <SidebarInset>
        <SiteHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
