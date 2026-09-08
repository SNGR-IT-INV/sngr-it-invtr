"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { db } from "@/src/prisma/db"

const completeSchema = z.object({
  visitId: z.uuid(),
  processedById: z.uuid({ message: "Pick who handed it out" }),
  signature: z.string().trim().min(1, "A signature is required"),
})

export type CompleteOutLogState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success"; visitId: string }

export async function completeOutLogVisit(
  _prevState: CompleteOutLogState,
  formData: FormData
): Promise<CompleteOutLogState> {
  // TODO: once the kiosk sits behind real Microsoft SSO, verify the session
  // here too — this action is reachable directly, not just through the form.

  const raw = {
    visitId: formData.get("visitId"),
    processedById: formData.get("processedById"),
    signature: formData.get("signature"),
  }

  const parsed = completeSchema.safeParse(raw)
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "That form isn't valid.",
    }
  }

  const data = parsed.data

  try {
    const visitId = await db.transaction(async (tx) => {
      const visit = await tx.orm.public.EquipmentVisit.where({
        id: data.visitId,
        kind: "out",
        status: "draft",
      })
        .select("id", "counterpartyId")
        .include("items", (i) => i.select("id", "equipmentId"))
        .first()

      if (!visit)
        throw new Error(
          "That pickup isn't waiting to be completed anymore — someone may have already handled it."
        )

      await tx.orm.public.EquipmentVisit.where({ id: visit.id }).update({
        status: "completed",
        processedById: data.processedById,
        signatureUrl: data.signature,
        // The visit "happens" now, at handoff — not back when it was
        // prepped. Matches the paper log's habit of recording the delivery
        // date, not the day someone pulled the gear from storage.
        occurredAt: new Date().toISOString(),
      })

      for (const item of visit.items) {
        await tx.orm.public.Equipment.where({ id: item.equipmentId })
          .select("id")
          .update({
            status: "handed_out",
            currentHolderId: visit.counterpartyId,
          })
      }

      return visit.id
    })

    revalidatePath("/kiosk/out-log")
    revalidatePath("/dashboard/visits/out-log")
    revalidatePath(`/dashboard/visits/${visitId}`)
    return { status: "success", visitId }
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Something went wrong completing that pickup. Nothing was recorded — try again."
    return { status: "error", message }
  }
}
