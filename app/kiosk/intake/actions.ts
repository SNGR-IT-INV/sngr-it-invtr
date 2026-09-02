"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { db } from "@/src/prisma/db"
import { EQUIPMENT_TYPES, type EquipmentTypeValue } from "@/lib/equipment-types"

const equipmentTypeValues = EQUIPMENT_TYPES.map((t) => t.value) as [
  EquipmentTypeValue,
  ...EquipmentTypeValue[],
]

const itemSchema = z
  .object({
    type: z.enum(equipmentTypeValues),
    matchedEquipmentId: z.number().int().positive().nullable(),
    serialNumber: z.string().trim().min(1, "Serial number is required"),
    brand: z.string().trim().min(1, "Brand is required"),
    model: z.string().trim().nullable(),
    departmentId: z.number().int().positive().nullable(),
    chargerIncluded: z.boolean(),
    otherAccessoriesIncluded: z.boolean(),
    accessoryNotes: z.string().trim().nullable(),
  })
  .refine((item) => item.matchedEquipmentId !== null || item.departmentId !== null, {
    message: "Pick which department new equipment belongs to",
    path: ["departmentId"],
  })

const partySchema = z
  .union([
    z.object({ kind: z.literal("staff"), id: z.number().int().positive(), name: z.string() }),
    z.object({ kind: z.literal("text"), name: z.string().trim().min(1) }),
  ])
  .nullable()

const visitSchema = z.object({
  ticketNumber: z.string().trim().min(1, "Ticket number is required"),
  processedById: z.coerce
    .number({ message: "Pick who received it" })
    .int()
    .positive(),
  notes: z.string().trim().nullable(),
  signature: z.string().trim().min(1, "Signature is required"),
  counterparty: partySchema,
  items: z.array(itemSchema).min(1, "Add at least one item"),
})

export type IntakeFormState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success"; visitId: number; itemCount: number }

function parseJson(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.length === 0) return null
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

export async function submitIntakeVisit(
  _prevState: IntakeFormState,
  formData: FormData
): Promise<IntakeFormState> {
  // TODO: once the kiosk sits behind real Microsoft SSO, verify the session
  // here too — this action is reachable directly, not just through the form.

  const raw = {
    ticketNumber: formData.get("ticketNumber"),
    processedById: formData.get("processedById"),
    notes: formData.get("notes") || null,
    signature: formData.get("signature"),
    counterparty: parseJson(formData.get("counterparty")),
    items: parseJson(formData.get("items")) ?? [],
  }

  const parsed = visitSchema.safeParse(raw)
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "That form isn't valid.",
    }
  }

  const data = parsed.data

  try {
    const visitId = await db.transaction(async (tx) => {
      const visit = await tx.orm.public.EquipmentVisit.create({
        ticketNumber: data.ticketNumber,
        processedById: data.processedById,
        counterpartyId: data.counterparty?.kind === "staff" ? data.counterparty.id : null,
        counterpartyNote: data.counterparty?.kind === "text" ? data.counterparty.name : null,
        // Placeholder storage: the raw data: URL goes straight into the column
        // for now. Swap for a Blob upload (see project notes) without
        // touching the rest of this action — only this line changes.
        signatureUrl: data.signature,
        notes: data.notes,
      })

      for (const item of data.items) {
        let equipmentId: number
        let eventType: "intake" | "return"

        if (item.matchedEquipmentId) {
          const updated = await tx.orm.public.Equipment.where({ id: item.matchedEquipmentId })
            .select("id")
            .update({ status: "in_storage", currentHolderId: null })
          if (!updated) throw new Error("That matched equipment no longer exists.")
          equipmentId = updated.id
          eventType = "return"
        } else {
          const created = await tx.orm.public.Equipment.create({
            type: item.type,
            brand: item.brand,
            model: item.model,
            serialNumber: item.serialNumber,
            departmentId: item.departmentId,
            status: "in_storage",
          })
          equipmentId = created.id
          eventType = "intake"
        }

        await tx.orm.public.EquipmentEvent.create({
          type: eventType,
          equipmentId,
          visitId: visit.id,
          chargerIncluded: item.chargerIncluded,
          otherAccessoriesIncluded: item.otherAccessoriesIncluded,
          accessoryNotes: item.accessoryNotes,
        })
      }

      return visit.id
    })

    revalidatePath("/kiosk/intake")
    return { status: "success", visitId, itemCount: data.items.length }
  } catch (error) {
    const sqlState = (error as { sqlState?: string } | null)?.sqlState
    const message =
      sqlState === "23505"
        ? "One of those serial numbers is already logged under a different record."
        : "Something went wrong saving that visit. Nothing was recorded — try again."
    return { status: "error", message }
  }
}
