"use client"

import * as React from "react"
import { useActionState } from "react"
import { useRouter } from "next/navigation"
import { Icon } from "@/components/icon"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SignaturePad } from "@/components/signature-pad"
import type { StaffOption } from "@/components/staff-combobox"
import type { getDraftOutLogVisits } from "@/lib/inventory-data"
import { completeOutLogVisit, type CompleteOutLogState } from "./actions"

type DraftVisit = Awaited<ReturnType<typeof getDraftOutLogVisits>>[number]

const initialState: CompleteOutLogState = { status: "idle" }

export function CompleteOutLogFlow({
  itStaff,
  visits,
  initialTicket,
}: {
  itStaff: StaffOption[]
  visits: DraftVisit[]
  initialTicket: string
}) {
  const router = useRouter()
  const [state, formAction, pending] = useActionState(
    completeOutLogVisit,
    initialState
  )

  const [query, setQuery] = React.useState(initialTicket)
  const [selected, setSelected] = React.useState<DraftVisit | null>(() => {
    if (!initialTicket) return null
    const matches = visits.filter(
      (v) => v.ticketNumber?.toLowerCase() === initialTicket.toLowerCase()
    )
    return matches.length === 1 ? matches[0] : null
  })

  const [processedById, setProcessedById] = React.useState("")
  const [signature, setSignature] = React.useState<string | null>(null)

  // Reset back to search once per successful completion — a render-time
  // state adjustment (guarded by this tracker) rather than an effect, per
  // React's guidance on syncing local state to a changed value.
  const [lastCompletedVisitId, setLastCompletedVisitId] = React.useState<
    string | null
  >(null)
  if (state.status === "success" && state.visitId !== lastCompletedVisitId) {
    setLastCompletedVisitId(state.visitId)
    setSelected(null)
    setQuery("")
    setProcessedById("")
    setSignature(null)
  }

  React.useEffect(() => {
    if (state.status === "success") {
      router.refresh()
    }
  }, [state, router])

  const term = query.trim().toLowerCase()
  const matches = term
    ? visits.filter((v) => v.ticketNumber?.toLowerCase().includes(term))
    : visits

  const canSubmit = !pending && !!selected && !!processedById && !!signature

  if (!selected) {
    return (
      <div className="flex flex-col gap-4">
        {state.status === "success" ? (
          <div className="border-primary/30 bg-primary/10 rounded-lg border px-4 py-3 text-sm">
            Pickup completed — ready for the next one.
          </div>
        ) : null}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ticket-search">Ticket number</Label>
          <Input
            id="ticket-search"
            className="h-11 font-mono text-base"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by ticket…"
            autoFocus
          />
        </div>

        <div className="flex flex-col gap-2">
          {matches.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              {visits.length === 0
                ? "Nothing's waiting for pickup right now."
                : "No prepped pickups match that ticket."}
            </p>
          ) : (
            matches.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setSelected(v)}
                className="hover:border-primary hover:bg-primary/5 flex min-h-11 flex-col gap-1 rounded-lg border p-3 text-left text-base"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-medium">
                    {v.ticketNumber}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    {v.items.length} item{v.items.length === 1 ? "" : "s"}
                  </span>
                </div>
                <span className="text-muted-foreground text-sm">
                  For {v.counterparty?.name ?? "—"}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    )
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="visitId" value={selected.id} />
      <input type="hidden" name="processedById" value={processedById} />
      <input type="hidden" name="signature" value={signature ?? ""} />

      <button
        type="button"
        onClick={() => setSelected(null)}
        className="text-muted-foreground hover:text-foreground flex w-fit items-center gap-1 text-sm"
      >
        <Icon icon="tabler:arrow-left" />
        Search a different ticket
      </button>

      {state.status === "error" ? (
        <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-4 py-3 text-sm">
          {state.message}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>
            {selected.ticketNumber} — for {selected.counterparty?.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {selected.items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-0.5 rounded-lg border p-3"
            >
              <span className="font-medium">
                {item.equipment.brand} {item.equipment.model ?? ""}
              </span>
              <span className="text-muted-foreground font-mono text-xs">
                {item.equipment.serialNumber}
              </span>
              {item.chargerIncluded || item.otherAccessoriesIncluded ? (
                <span className="text-muted-foreground text-xs">
                  {[
                    item.chargerIncluded && "charger",
                    item.otherAccessoriesIncluded && "accessories",
                  ]
                    .filter(Boolean)
                    .join(", ")}{" "}
                  included
                </span>
              ) : null}
            </div>
          ))}
          {selected.notes ? (
            <p className="text-muted-foreground text-sm">{selected.notes}</p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Handed out by</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={processedById}
            onValueChange={(v) => setProcessedById(v ?? "")}
          >
            <SelectTrigger
              aria-label="Handed out by"
              className="h-11 w-full text-base"
            >
              <SelectValue placeholder="Who's completing this pickup?" />
            </SelectTrigger>
            <SelectContent>
              {itStaff.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recipient signature</CardTitle>
        </CardHeader>
        <CardContent>
          <SignaturePad
            label={`Sign to confirm receipt — ${selected.counterparty?.name ?? ""}`}
            onChange={setSignature}
          />
        </CardContent>
      </Card>

      <Button
        type="submit"
        className="h-14 px-8 text-base"
        disabled={!canSubmit}
      >
        {pending ? "Completing…" : "Complete pickup"}
      </Button>
    </form>
  )
}
