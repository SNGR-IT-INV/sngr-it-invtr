import type { Metadata } from "next"

import { Icon } from "@/components/icon"

// Deliberately outside (dashboard) and app/kiosk — this is the one surface
// that must render before either of those layouts' own auth checks can
// even run, so it has no shared chrome and no session dependency of its own.
export const metadata: Metadata = {
  title: "Sign in — IT Inventory",
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="bg-sidebar relative hidden flex-col justify-between p-10 lg:flex">
        <div className="flex items-center gap-2.5 text-sm font-medium">
          <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
            <Icon icon="tabler:building-warehouse" className="size-4" />
          </div>
          <div className="flex flex-col leading-none">
            <span>IT Inventory</span>
            <span className="text-muted-foreground text-xs">Internal tool</span>
          </div>
        </div>
        <blockquote className="space-y-2">
          <p className="text-foreground text-lg">
            &ldquo;Replacing a shared Word document with a real system, one
            workflow at a time.&rdquo;
          </p>
          <footer className="text-muted-foreground text-sm">
            IT / Helpdesk
          </footer>
        </blockquote>
      </div>
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  )
}
