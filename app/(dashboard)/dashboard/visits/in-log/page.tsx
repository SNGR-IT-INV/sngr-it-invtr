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

export default async function InLogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = visitSearchParamsCache.parse(await searchParams)
  const { rows, total } = await getVisitsPage({
    kind: "in",
    page: params.page,
    perPage: params.perPage,
    ticket: params.ticket ?? undefined,
    dateFrom: params.dateFrom ?? undefined,
    dateTo: params.dateTo ?? undefined,
  })

  return (
    <PageContainer>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">In log</h1>
          <p className="text-muted-foreground text-sm">
            Equipment intake and returns logged at the front desk.
          </p>
        </div>
        <Button render={<Link href="/kiosk/in-log/new" />}>
          <Icon icon="tabler:plus" />
          Log an intake
        </Button>
      </div>
      <VisitFilters />
      <VisitTable rows={rows} totalRows={total} />
    </PageContainer>
  )
}
