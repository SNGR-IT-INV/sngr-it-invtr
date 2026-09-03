import Link from "next/link"
import { notFound } from "next/navigation"

import { Icon } from "@/components/icon"
import { PageContainer } from "@/components/layout/page-container"
import {
  EquipmentStatusBadge,
  StaffStatusBadge,
} from "@/components/status-badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EQUIPMENT_TYPES } from "@/lib/equipment-types"
import { getStaffDetail } from "@/lib/inventory-data"
import { getEquipmentTypeIcon, getProductImagePath } from "@/lib/product-images"

export const dynamic = "force-dynamic"

const TYPE_LABEL = Object.fromEntries(
  EQUIPMENT_TYPES.map((t) => [t.value, t.label])
)

export default async function StaffDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const staff = await getStaffDetail(id)
  if (!staff) notFound()

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

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">{staff.name}</h1>
            <p className="text-muted-foreground text-sm">
              {staff.email ?? "—"}
            </p>
          </div>
          <StaffStatusBadge status={staff.status} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card size="sm" className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">
              Equipment held ({staff.heldEquipment.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {staff.heldEquipment.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                Not currently holding any equipment.
              </p>
            ) : null}
            {staff.heldEquipment.map((equipment) => {
              const imagePath = getProductImagePath(
                equipment.brand,
                equipment.model
              )
              return (
                <Link
                  key={equipment.id}
                  href={`/dashboard/equipment/${equipment.id}`}
                  className="hover:bg-muted/50 flex items-center gap-3 rounded-lg border p-3"
                >
                  <div className="bg-muted flex size-12 shrink-0 items-center justify-center rounded-lg">
                    {imagePath ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imagePath}
                        alt={`${equipment.brand} ${equipment.model ?? ""}`}
                        className="size-full rounded-lg object-contain"
                      />
                    ) : (
                      <Icon
                        icon={getEquipmentTypeIcon(equipment.type)}
                        className="text-muted-foreground size-6"
                      />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-0.5">
                    <span className="font-medium">
                      {equipment.brand}{" "}
                      {equipment.model ?? TYPE_LABEL[equipment.type]}
                    </span>
                    <span className="text-muted-foreground font-mono text-xs">
                      {equipment.serialNumber}
                    </span>
                  </div>
                  <EquipmentStatusBadge status={equipment.status} />
                </Link>
              )
            })}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card size="sm">
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm">
              <div>
                <div className="text-muted-foreground text-xs">Department</div>
                <div>
                  {staff.department ? (
                    <Link
                      href={`/dashboard/departments/${staff.department.id}`}
                      className="hover:text-primary"
                    >
                      {staff.department.name}
                    </Link>
                  ) : (
                    "—"
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  )
}
