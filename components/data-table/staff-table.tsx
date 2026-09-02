"use client"

import { useRouter } from "next/navigation"

import { DataTable } from "@/components/data-table/data-table"
import {
  staffColumns,
  type StaffRow,
} from "@/components/data-table/staff-columns"
import { useDataTable } from "@/lib/use-data-table"

export function StaffTable({
  rows,
  totalRows,
}: {
  rows: StaffRow[]
  totalRows: number
}) {
  const router = useRouter()
  const { table } = useDataTable({
    data: rows,
    columns: staffColumns,
    totalRows,
  })

  return (
    <DataTable
      table={table}
      totalRows={totalRows}
      onRowClick={(row: StaffRow) => router.push(`/dashboard/staff/${row.id}`)}
      emptyMessage="No staff match these filters."
      itemLabel="staff member"
      itemLabelPlural="staff members"
    />
  )
}
