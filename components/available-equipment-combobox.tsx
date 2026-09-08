"use client"

import * as React from "react"
import { Icon } from "@/components/icon"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { EQUIPMENT_TYPES } from "@/lib/equipment-types"
import type { EquipmentOption } from "@/components/equipment-serial-combobox"

const TYPE_LABEL = Object.fromEntries(
  EQUIPMENT_TYPES.map((t) => [t.value, t.label])
)

// Search-and-add picker for reserving specific in-storage items onto an
// out-log pickup — distinct from EquipmentSerialCombobox, which resolves a
// single scanned serial to a return/intake match instead of building up a
// multi-item list.
export function AvailableEquipmentCombobox({
  equipment,
  excludeIds,
  onSelect,
}: {
  equipment: EquipmentOption[]
  excludeIds: Set<string>
  onSelect: (equipment: EquipmentOption) => void
}) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")

  const candidates = React.useMemo(() => {
    const term = query.trim().toLowerCase()
    return equipment
      .filter((e) => e.status === "in_storage" && !excludeIds.has(e.id))
      .filter(
        (e) =>
          !term ||
          e.serialNumber.toLowerCase().includes(term) ||
          e.brand.toLowerCase().includes(term) ||
          (e.model ?? "").toLowerCase().includes(term) ||
          TYPE_LABEL[e.type]?.toLowerCase().includes(term)
      )
      .slice(0, 30)
  }, [equipment, excludeIds, query])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label="Add equipment"
        className={cn(
          buttonVariants({ variant: "outline" }),
          "h-11 w-full justify-between text-base font-normal"
        )}
      >
        <span className="text-muted-foreground truncate">
          Search serial, brand, or model to add…
        </span>
        <Icon icon="tabler:plus" className="opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-(--anchor-width) p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            value={query}
            onValueChange={setQuery}
            placeholder="Search available stock…"
          />
          <CommandList>
            <CommandEmpty>No matching in-storage equipment.</CommandEmpty>
            <CommandGroup heading="In storage">
              {candidates.map((e) => (
                <CommandItem
                  key={e.id}
                  value={e.id}
                  onSelect={() => {
                    onSelect(e)
                    setQuery("")
                    setOpen(false)
                  }}
                >
                  <span className="flex flex-col">
                    <span className="font-mono">{e.serialNumber}</span>
                    <span className="text-muted-foreground text-xs">
                      {e.brand} {e.model ?? TYPE_LABEL[e.type]}
                      {e.department
                        ? ` · ${e.department.name} stock`
                        : " · IT stock"}
                    </span>
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
