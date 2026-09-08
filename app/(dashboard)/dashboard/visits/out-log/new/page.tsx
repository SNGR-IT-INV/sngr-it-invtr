import Link from "next/link"

import { Icon } from "@/components/icon"
import { PageContainer } from "@/components/layout/page-container"
import { getAllActiveStaff, getAvailableEquipment } from "@/lib/inventory-data"
import { PrepareOutLogForm } from "./prepare-out-log-form"

// Live stock/staff on every request — this must never be prerendered as a
// static build-time snapshot.
export const dynamic = "force-dynamic"

export default async function NewOutLogPage() {
  const [allStaff, equipment] = await Promise.all([
    getAllActiveStaff(),
    getAvailableEquipment(),
  ])

  return (
    <PageContainer>
      <div className="flex flex-col gap-4">
        <Link
          href="/dashboard/visits/out-log"
          className="text-muted-foreground hover:text-foreground flex w-fit items-center gap-1 text-sm"
        >
          <Icon icon="tabler:arrow-left" />
          Back to out log
        </Link>

        <div>
          <h1 className="text-xl font-semibold">Prep a pickup</h1>
          <p className="text-muted-foreground text-sm">
            Pull equipment for a ticket ahead of time. The recipient signs for
            it later, at the kiosk, when they actually come get it.
          </p>
        </div>
      </div>

      <div className="max-w-2xl">
        <PrepareOutLogForm
          allStaff={allStaff.map((s) => ({
            id: s.id,
            name: s.name,
            department: s.department?.name ?? null,
          }))}
          equipment={equipment}
        />
      </div>
    </PageContainer>
  )
}
