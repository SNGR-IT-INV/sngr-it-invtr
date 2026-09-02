import Link from "next/link"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  getAllActiveStaff,
  getAllDepartments,
  getEquipmentDirectory,
  getItStaff,
} from "@/lib/inventory-data"
import { IntakeForm } from "./intake-form"

// Live data (equipment/staff availability) on every request — this must
// never be prerendered as a static build-time snapshot, and there's no
// database connection available during the build step anyway.
export const dynamic = "force-dynamic"

export default async function IntakePage() {
  // TODO: gate this route behind the shared kiosk login once Microsoft SSO
  // is wired up. Whoever received the item is still picked explicitly on
  // the form below, regardless of who's logged into the device.
  const [itStaff, allStaff, departments, equipment] = await Promise.all([
    getItStaff(),
    getAllActiveStaff(),
    getAllDepartments(),
    getEquipmentDirectory(),
  ])

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <Breadcrumb className="mb-4">
        <BreadcrumbList className="text-base">
          <BreadcrumbItem>
            <BreadcrumbLink
              render={<Link href="/dashboard" />}
              className="-mx-1 -my-2.5 flex min-h-11 items-center px-1 py-2.5"
            >
              Dashboard
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>In log</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="mb-1 text-xl font-semibold">Equipment in log</h1>
      <p className="text-muted-foreground mb-6 text-sm">
        Log equipment arriving at IT — new purchases and returns together.
      </p>

      <IntakeForm
        itStaff={itStaff}
        allStaff={allStaff.map((s) => ({
          id: s.id,
          name: s.name,
          department: s.department?.name ?? null,
        }))}
        departments={departments}
        equipment={equipment}
      />
    </main>
  )
}
