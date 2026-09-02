import type { StaffPartyValue } from "@/components/staff-combobox"
import type { ItemDraft } from "./intake-form"

// Plain functions, not a hook — there's exactly one consumer (the intake
// form), so a reusable abstraction isn't earning its keep yet.

const STORAGE_KEY = "kiosk-intake-draft"

// The kiosk is walked up to by a different person every time. Silently
// re-filling a stranger's half-finished visit is actively wrong, not just
// stale — so anything older than this is treated as abandoned, not
// recoverable, and never surfaced.
const STALE_AFTER_MS = 30 * 60 * 1000

export type IntakeDraft = {
  savedAt: number
  ticketNumber: string
  processedById: string
  counterparty: StaffPartyValue
  notes: string
  signature: string | null
  items: ItemDraft[]
}

export function isDraftWorthSaving(
  draft: Omit<IntakeDraft, "savedAt">
): boolean {
  return (
    draft.ticketNumber.trim().length > 0 ||
    draft.notes.trim().length > 0 ||
    draft.signature !== null ||
    draft.counterparty !== null ||
    draft.items.length > 0
  )
}

export function saveDraft(draft: Omit<IntakeDraft, "savedAt">) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...draft, savedAt: Date.now() })
    )
  } catch {
    // Private browsing / storage disabled — draft resilience is a nice-to-
    // have, not worth surfacing an error over.
  }
}

export function loadDraft(): IntakeDraft | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const draft = JSON.parse(raw) as IntakeDraft
    if (Date.now() - draft.savedAt > STALE_AFTER_MS) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }
    return draft
  } catch {
    return null
  }
}

export function clearDraft() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Nothing to do — see saveDraft.
  }
}
