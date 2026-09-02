import type { SearchParams } from "nuqs/server"

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
      <div>
        <h1 className="text-xl font-semibold">Out log</h1>
        <p className="text-muted-foreground text-sm">
          Equipment prepped for pickup and handed out. Prepare/complete screens
          aren&rsquo;t built yet — this is the log view.
        </p>
      </div>
      <VisitFilters showStatus />
      <VisitTable rows={rows} totalRows={total} showStatus />
    </PageContainer>
  )
}
