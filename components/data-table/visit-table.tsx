"use client"

import { useRouter } from "next/navigation"

import { DataTable } from "@/components/data-table/data-table"
import {
  getVisitColumns,
  type VisitRow,
} from "@/components/data-table/visit-columns"
import { useDataTable } from "@/lib/use-data-table"

export function VisitTable({
  rows,
  totalRows,
  showStatus = false,
}: {
  rows: VisitRow[]
  totalRows: number
  showStatus?: boolean
}) {
  const router = useRouter()
  const columns = getVisitColumns({ showStatus })
  const { table } = useDataTable({ data: rows, columns, totalRows })

  return (
    <DataTable
      table={table}
      totalRows={totalRows}
      onRowClick={(row: VisitRow) => router.push(`/dashboard/visits/${row.id}`)}
      emptyMessage="No visits match these filters."
      itemLabel="visit"
    />
  )
}
