import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const EQUIPMENT_STATUS_LABEL: Record<string, string> = {
  in_storage: "In storage",
  handed_out: "Handed out",
  awaiting_repair: "Awaiting repair",
  retired: "Retired",
}

// Background/border use the semantic tokens (--success/--warning/--primary),
// but text uses a separately-chosen darker/lighter shade of the same hue —
// the mid-tone accent itself (emerald-500/amber-500-ish) doesn't clear
// WCAG AA (4.5:1) for small text on a light tint background. text-primary
// is the exception: it's already a 600-weight indigo chosen for exactly
// this kind of use.
const EQUIPMENT_STATUS_CLASS: Record<string, string> = {
  in_storage:
    "bg-success/15 text-emerald-700 border-success/30 dark:text-emerald-300",
  handed_out: "bg-primary/15 text-primary border-primary/30",
  awaiting_repair:
    "bg-warning/20 text-amber-800 border-warning/40 dark:text-amber-300",
  retired: "bg-muted text-muted-foreground border-transparent",
}

export function EquipmentStatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={cn("font-normal", EQUIPMENT_STATUS_CLASS[status])}
    >
      {EQUIPMENT_STATUS_LABEL[status] ?? status}
    </Badge>
  )
}

const STAFF_STATUS_LABEL: Record<string, string> = {
  active: "Active",
  on_leave: "On leave",
  resigned: "Resigned",
}

const STAFF_STATUS_CLASS: Record<string, string> = {
  active: "bg-success/15 text-emerald-700 border-success/30 dark:text-emerald-300",
  on_leave: "bg-warning/20 text-amber-800 border-warning/40 dark:text-amber-300",
  resigned: "bg-muted text-muted-foreground border-transparent",
}

export function StaffStatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={cn("font-normal", STAFF_STATUS_CLASS[status])}
    >
      {STAFF_STATUS_LABEL[status] ?? status}
    </Badge>
  )
}
