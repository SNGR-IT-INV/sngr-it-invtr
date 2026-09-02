import Link from "next/link"
import { notFound } from "next/navigation"

import { Icon } from "@/components/icon"
import { PageContainer } from "@/components/layout/page-container"
import { EquipmentStatusBadge } from "@/components/status-badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EQUIPMENT_TYPES } from "@/lib/equipment-types"
import { getDepartmentDetail } from "@/lib/inventory-data"
import { getEquipmentTypeIcon, getProductImagePath } from "@/lib/product-images"

export const dynamic = "force-dynamic"

const TYPE_LABEL = Object.fromEntries(
  EQUIPMENT_TYPES.map((t) => [t.value, t.label])
)

export default async function DepartmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const department = await getDepartmentDetail(Number(id))
  if (!department) notFound()

  return (
    <PageContainer>
      <div className="flex flex-col gap-4">
        <Link
          href="/dashboard/departments"
          className="text-muted-foreground hover:text-foreground flex w-fit items-center gap-1 text-sm"
        >
          <Icon icon="tabler:arrow-left" />
          Back to departments
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          {department.parent ? (
            <>
              <Link
                href={`/dashboard/departments/${department.parent.id}`}
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                {department.parent.name}
              </Link>
              <Icon
                icon="tabler:chevron-right"
                className="text-muted-foreground size-4"
              />
            </>
          ) : null}
          <h1 className="text-xl font-semibold">{department.name}</h1>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Card size="sm">
            <CardHeader>
              <CardTitle className="text-base">
                Equipment ({department.equipment.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {department.equipment.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No equipment assigned to this department.
                </p>
              ) : null}
              {department.equipment.map((equipment) => {
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
                    <span className="text-muted-foreground text-xs">
                      {equipment.currentHolder?.name ?? "In storage"}
                    </span>
                    <EquipmentStatusBadge status={equipment.status} />
                  </Link>
                )
              })}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          {department.children.length > 0 ? (
            <Card size="sm">
              <CardHeader>
                <CardTitle className="text-base">Sub-departments</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {department.children.map((child) => (
                  <Link
                    key={child.id}
                    href={`/dashboard/departments/${child.id}`}
                    className="hover:bg-muted/50 flex items-center gap-2 rounded-lg border p-2 text-sm"
                  >
                    <Icon
                      icon="tabler:building"
                      className="text-muted-foreground size-4"
                    />
                    {child.name}
                  </Link>
                ))}
              </CardContent>
            </Card>
          ) : null}

          <Card size="sm">
            <CardHeader>
              <CardTitle className="text-base">
                Active staff ({department.staff.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {department.staff.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No active staff.
                </p>
              ) : null}
              {department.staff.map((staff) => (
                <Link
                  key={staff.id}
                  href={`/dashboard/staff/${staff.id}`}
                  className="hover:bg-muted/50 flex flex-col rounded-lg border p-2"
                >
                  <span className="text-sm font-medium">{staff.name}</span>
                  <span className="text-muted-foreground text-xs">
                    {staff.email ?? "—"}
                  </span>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  )
}
