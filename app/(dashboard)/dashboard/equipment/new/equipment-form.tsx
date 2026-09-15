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
import { EQUIPMENT_TYPES, type EquipmentTypeValue } from "@/lib/equipment-types"
import { createEquipment, type CreateEquipmentState } from "./actions"

const initialState: CreateEquipmentState = { status: "idle" }

export function EquipmentForm({
  departments,
}: {
  departments: { id: string; name: string }[]
}) {
  const router = useRouter()
  const [state, formAction, pending] = useActionState(
    createEquipment,
    initialState
  )
  const [type, setType] = React.useState<EquipmentTypeValue | "">("")
  const [departmentId, setDepartmentId] = React.useState("")

  React.useEffect(() => {
    if (state.status === "success") {
      router.push(`/dashboard/equipment/${state.equipmentId}`)
      router.refresh()
    }
  }, [state, router])

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="departmentId" value={departmentId} />

      {state.status === "error" ? (
        <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-4 py-3 text-sm">
          {state.message}
        </div>
      ) : null}

      <Card size="sm">
        <CardHeader>
          <CardTitle className="text-base">New equipment</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label>Type</Label>
            <Select
              value={type}
              onValueChange={(v) => setType((v as EquipmentTypeValue) ?? "")}
            >
              <SelectTrigger aria-label="Type" className="w-full">
                <SelectValue placeholder="What kind of device?" />
              </SelectTrigger>
              <SelectContent>
                {EQUIPMENT_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="brand">Brand</Label>
            <Input id="brand" name="brand" required defaultValue="HP" />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="model">Model (optional)</Label>
            <Input id="model" name="model" placeholder="e.g. EliteBook 840" />
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="serialNumber">Serial number</Label>
            <Input
              id="serialNumber"
              name="serialNumber"
              required
              className="font-mono"
            />
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label>Department (optional)</Label>
            <Select
              value={departmentId}
              onValueChange={(v) => setDepartmentId(v ?? "")}
            >
              <SelectTrigger aria-label="Department" className="w-full">
                <SelectValue placeholder="Leave blank for IT-owned stock" />
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
        <Button type="submit" disabled={pending || !type}>
          {pending ? "Saving…" : "Add equipment"}
        </Button>
      </div>
    </form>
  )
}
