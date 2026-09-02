"use client"

import * as React from "react"
import {
  type ColumnDef,
  type PaginationState,
  type Updater,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { parseAsInteger, useQueryState } from "nuqs"

// Leaner than a fully generic data-table hook on purpose: filtering here is
// server-driven directly via nuqs in each page's own filter bar, not through
// TanStack's column-filter APIs — so this only needs to own pagination.
export function useDataTable<TData>({
  data,
  columns,
  totalRows,
}: {
  data: TData[]
  columns: ColumnDef<TData, unknown>[]
  totalRows: number
}) {
  const [page, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1).withOptions({ shallow: false })
  )
  const [perPage, setPerPage] = useQueryState(
    "perPage",
    parseAsInteger.withDefault(10).withOptions({ shallow: false })
  )

  const pagination: PaginationState = React.useMemo(
    () => ({ pageIndex: page - 1, pageSize: perPage }),
    [page, perPage]
  )

  const onPaginationChange = React.useCallback(
    (updater: Updater<PaginationState>) => {
      const next = typeof updater === "function" ? updater(pagination) : updater
      void setPage(next.pageIndex + 1)
      void setPerPage(next.pageSize)
    },
    [pagination, setPage, setPerPage]
  )

  const table = useReactTable({
    data,
    columns,
    pageCount: Math.max(1, Math.ceil(totalRows / perPage)),
    state: { pagination },
    onPaginationChange,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  })

  return { table, totalRows }
}
