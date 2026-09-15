import Link from "next/link"

import { Icon } from "@/components/icon"
import { PageContainer } from "@/components/layout/page-container"
import { getAllDepartments } from "@/lib/inventory-data"
import { StaffForm } from "./staff-form"

export const dynamic = "force-dynamic"

export default async function NewStaffPage() {
  const departments = await getAllDepartments()

  return (
    <PageContainer>
      <div className="flex flex-col gap-4">
        <Link
          href="/dashboard/staff"
          className="text-muted-foreground hover:text-foreground flex w-fit items-center gap-1 text-sm"
        >
          <Icon icon="tabler:arrow-left" />
          Back to staff
        </Link>

        <div>
          <h1 className="text-xl font-semibold">Add staff member</h1>
          <p className="text-muted-foreground text-sm">
            Manual entry for now — staff pickers will search Microsoft Graph
            live once that integration is cleared. Rows added here link up by
            email at that point, no re-entry needed.
          </p>
        </div>
      </div>

      <div className="max-w-2xl">
        <StaffForm departments={departments} />
      </div>
    </PageContainer>
  )
}
