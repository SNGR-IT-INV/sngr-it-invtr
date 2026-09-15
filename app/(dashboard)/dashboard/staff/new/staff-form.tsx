"use client"

import * as React from "react"
import { useActionState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createStaff, type CreateStaffState } from "./actions"

const initialState: CreateStaffState = { status: "idle" }

export function StaffForm({
  departments,
}: {
  departments: { id: string; name: string }[]
}) {
  const router = useRouter()
  const [state, formAction, pending] = useActionState(createStaff, initialState)
  const [departmentId, setDepartmentId] = React.useState("")

  React.useEffect(() => {
    if (state.status === "success") {
      router.push(`/dashboard/staff/${state.staffId}`)
      router.refresh()
    }
  }, [state, router])

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="departmentId" value={departmentId} />

      {state.status === "error" ? (
        <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-4 py-3 text-sm">
          {state.message}
        </div>
      ) : null}

      <Card size="sm">
        <CardHeader>
          <CardTitle className="text-base">New staff member</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required placeholder="Full name" />
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="email">Email (optional)</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="name@example.com"
            />
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label>Department</Label>
            <Select
              value={departmentId}
              onValueChange={(v) => setDepartmentId(v ?? "")}
            >
              <SelectTrigger aria-label="Department" className="w-full">
                <SelectValue placeholder="Pick a department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={pending || !departmentId}>
          {pending ? "Saving…" : "Add staff member"}
        </Button>
      </div>
    </form>
  )
}
