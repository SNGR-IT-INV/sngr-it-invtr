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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  StaffCombobox,
  type StaffOption,
  type StaffPartyValue,
} from "@/components/staff-combobox"
import {
  EquipmentSerialCombobox,
  type EquipmentOption,
} from "@/components/equipment-serial-combobox"
import { SignaturePad } from "@/components/signature-pad"
import {
  EQUIPMENT_TYPES,
  RETURN_REASONS,
  type EquipmentTypeValue,
  type ReturnReasonValue,
} from "@/lib/equipment-types"
import { submitIntakeVisit, type IntakeFormState } from "./actions"

type ItemDraft = {
  clientId: string
  type: EquipmentTypeValue
  matchedEquipmentId: number | null
  serialNumber: string
  brand: string
  model: string
  departmentId: number | null
  chargerIncluded: boolean
  otherAccessoriesIncluded: boolean
  accessoryNotes: string
  returnReason: ReturnReasonValue | null
  returnReasonNote: string
}

function blankItem(type: EquipmentTypeValue): ItemDraft {
  return {
    clientId: crypto.randomUUID(),
    type,
    matchedEquipmentId: null,
    serialNumber: "",
    brand: "HP",
    model: "",
    departmentId: null,
    chargerIncluded: false,
    otherAccessoriesIncluded: false,
    accessoryNotes: "",
    returnReason: null,
    returnReasonNote: "",
  }
}

const initialState: IntakeFormState = { status: "idle" }

export function IntakeForm({
  itStaff,
  allStaff,
  departments,
  equipment,
}: {
  itStaff: StaffOption[]
  allStaff: StaffOption[]
  departments: { id: number; name: string }[]
  equipment: EquipmentOption[]
}) {
  const router = useRouter()
  const [state, formAction, pending] = useActionState(
    submitIntakeVisit,
    initialState
  )

  const [ticketNumber, setTicketNumber] = React.useState("")
  const [processedById, setProcessedById] = React.useState("")
  const [counterparty, setCounterparty] = React.useState<StaffPartyValue>(null)
  const [notes, setNotes] = React.useState("")
  const [signature, setSignature] = React.useState<string | null>(null)
  const [items, setItems] = React.useState<ItemDraft[]>([])

  const activeTypes = new Set(items.map((i) => i.type))

  function toggleType(type: EquipmentTypeValue, checked: boolean) {
    if (checked) {
      setItems((prev) => [...prev, blankItem(type)])
    } else {
      setItems((prev) => prev.filter((i) => i.type !== type))
    }
  }

  function addAnother(type: EquipmentTypeValue) {
    setItems((prev) => [...prev, blankItem(type)])
  }

  function removeItem(clientId: string) {
    setItems((prev) => prev.filter((i) => i.clientId !== clientId))
  }

  function updateItem(clientId: string, patch: Partial<ItemDraft>) {
    setItems((prev) =>
      prev.map((i) => (i.clientId === clientId ? { ...i, ...patch } : i))
    )
  }

  // Reset the form once per successful submission — a render-time state
  // adjustment (guarded by this tracker) rather than an effect, per React's
  // guidance on syncing local state to a changed prop/value.
  const [lastHandledVisitId, setLastHandledVisitId] = React.useState<
    number | null
  >(null)
  if (state.status === "success" && state.visitId !== lastHandledVisitId) {
    setLastHandledVisitId(state.visitId)
    setTicketNumber("")
    setProcessedById("")
    setCounterparty(null)
    setNotes("")
    setSignature(null)
    setItems([])
  }

  React.useEffect(() => {
    if (state.status === "success") {
      router.refresh()
    }
  }, [state, router])

  const itemsByType = EQUIPMENT_TYPES.map((t) => ({
    ...t,
    items: items.filter((i) => i.type === t.value),
  }))

  const returnsMissingReason = items.some(
    (i) =>
      i.matchedEquipmentId !== null &&
      (!i.returnReason ||
        (i.returnReason === "other" && !i.returnReasonNote.trim()))
  )

  const canSubmit =
    !pending &&
    items.length > 0 &&
    !!signature &&
    !!processedById &&
    !!ticketNumber.trim() &&
    !returnsMissingReason

  return (
    <form action={formAction} className="flex flex-col gap-6 pb-24">
      <input type="hidden" name="processedById" value={processedById} />
      <input
        type="hidden"
        name="counterparty"
        value={JSON.stringify(counterparty)}
      />
      <input type="hidden" name="items" value={JSON.stringify(items)} />
      <input type="hidden" name="signature" value={signature ?? ""} />

      {state.status === "error" ? (
        <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-4 py-3 text-sm">
          {state.message}
        </div>
      ) : null}
      {state.status === "success" ? (
        <div className="border-primary/30 bg-primary/10 rounded-lg border px-4 py-3 text-sm">
          Visit logged — {state.itemCount} item
          {state.itemCount === 1 ? "" : "s"} recorded. Ready for the next one.
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Visit details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ticketNumber">Ticket number</Label>
            <Input
              id="ticketNumber"
              name="ticketNumber"
              className="h-11 font-mono text-base"
              value={ticketNumber}
              onChange={(e) => setTicketNumber(e.target.value)}
              placeholder="e.g. HD-4821"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Received by</Label>
            <Select
              value={processedById}
              onValueChange={(v) => setProcessedById(v ?? "")}
            >
              <SelectTrigger
                aria-label="Received by"
                className="h-11 w-full text-base"
              >
                <SelectValue placeholder="Who's logging this?" />
              </SelectTrigger>
              <SelectContent>
                {itStaff.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label>Brought in by</Label>
            <StaffCombobox
              staff={allStaff}
              value={counterparty}
              onChange={setCounterparty}
              placeholder="Search staff — or type a name if they're not in the system"
              allowFreeText
            />
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              className="text-base"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anything worth flagging about this visit"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>What&rsquo;s coming in?</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-wrap gap-3">
            {EQUIPMENT_TYPES.map((t) => (
              <label
                key={t.value}
                className="has-[[data-checked]]:border-primary has-[[data-checked]]:bg-primary/5 flex min-h-11 cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2 text-base"
              >
                <Checkbox
                  className="size-5"
                  checked={activeTypes.has(t.value)}
                  onCheckedChange={(checked) => toggleType(t.value, checked)}
                />
                {t.label}
              </label>
            ))}
          </div>

          {itemsByType
            .filter((t) => t.items.length > 0)
            .map((typeGroup) => (
              <div key={typeGroup.value} className="flex flex-col gap-3">
                <Separator />
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">{typeGroup.label}</h3>
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-11"
                    onClick={() => addAnother(typeGroup.value)}
                  >
                    <Icon icon="tabler:plus" /> Add another{" "}
                    {typeGroup.label.toLowerCase()}
                  </Button>
                </div>

                {typeGroup.items.map((item) => (
                  <ItemCard
                    key={item.clientId}
                    item={item}
                    equipment={equipment}
                    departments={departments}
                    onChange={(patch) => updateItem(item.clientId, patch)}
                    onRemove={() => removeItem(item.clientId)}
                  />
                ))}
              </div>
            ))}

          {items.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Check off what arrived above to start logging items.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Signature</CardTitle>
        </CardHeader>
        <CardContent>
          <SignaturePad
            label={
              counterparty
                ? `Signed by ${counterparty.name}`
                : "Whoever brought this in signs here"
            }
            onChange={setSignature}
          />
        </CardContent>
      </Card>

      <div className="bg-background/95 fixed inset-x-0 bottom-0 z-40 border-t p-4 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
          <span className="text-muted-foreground text-base">
            {items.length} item{items.length === 1 ? "" : "s"}
          </span>
          <Button
            type="submit"
            className="h-14 px-8 text-base"
            disabled={!canSubmit}
          >
            {pending ? "Saving…" : "Log this visit"}
          </Button>
        </div>
      </div>
    </form>
  )
}

function ItemCard({
  item,
  equipment,
  departments,
  onChange,
  onRemove,
}: {
  item: ItemDraft
  equipment: EquipmentOption[]
  departments: { id: number; name: string }[]
  onChange: (patch: Partial<ItemDraft>) => void
  onRemove: () => void
}) {
  const isReturn = item.matchedEquipmentId !== null

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-3">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-xs">
          {isReturn
            ? "Return — already in the system"
            : "New — not seen before"}
        </span>
        <Button
          type="button"
          variant="ghost"
          className="size-11"
          onClick={onRemove}
          aria-label="Remove this item"
        >
          <Icon icon="tabler:trash" />
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label>Serial number</Label>
          <EquipmentSerialCombobox
            equipment={equipment}
            type={item.type}
            serialNumber={item.serialNumber}
            onSerialChange={(v) => onChange({ serialNumber: v })}
            onMatch={(match) =>
              onChange(
                match
                  ? {
                      matchedEquipmentId: match.id,
                      serialNumber: match.serialNumber,
                      brand: match.brand,
                      model: match.model ?? "",
                      departmentId: match.department?.id ?? null,
                    }
                  : { matchedEquipmentId: null }
              )
            }
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Brand</Label>
          <Input
            className="h-11 text-base"
            value={item.brand}
            disabled={isReturn}
            onChange={(e) => onChange({ brand: e.target.value })}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Model</Label>
          <Input
            className="h-11 text-base"
            value={item.model}
            disabled={isReturn}
            onChange={(e) => onChange({ model: e.target.value })}
          />
        </div>

        {!isReturn ? (
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label>Department</Label>
            <Select
              value={item.departmentId ? String(item.departmentId) : ""}
              onValueChange={(v) =>
                onChange({ departmentId: v ? Number(v) : null })
              }
            >
              <SelectTrigger
                aria-label="Department"
                className="h-11 w-full text-base"
              >
                <SelectValue placeholder="Which department is this for?" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={String(d.id)}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label>Why is this coming back?</Label>
            <Select
              value={item.returnReason ?? ""}
              onValueChange={(v) =>
                onChange({ returnReason: (v as ReturnReasonValue) || null })
              }
            >
              <SelectTrigger
                aria-label="Return reason"
                className="h-11 w-full text-base"
              >
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {RETURN_REASONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {item.returnReason === "other" ? (
              <Input
                className="h-11 text-base"
                value={item.returnReasonNote}
                onChange={(e) => onChange({ returnReasonNote: e.target.value })}
                placeholder="What's the reason?"
              />
            ) : null}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <label className="has-[[data-checked]]:border-warning has-[[data-checked]]:bg-warning/10 flex min-h-11 cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2 text-base">
          <Checkbox
            className="size-5"
            checked={item.chargerIncluded}
            onCheckedChange={(c) => onChange({ chargerIncluded: c })}
          />
          Charger taken too
        </label>
        <label className="has-[[data-checked]]:border-warning has-[[data-checked]]:bg-warning/10 flex min-h-11 cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2 text-base">
          <Checkbox
            className="size-5"
            checked={item.otherAccessoriesIncluded}
            onCheckedChange={(c) => onChange({ otherAccessoriesIncluded: c })}
          />
          Other accessories taken
        </label>
      </div>

      {item.chargerIncluded || item.otherAccessoriesIncluded ? (
        <div className="flex flex-col gap-1.5">
          <Label>Why the exception?</Label>
          <Input
            className="h-11 text-base"
            value={item.accessoryNotes}
            onChange={(e) => onChange({ accessoryNotes: e.target.value })}
            placeholder="e.g. no spare chargers in stock right now"
          />
        </div>
      ) : null}
    </div>
  )
}
