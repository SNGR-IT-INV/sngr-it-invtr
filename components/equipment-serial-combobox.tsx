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
import type { EquipmentTypeValue } from "@/lib/equipment-types"

export type EquipmentOption = {
  id: string
  serialNumber: string
  type: EquipmentTypeValue
  brand: string
  model: string | null
  status: string
  department: { id: string; name: string } | null
  currentHolder: { id: string; name: string } | null
}

export function EquipmentSerialCombobox({
  equipment,
  type,
  serialNumber,
  onSerialChange,
  onMatch,
}: {
  equipment: EquipmentOption[]
  type: EquipmentTypeValue
  serialNumber: string
  onSerialChange: (value: string) => void
  onMatch: (equipment: EquipmentOption | null) => void
}) {
  const [open, setOpen] = React.useState(false)

  const candidates = React.useMemo(
    () =>
      equipment
        .filter((e) => e.type === type)
        .filter((e) =>
          e.serialNumber
            .toLowerCase()
            .includes(serialNumber.trim().toLowerCase())
        )
        .slice(0, 30),
    [equipment, type, serialNumber]
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label="Serial number"
        className={cn(
          buttonVariants({ variant: "outline" }),
          "h-11 w-full justify-between text-base font-normal"
        )}
      >
        <span
          className={cn(
            "truncate font-mono",
            !serialNumber && "text-muted-foreground font-sans"
          )}
        >
          {serialNumber || "Scan or type serial number…"}
        </span>
        <Icon icon="tabler:selector" className="opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-(--anchor-width) p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            value={serialNumber}
            onValueChange={(v) => {
              onSerialChange(v)
              onMatch(null)
            }}
            placeholder="Scan or type serial number…"
          />
          <CommandList>
            <CommandEmpty>
              No existing match — this will be logged as new equipment.
            </CommandEmpty>
            <CommandGroup heading="Existing equipment (return)">
              {candidates.map((e) => (
                <CommandItem
                  key={e.id}
                  value={e.id}
                  onSelect={() => {
                    onSerialChange(e.serialNumber)
                    onMatch(e)
                    setOpen(false)
                  }}
                >
                  <Icon
                    icon="tabler:check"
                    className="opacity-0 data-[selected]:opacity-100"
                  />
                  <span className="flex flex-col">
                    <span className="font-mono">{e.serialNumber}</span>
                    <span className="text-muted-foreground text-xs">
                      {e.brand} {e.model ?? ""} ·{" "}
                      {e.currentHolder
                        ? `with ${e.currentHolder.name}`
                        : e.department
                          ? `${e.department.name} stock`
                          : "IT stock"}
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
