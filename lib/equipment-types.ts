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
