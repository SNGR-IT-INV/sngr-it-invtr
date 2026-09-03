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

export type StaffOption = {
  id: string
  name: string
  department?: string | null
}

export type StaffPartyValue =
  | { kind: "staff"; id: string; name: string }
  | { kind: "text"; name: string }
  | null

export function StaffCombobox({
  staff,
  value,
  onChange,
  placeholder = "Search staff…",
  allowFreeText = false,
}: {
  staff: StaffOption[]
  value: StaffPartyValue
  onChange: (value: StaffPartyValue) => void
  placeholder?: string
  allowFreeText?: boolean
}) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")

  const exactMatch = staff.some(
    (s) => s.name.toLowerCase() === query.trim().toLowerCase()
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label={placeholder}
        className={cn(
          buttonVariants({ variant: "outline" }),
          "h-11 w-full justify-between text-base font-normal"
        )}
      >
        <span className={cn("truncate", !value && "text-muted-foreground")}>
          {value ? value.name : placeholder}
        </span>
        <Icon icon="tabler:selector" className="opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-(--anchor-width) p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            value={query}
            onValueChange={setQuery}
            placeholder={placeholder}
          />
          <CommandList>
            <CommandEmpty>No one found.</CommandEmpty>
            <CommandGroup>
              {staff
                .filter((s) =>
                  s.name.toLowerCase().includes(query.trim().toLowerCase())
                )
                .slice(0, 30)
                .map((s) => (
                  <CommandItem
                    key={s.id}
                    value={s.id}
                    onSelect={() => {
                      onChange({ kind: "staff", id: s.id, name: s.name })
                      setQuery("")
                      setOpen(false)
                    }}
                  >
                    <Icon
                      icon="tabler:check"
                      className={cn(
                        value?.kind === "staff" && value.id === s.id
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    <span className="flex flex-col">
                      <span>{s.name}</span>
                      {s.department ? (
                        <span className="text-muted-foreground text-xs">
                          {s.department}
                        </span>
                      ) : null}
                    </span>
                  </CommandItem>
                ))}
            </CommandGroup>
            {allowFreeText && query.trim() && !exactMatch ? (
              <CommandGroup heading="Not in the system">
                <CommandItem
                  value={`__freetext__${query}`}
                  onSelect={() => {
                    onChange({ kind: "text", name: query.trim() })
                    setQuery("")
                    setOpen(false)
                  }}
                >
                  <Icon icon="tabler:user" />
                  Use &ldquo;{query.trim()}&rdquo;
                </CommandItem>
              </CommandGroup>
            ) : null}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
