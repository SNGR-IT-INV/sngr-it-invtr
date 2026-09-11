"use client"

import * as React from "react"
import { useActionState } from "react"
import { useRouter } from "next/navigation"
import { Icon } from "@/components/icon"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  StaffCombobox,
  type StaffOption,
  type StaffPartyValue,
} from "@/components/staff-combobox"
import { AvailableEquipmentCombobox } from "@/components/available-equipment-combobox"
import type { EquipmentOption } from "@/components/equipment-serial-combobox"
import { createOutLogDraft, type PrepareOutLogState } from "./actions"

type ItemDraft = {
  clientId: string
  equipmentId: string
  serialNumber: string
  label: string
  chargerIncluded: boolean
  otherAccessoriesIncluded: boolean
  accessoryNotes: string
}

const initialState: PrepareOutLogState = { status: "idle" }

export function PrepareOutLogForm({
  allStaff,
  equipment,
}: {
  allStaff: StaffOption[]
  equipment: EquipmentOption[]
}) {
  const router = useRouter()
  const [state, formAction, pending] = useActionState(
    createOutLogDraft,
    initialState
  )

  const [ticketNumber, setTicketNumber] = React.useState("")
  const [recipient, setRecipient] = React.useState<StaffPartyValue>(null)
  const [notes, setNotes] = React.useState("")
  const [items, setItems] = React.useState<ItemDraft[]>([])

  React.useEffect(() => {
    if (state.status === "success") {
      router.push(`/dashboard/visits/${state.visitId}`)
    }
  }, [state, router])

  function addItem(e: EquipmentOption) {
    setItems((prev) => [
      ...prev,
      {
        clientId: crypto.randomUUID(),
        equipmentId: e.id,
        serialNumber: e.serialNumber,
        label: `${e.brand} ${e.model ?? ""}`.trim(),
        chargerIncluded: false,
        otherAccessoriesIncluded: false,
        accessoryNotes: "",
      },
    ])
  }

  function updateItem(clientId: string, patch: Partial<ItemDraft>) {
    setItems((prev) =>
      prev.map((i) => (i.clientId === clientId ? { ...i, ...patch } : i))
    )
  }

  function removeItem(clientId: string) {
    setItems((prev) => prev.filter((i) => i.clientId !== clientId))
  }

  const canSubmit =
    !pending &&
    ticketNumber.trim().length > 0 &&
    recipient?.kind === "staff" &&
    items.length > 0

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="ticketNumber" value={ticketNumber} />
      <input
        type="hidden"
        name="counterparty"
        value={JSON.stringify(recipient)}
      />
      <input type="hidden" name="notes" value={notes} />
      <input
        type="hidden"
        name="items"
        value={JSON.stringify(
          items.map(
            ({
              equipmentId,
              chargerIncluded,
              otherAccessoriesIncluded,
              accessoryNotes,
            }) => ({
              equipmentId,
              chargerIncluded,
              otherAccessoriesIncluded,
              accessoryNotes: accessoryNotes || null,
            })
          )
        )}
      />

      {state.status === "error" ? (
        <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-4 py-3 text-sm">
          {state.message}
        </div>
      ) : null}

      <Card size="sm">
        <CardHeader>
          <CardTitle className="text-base">Pickup details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ticket">Ticket number</Label>
            <Input
              id="ticket"
              className="h-11 font-mono text-base"
              value={ticketNumber}
              onChange={(e) => setTicketNumber(e.target.value)}
              placeholder="e.g. T-7414"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Recipient</Label>
            <StaffCombobox
              staff={allStaff}
              value={recipient}
              onChange={setRecipient}
              placeholder="Who's this for?"
            />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anything worth flagging about this pickup"
            />
          </div>
        </CardContent>
      </Card>

      <Card size="sm">
        <CardHeader>
          <CardTitle className="text-base">
            Items to prep ({items.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <AvailableEquipmentCombobox
            equipment={equipment}
            excludeIds={new Set(items.map((i) => i.equipmentId))}
            onSelect={addItem}
          />

          {items.map((item) => (
            <div
              key={item.clientId}
              className="flex flex-col gap-3 rounded-lg border p-3"
            >
              <div className="flex items-center justify-between">
                <span className="flex flex-col">
                  <span className="font-mono text-sm">{item.serialNumber}</span>
                  <span className="text-muted-foreground text-xs">
                    {item.label}
                  </span>
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  className="size-9"
                  onClick={() => removeItem(item.clientId)}
                  aria-label="Remove item"
                >
                  <Icon icon="tabler:trash" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-3">
                <label className="has-[[data-checked]]:border-warning has-[[data-checked]]:bg-warning/10 flex min-h-9 cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors duration-150">
                  <Checkbox
                    checked={item.chargerIncluded}
                    onCheckedChange={(c) =>
                      updateItem(item.clientId, { chargerIncluded: c })
                    }
                  />
                  Charger included
                </label>
                <label className="has-[[data-checked]]:border-warning has-[[data-checked]]:bg-warning/10 flex min-h-9 cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors duration-150">
                  <Checkbox
                    checked={item.otherAccessoriesIncluded}
                    onCheckedChange={(c) =>
                      updateItem(item.clientId, {
                        otherAccessoriesIncluded: c,
                      })
                    }
                  />
                  Other accessories included
                </label>
              </div>
              {item.chargerIncluded || item.otherAccessoriesIncluded ? (
                <Input
                  className="h-9 text-sm"
                  value={item.accessoryNotes}
                  onChange={(e) =>
                    updateItem(item.clientId, {
                      accessoryNotes: e.target.value,
                    })
                  }
                  placeholder="Note (optional)"
                />
              ) : null}
            </div>
          ))}

          {items.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Search above to add equipment from storage.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={!canSubmit}>
          {pending ? "Saving…" : "Prep for pickup"}
        </Button>
      </div>
    </form>
  )
}
