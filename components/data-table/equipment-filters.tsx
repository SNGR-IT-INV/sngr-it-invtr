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
import { EQUIPMENT_STATUSES, EQUIPMENT_TYPES } from "@/lib/equipment-types"

export function EquipmentFilters({
  departments,
}: {
  departments: { id: string; name: string }[]
}) {
  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withOptions({
      shallow: false,
      limitUrlUpdates: debounce(400),
      clearOnDefault: true,
    })
  )
  const [type, setType] = useQueryState(
    "type",
    parseAsStringEnum(EQUIPMENT_TYPES.map((t) => t.value)).withOptions({
      shallow: false,
    })
  )
  const [status, setStatus] = useQueryState(
    "status",
    parseAsStringEnum(EQUIPMENT_STATUSES.map((s) => s.value)).withOptions({
      shallow: false,
    })
  )
  const [departmentId, setDepartmentId] = useQueryState(
    "departmentId",
    parseAsString.withOptions({ shallow: false })
  )
  const [, setPage] = useQueryState("page")

  const hasFilters = !!(search || type || status || departmentId)

  function resetPage() {
    void setPage(null)
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        placeholder="Search serial number…"
        className="h-8 w-48"
        defaultValue={search ?? ""}
        onChange={(e) => {
          resetPage()
          void setSearch(e.target.value || null)
        }}
      />
      <Select
        value={type ?? ""}
        onValueChange={(v) => {
          resetPage()
          void setType(
            v ? (v as (typeof EQUIPMENT_TYPES)[number]["value"]) : null
          )
        }}
      >
        <SelectTrigger className="h-8 w-36" aria-label="Type">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          {EQUIPMENT_TYPES.map((t) => (
            <SelectItem key={t.value} value={t.value}>
              {t.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={status ?? ""}
        onValueChange={(v) => {
          resetPage()
          void setStatus(
            v ? (v as (typeof EQUIPMENT_STATUSES)[number]["value"]) : null
          )
        }}
      >
        <SelectTrigger className="h-8 w-36" aria-label="Status">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {EQUIPMENT_STATUSES.map((s) => (
            <SelectItem key={s.value} value={s.value}>
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={departmentId ?? ""}
        onValueChange={(v) => {
          resetPage()
          void setDepartmentId(v || null)
        }}
      >
        <SelectTrigger className="h-8 w-40" aria-label="Department">
          <SelectValue placeholder="Department" />
        </SelectTrigger>
        <SelectContent>
          {departments.map((d) => (
            <SelectItem key={d.id} value={d.id}>
              {d.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {hasFilters ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            resetPage()
            void setSearch(null)
            void setType(null)
            void setStatus(null)
            void setDepartmentId(null)
          }}
        >
          <Icon icon="tabler:x" /> Clear filters
        </Button>
      ) : null}
    </div>
  )
}
