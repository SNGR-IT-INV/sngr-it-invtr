"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { db } from "@/src/prisma/db"

const itemSchema = z.object({
  equipmentId: z.uuid(),
  chargerIncluded: z.boolean(),
  otherAccessoriesIncluded: z.boolean(),
  accessoryNotes: z.string().trim().nullable(),
})

// Unlike In Log's counterparty (which allows a free-text fallback for
// whoever physically dropped equipment off), an out-log recipient must be a
// real Staff row — Equipment.currentHolder needs a real link once the
// pickup completes, and every recipient in the real delivery logs is
// already a named person in the org.
const recipientSchema = z.object({
  kind: z.literal("staff"),
  id: z.uuid(),
  name: z.string(),
})

const draftSchema = z.object({
  ticketNumber: z.string().trim().min(1, "Ticket number is required"),
  counterparty: recipientSchema,
  notes: z.string().trim().nullable(),
  items: z.array(itemSchema).min(1, "Add at least one item"),
})

export type PrepareOutLogState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success"; visitId: string }

function parseJson(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.length === 0) return null
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

export async function createOutLogDraft(
  _prevState: PrepareOutLogState,
  formData: FormData
): Promise<PrepareOutLogState> {
  const raw = {
    ticketNumber: formData.get("ticketNumber"),
    counterparty: parseJson(formData.get("counterparty")),
    notes: formData.get("notes") || null,
    items: parseJson(formData.get("items")) ?? [],
  }

  const parsed = draftSchema.safeParse(raw)
  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    return {
      status: "error",
      message:
        issue?.path[0] === "counterparty"
          ? "Pick a recipient"
          : (issue?.message ?? "That form isn't valid."),
    }
  }

  const data = parsed.data

  try {
    const visitId = await db.transaction(async (tx) => {
      const visit = await tx.orm.public.EquipmentVisit.create({
        kind: "out",
        status: "draft",
        ticketNumber: data.ticketNumber,
        counterpartyId: data.counterparty.id,
        notes: data.notes,
      })

      for (const item of data.items) {
        // Reserve the item — flags it as spoken for between now and pickup
        // without moving it out the door yet.
        const reserved = await tx.orm.public.Equipment.where({
          id: item.equipmentId,
        })
          .select("id")
          .update({ status: "reserved" })
        if (!reserved)
          throw new Error(
            "One of those items no longer exists — try re-adding it."
          )

        await tx.orm.public.EquipmentEvent.create({
          type: "handout",
          equipmentId: reserved.id,
          visitId: visit.id,
          chargerIncluded: item.chargerIncluded,
          otherAccessoriesIncluded: item.otherAccessoriesIncluded,
          accessoryNotes: item.accessoryNotes,
          ticketNumber: data.ticketNumber,
        })
      }

      return visit.id
    })

    revalidatePath("/dashboard/visits/out-log")
    return { status: "success", visitId }
  } catch {
    return {
      status: "error",
      message:
        "Something went wrong saving that pickup. Nothing was recorded — try again.",
    }
  }
}
