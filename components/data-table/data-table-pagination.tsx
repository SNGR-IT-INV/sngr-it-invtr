"use client"

import type { Table } from "@tanstack/react-table"

import { Icon } from "@/components/icon"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function DataTablePagination<TData>({
  table,
  totalRows,
  pageSizeOptions = [10, 20, 50],
  itemLabel = "result",
  itemLabelPlural,
}: {
  table: Table<TData>
  totalRows: number
  pageSizeOptions?: number[]
  itemLabel?: string
  itemLabelPlural?: string
}) {
  const { pageIndex, pageSize } = table.getState().pagination

  return (
    <div className="flex flex-col-reverse items-center justify-between gap-3 sm:flex-row">
      <span className="text-muted-foreground text-sm">
        {totalRows}{" "}
        {totalRows === 1 ? itemLabel : (itemLabelPlural ?? `${itemLabel}s`)}
      </span>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">Rows per page</span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => table.setPageSize(Number(v))}
          >
            <SelectTrigger className="h-8 w-16" aria-label="Rows per page">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <span className="text-sm">
          Page {pageIndex + 1} of {Math.max(1, table.getPageCount())}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            className="size-8"
            aria-label="First page"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <Icon icon="tabler:chevrons-left" />
          </Button>
          <Button
            variant="outline"
            className="size-8"
            aria-label="Previous page"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <Icon icon="tabler:chevron-left" />
          </Button>
          <Button
            variant="outline"
            className="size-8"
            aria-label="Next page"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <Icon icon="tabler:chevron-right" />
          </Button>
          <Button
            variant="outline"
            className="size-8"
            aria-label="Last page"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <Icon icon="tabler:chevrons-right" />
          </Button>
        </div>
      </div>
    </div>
  )
}
