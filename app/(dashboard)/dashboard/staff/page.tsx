import type { SearchParams } from "nuqs/server"

import { PageContainer } from "@/components/layout/page-container"
import { StaffFilters } from "@/components/data-table/staff-filters"
import { StaffTable } from "@/components/data-table/staff-table"
import { getAllDepartments, getStaffPage } from "@/lib/inventory-data"
import { staffSearchParamsCache } from "@/lib/staff-search-params"

export const dynamic = "force-dynamic"

export default async function StaffPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = staffSearchParamsCache.parse(await searchParams)
  const [{ rows, total }, departments] = await Promise.all([
    getStaffPage({
      page: params.page,
      perPage: params.perPage,
      search: params.search ?? undefined,
      status: params.status ?? undefined,
      departmentId: params.departmentId ?? undefined,
    }),
    getAllDepartments(),
  ])

  return (
    <PageContainer>
      <div>
        <h1 className="text-xl font-semibold">Staff</h1>
        <p className="text-muted-foreground text-sm">
          Directory of org staff — who holds what equipment, by department.
        </p>
      </div>
      <StaffFilters departments={departments} />
      <StaffTable rows={rows} totalRows={total} />
    </PageContainer>
  )
}
