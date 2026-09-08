import Link from "next/link"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { getDraftOutLogVisits, getItStaff } from "@/lib/inventory-data"
import { CompleteOutLogFlow } from "./complete-out-log-flow"

// Live data (which pickups are still waiting) on every request — this must
// never be prerendered as a static build-time snapshot.
export const dynamic = "force-dynamic"

export default async function OutLogKioskPage({
  searchParams,
}: {
  searchParams: Promise<{ ticket?: string }>
}) {
  // TODO: gate this route behind the shared kiosk login once Microsoft SSO
  // is wired up. Whoever hands the equipment off is still picked explicitly
  // on the form below, regardless of who's logged into the device.
  const [itStaff, visits, { ticket }] = await Promise.all([
    getItStaff(),
    getDraftOutLogVisits(),
    searchParams,
  ])

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <Breadcrumb className="mb-4">
        <BreadcrumbList className="text-base">
          <BreadcrumbItem>
            <BreadcrumbLink
              render={<Link href="/dashboard" />}
              className="-mx-1 -my-2.5 flex min-h-11 items-center px-1 py-2.5"
            >
              Dashboard
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Out log</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="mb-1 text-xl font-semibold">Complete a pickup</h1>
      <p className="text-muted-foreground mb-6 text-sm">
        Find the ticket, have the recipient sign, and hand it over.
      </p>

      <CompleteOutLogFlow
        itStaff={itStaff}
        visits={visits}
        initialTicket={ticket ?? ""}
      />
    </main>
  )
}
