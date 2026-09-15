"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { db } from "@/src/prisma/db"
import { EQUIPMENT_TYPES, type EquipmentTypeValue } from "@/lib/equipment-types"

const equipmentTypeValues = EQUIPMENT_TYPES.map((t) => t.value) as [
  EquipmentTypeValue,
  ...EquipmentTypeValue[],
]

// A direct "register this into storage" form — distinct from the kiosk's
// In Log intake, which always ties a new item to a visit/event for the
// walk-in audit trail. This is for stock that just needs to exist in the
// system (pre-registering an order, entering backlog one device at a time
// — see HANDOFF.md's bulk-import decision for why this stays one-at-a-time).
const equipmentSchema = z.object({
  type: z.enum(equipmentTypeValues),
  brand: z.string().trim().min(1, "Brand is required"),
  model: z.string().trim().nullable(),
  serialNumber: z.string().trim().min(1, "Serial number is required"),
  departmentId: z.uuid().nullable(),
})

export type CreateEquipmentState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success"; equipmentId: string }

export async function createEquipment(
  _prevState: CreateEquipmentState,
  formData: FormData
): Promise<CreateEquipmentState> {
  const rawModel = formData.get("model")
  const rawDepartmentId = formData.get("departmentId")
  const parsed = equipmentSchema.safeParse({
    type: formData.get("type"),
    brand: formData.get("brand"),
    model: typeof rawModel === "string" && rawModel.trim() ? rawModel : null,
    serialNumber: formData.get("serialNumber"),
    departmentId:
      typeof rawDepartmentId === "string" && rawDepartmentId
        ? rawDepartmentId
        : null,
  })

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "That form isn't valid.",
    }
  }

  try {
    const equipment = await db.orm.public.Equipment.create({
      type: parsed.data.type,
      brand: parsed.data.brand,
      model: parsed.data.model,
      serialNumber: parsed.data.serialNumber,
      departmentId: parsed.data.departmentId,
      status: "in_storage",
    })

    revalidatePath("/dashboard/equipment")
    return { status: "success", equipmentId: equipment.id }
  } catch (error) {
    const sqlState = (error as { sqlState?: string } | null)?.sqlState
    const message =
      sqlState === "23505"
        ? "That serial number is already logged under a different record."
        : "Something went wrong saving that. Nothing was recorded — try again."
    return { status: "error", message }
  }
}
