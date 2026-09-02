"use client"

import { useRouter } from "next/navigation"

import { DataTable } from "@/components/data-table/data-table"
import {
  equipmentColumns,
  type EquipmentRow,
} from "@/components/data-table/equipment-columns"
import { useDataTable } from "@/lib/use-data-table"

export function EquipmentTable({
  rows,
  totalRows,
}: {
  rows: EquipmentRow[]
  totalRows: number
}) {
  const router = useRouter()
  const { table } = useDataTable({
    data: rows,
    columns: equipmentColumns,
    totalRows,
  })

  return (
    <DataTable
      table={table}
      totalRows={totalRows}
      onRowClick={(row: EquipmentRow) =>
        router.push(`/dashboard/equipment/${row.id}`)
      }
      emptyMessage="No equipment matches these filters."
      itemLabel="item"
    />
  )
}
