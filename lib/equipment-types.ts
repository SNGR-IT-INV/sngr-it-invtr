// Kept separate from lib/inventory-data.ts on purpose: this file has no
// server-only imports, so client components can import it directly without
// dragging the Prisma Next runtime (and `pg`) into the browser bundle.
export const EQUIPMENT_TYPES = [
  { value: "laptop", label: "Laptop" },
  { value: "desktop", label: "Desktop" },
  { value: "docking_station", label: "Docking Station" },
  { value: "monitor", label: "Monitor" },
  { value: "printer", label: "Printer" },
  { value: "iphone", label: "iPhone" },
  { value: "ipad", label: "iPad" },
  { value: "other", label: "Other" },
] as const

export type EquipmentTypeValue = (typeof EQUIPMENT_TYPES)[number]["value"]

export const RETURN_REASONS = [
  { value: "loa", label: "Leave of absence" },
  { value: "resignation", label: "Resignation" },
  { value: "e_waste", label: "E-waste / end of life" },
  { value: "role_change", label: "Role / department change" },
  { value: "replacement", label: "Replacement (fault or upgrade)" },
  { value: "other", label: "Other" },
] as const

export type ReturnReasonValue = (typeof RETURN_REASONS)[number]["value"]

export const EQUIPMENT_STATUSES = [
  { value: "in_storage", label: "In storage" },
  { value: "reserved", label: "Reserved" },
  { value: "handed_out", label: "Handed out" },
  { value: "awaiting_repair", label: "Awaiting repair" },
  { value: "retired", label: "Retired" },
] as const

export type EquipmentStatusValue = (typeof EQUIPMENT_STATUSES)[number]["value"]

export const STAFF_STATUSES = [
  { value: "active", label: "Active" },
  { value: "on_leave", label: "On leave" },
  { value: "resigned", label: "Resigned" },
] as const

export type StaffStatusValue = (typeof STAFF_STATUSES)[number]["value"]
