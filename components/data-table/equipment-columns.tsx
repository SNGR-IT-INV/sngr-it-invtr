import type { ColumnDef } from "@tanstack/react-table"

import { EquipmentStatusBadge } from "@/components/status-badge"
import { EQUIPMENT_TYPES } from "@/lib/equipment-types"
import type { getEquipmentPage } from "@/lib/inventory-data"

export type EquipmentRow = Awaited<
  ReturnType<typeof getEquipmentPage>
>["rows"][number]

const TYPE_LABEL = Object.fromEntries(
  EQUIPMENT_TYPES.map((t) => [t.value, t.label])
)

export const equipmentColumns: ColumnDef<EquipmentRow, unknown>[] = [
  {
    accessorKey: "serialNumber",
    header: "Serial",
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.original.serialNumber}</span>
    ),
  },
  {
    id: "device",
    header: "Device",
    cell: ({ row }) => {
      const e = row.original
      return (
        <span>
          {e.brand} {e.model ?? TYPE_LABEL[e.type]}
        </span>
      )
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => TYPE_LABEL[row.original.type] ?? row.original.type,
  },
  {
    id: "department",
    header: "Department",
    cell: ({ row }) => row.original.department?.name ?? "—",
  },
  {
    id: "currentHolder",
    header: "Held by",
    cell: ({ row }) => row.original.currentHolder?.name ?? "—",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <EquipmentStatusBadge status={row.original.status} />,
  },
]
