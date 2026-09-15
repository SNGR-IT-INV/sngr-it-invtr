"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { db } from "@/src/prisma/db"

// Manual entry, deliberately — this is the stand-in for a live Microsoft
// Graph staff picker until that integration is cleared (see
// lib/inventory-data.ts's getAllActiveStaff and the project notes on
// azureAdId). Once Graph is available, matching these rows to real
// directory identities by email is the migration path, not a rewrite.
const staffSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("That doesn't look like a valid email")
    .nullable(),
  departmentId: z.uuid({ message: "Pick a department" }),
})

export type CreateStaffState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success"; staffId: string }

export async function createStaff(
  _prevState: CreateStaffState,
  formData: FormData
): Promise<CreateStaffState> {
  const rawEmail = formData.get("email")
  const parsed = staffSchema.safeParse({
    name: formData.get("name"),
    email: typeof rawEmail === "string" && rawEmail.trim() ? rawEmail : null,
    departmentId: formData.get("departmentId"),
  })

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "That form isn't valid.",
    }
  }

  try {
    const staff = await db.orm.public.Staff.create({
      name: parsed.data.name,
      email: parsed.data.email,
      departmentId: parsed.data.departmentId,
      status: "active",
    })

    revalidatePath("/dashboard/staff")
    return { status: "success", staffId: staff.id }
  } catch (error) {
    const sqlState = (error as { sqlState?: string } | null)?.sqlState
    const message =
      sqlState === "23505"
        ? "Someone with that email is already in the system."
        : "Something went wrong saving that. Nothing was recorded — try again."
    return { status: "error", message }
  }
}
