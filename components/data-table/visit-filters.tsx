"use client"

import { debounce, parseAsString, parseAsStringEnum, useQueryState } from "nuqs"

import { Icon } from "@/components/icon"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function VisitFilters({ showStatus = false }: { showStatus?: boolean }) {
  const [ticket, setTicket] = useQueryState(
    "ticket",
    parseAsString.withOptions({
      shallow: false,
      limitUrlUpdates: debounce(400),
      clearOnDefault: true,
    })
  )
  const [status, setStatus] = useQueryState(
    "status",
    parseAsStringEnum(["draft", "completed"]).withOptions({ shallow: false })
  )
  const [dateFrom, setDateFrom] = useQueryState(
    "dateFrom",
    parseAsString.withOptions({ shallow: false })
  )
  const [dateTo, setDateTo] = useQueryState(
    "dateTo",
    parseAsString.withOptions({ shallow: false })
  )
  const [, setPage] = useQueryState("page")

  const hasFilters = !!(ticket || status || dateFrom || dateTo)

  function resetPage() {
    void setPage(null)
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        placeholder="Search ticket number…"
        className="h-8 w-48"
        defaultValue={ticket ?? ""}
        onChange={(e) => {
          resetPage()
          void setTicket(e.target.value || null)
        }}
      />
      {showStatus ? (
        <Select
          value={status ?? ""}
          onValueChange={(v) => {
            resetPage()
            void setStatus(v ? (v as "draft" | "completed") : null)
          }}
        >
          <SelectTrigger className="h-8 w-36" aria-label="Status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Awaiting pickup</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      ) : null}
      <div className="flex items-center gap-1.5">
        <Input
          type="date"
          aria-label="From date"
          className="h-8 w-36"
          value={dateFrom ?? ""}
          onChange={(e) => {
            resetPage()
            void setDateFrom(e.target.value || null)
          }}
        />
        <span className="text-muted-foreground text-sm">to</span>
        <Input
          type="date"
          aria-label="To date"
          className="h-8 w-36"
          value={dateTo ?? ""}
          onChange={(e) => {
            resetPage()
            void setDateTo(e.target.value || null)
          }}
        />
      </div>
      {hasFilters ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            resetPage()
            void setTicket(null)
            void setStatus(null)
            void setDateFrom(null)
            void setDateTo(null)
          }}
        >
          <Icon icon="tabler:x" /> Clear filters
        </Button>
      ) : null}
    </div>
  )
}
