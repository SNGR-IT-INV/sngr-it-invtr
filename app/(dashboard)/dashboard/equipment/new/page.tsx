import Link from "next/link"

import { Icon } from "@/components/icon"
import { PageContainer } from "@/components/layout/page-container"
import { getAllDepartments } from "@/lib/inventory-data"
import { EquipmentForm } from "./equipment-form"

export const dynamic = "force-dynamic"

export default async function NewEquipmentPage() {
  const departments = await getAllDepartments()

  return (
    <PageContainer>
      <div className="flex flex-col gap-4">
        <Link
          href="/dashboard/equipment"
          className="text-muted-foreground hover:text-foreground flex w-fit items-center gap-1 text-sm"
        >
          <Icon icon="tabler:arrow-left" />
          Back to equipment
        </Link>

        <div>
          <h1 className="text-xl font-semibold">Add equipment</h1>
          <p className="text-muted-foreground text-sm">
            Register a device directly into storage — for walk-in
            intake/returns, use the kiosk&rsquo;s In Log instead.
          </p>
        </div>
      </div>

      <div className="max-w-2xl">
        <EquipmentForm departments={departments} />
      </div>
    </PageContainer>
  )
}
