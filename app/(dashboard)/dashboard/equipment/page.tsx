import type { SearchParams } from "nuqs/server"

import { PageContainer } from "@/components/layout/page-container"
import { EquipmentFilters } from "@/components/data-table/equipment-filters"
import { EquipmentTable } from "@/components/data-table/equipment-table"
import { equipmentSearchParamsCache } from "@/lib/equipment-search-params"
import { getAllDepartments, getEquipmentPage } from "@/lib/inventory-data"

export const dynamic = "force-dynamic"

export default async function EquipmentPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = equipmentSearchParamsCache.parse(await searchParams)
  const [{ rows, total }, departments] = await Promise.all([
    getEquipmentPage({
      page: params.page,
      perPage: params.perPage,
      search: params.search ?? undefined,
      type: params.type ?? undefined,
      status: params.status ?? undefined,
      departmentId: params.departmentId ?? undefined,
    }),
    getAllDepartments(),
  ])

  return (
    <PageContainer>
      <div>
        <h1 className="text-xl font-semibold">Equipment</h1>
        <p className="text-muted-foreground text-sm">
          Every tracked asset — by type, status, and department.
        </p>
      </div>
      <EquipmentFilters departments={departments} />
      <EquipmentTable rows={rows} totalRows={total} />
    </PageContainer>
  )
}
