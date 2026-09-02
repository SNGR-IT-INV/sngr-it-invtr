import type { ColumnDef } from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import type { getVisitsPage } from "@/lib/inventory-data"

export type VisitRow = Awaited<ReturnType<typeof getVisitsPage>>["rows"][number]

export function getVisitColumns({
  showStatus = false,
}: {
  showStatus?: boolean
}): ColumnDef<VisitRow, unknown>[] {
  const columns: ColumnDef<VisitRow, unknown>[] = [
    {
      accessorKey: "ticketNumber",
      header: "Ticket",
      cell: ({ row }) => (
        <span className="font-mono text-sm">
          {row.original.ticketNumber ?? "—"}
        </span>
      ),
    },
    {
      id: "items",
      header: "Items",
      cell: ({ row }) => {
        const n = row.original.items
        return (
          <span className="text-sm">
            {n} item{n === 1 ? "" : "s"}
          </span>
        )
      },
    },
    {
      id: "counterparty",
      header: "Brought / received by",
      cell: ({ row }) =>
        row.original.counterparty?.name ?? row.original.counterpartyNote ?? "—",
    },
    {
      id: "processedBy",
      header: "Handled by",
      cell: ({ row }) => row.original.processedBy?.name ?? "—",
    },
    {
      accessorKey: "occurredAt",
      header: "Date",
      cell: ({ row }) => new Date(row.original.occurredAt).toLocaleString(),
    },
  ]

  if (showStatus) {
    columns.push({
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) =>
        row.original.status === "draft" ? (
          <Badge
            variant="outline"
            className="border-warning/40 bg-warning/20 text-amber-800 dark:text-amber-300"
          >
            Awaiting pickup
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="border-success/30 bg-success/15 text-emerald-700 dark:text-emerald-300"
          >
            Completed
          </Badge>
        ),
    })
  }

  return columns
}
