import type { ColumnDef } from "@tanstack/react-table"

import { StaffStatusBadge } from "@/components/status-badge"
import type { getStaffPage } from "@/lib/inventory-data"

export type StaffRow = Awaited<ReturnType<typeof getStaffPage>>["rows"][number]

export const staffColumns: ColumnDef<StaffRow, unknown>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.email ?? "—"}</span>
    ),
  },
  {
    id: "department",
    header: "Department",
    cell: ({ row }) => row.original.department?.name ?? "—",
  },
  {
    id: "heldEquipment",
    header: "Equipment held",
    cell: ({ row }) => {
      const n = row.original.heldEquipment
      return (
        <span className="text-sm">
          {n} item{n === 1 ? "" : "s"}
        </span>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StaffStatusBadge status={row.original.status} />,
  },
]
