import Link from "next/link"
import type { SearchParams } from "nuqs/server"

import { Icon } from "@/components/icon"
import { Button } from "@/components/ui/button"
import { PageContainer } from "@/components/layout/page-container"
import { VisitFilters } from "@/components/data-table/visit-filters"
import { VisitTable } from "@/components/data-table/visit-table"
import { getVisitsPage } from "@/lib/inventory-data"
import { visitSearchParamsCache } from "@/lib/visit-search-params"

// Live, filterable data on every request.
export const dynamic = "force-dynamic"

export default async function OutLogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = visitSearchParamsCache.parse(await searchParams)
  const { rows, total } = await getVisitsPage({
    kind: "out",
    page: params.page,
    perPage: params.perPage,
    ticket: params.ticket ?? undefined,
    status: params.status ?? undefined,
    dateFrom: params.dateFrom ?? undefined,
    dateTo: params.dateTo ?? undefined,
  })

  return (
    <PageContainer>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Out log</h1>
          <p className="text-muted-foreground text-sm">
            Equipment prepped for pickup and handed out. Prep a pickup here; the
            recipient signs for it at the kiosk when they come get it.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" render={<Link href="/kiosk/out-log" />}>
            <Icon icon="tabler:signature" />
            Complete a pickup
          </Button>
          <Button render={<Link href="/dashboard/visits/out-log/new" />}>
            <Icon icon="tabler:plus" />
            Prep a pickup
          </Button>
        </div>
      </div>
      <VisitFilters showStatus />
      <VisitTable rows={rows} totalRows={total} showStatus />
    </PageContainer>
  )
}
