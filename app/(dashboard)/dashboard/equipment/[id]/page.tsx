import Link from "next/link"
import { notFound } from "next/navigation"

import { Icon } from "@/components/icon"
import { PageContainer } from "@/components/layout/page-container"
import { EquipmentStatusBadge } from "@/components/status-badge"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EQUIPMENT_TYPES, RETURN_REASONS } from "@/lib/equipment-types"
import { getEquipmentDetail } from "@/lib/inventory-data"
import { getEquipmentTypeIcon, getProductImagePath } from "@/lib/product-images"

export const dynamic = "force-dynamic"

const TYPE_LABEL = Object.fromEntries(
  EQUIPMENT_TYPES.map((t) => [t.value, t.label])
)
const REASON_LABEL = Object.fromEntries(
  RETURN_REASONS.map((r) => [r.value, r.label])
)
const EVENT_LABEL: Record<string, string> = {
  intake: "Intake",
  return: "Return",
  handout: "Handout",
}

export default async function EquipmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const equipment = await getEquipmentDetail(Number(id))
  if (!equipment) notFound()

  const imagePath = getProductImagePath(equipment.brand, equipment.model)

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

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-4">
            <div className="bg-muted flex size-16 shrink-0 items-center justify-center rounded-lg">
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
                  className="text-muted-foreground size-8"
                />
              )}
            </div>
            <div>
              <h1 className="text-xl font-semibold">
                {equipment.brand}{" "}
                {equipment.model ?? TYPE_LABEL[equipment.type]}
              </h1>
              <p className="text-muted-foreground font-mono text-sm">
                {equipment.serialNumber}
              </p>
            </div>
          </div>
          <EquipmentStatusBadge status={equipment.status} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card size="sm" className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">
              History ({equipment.events.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {equipment.events.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No visits logged yet.
              </p>
            ) : null}
            {equipment.events.map((event) => (
              <div
                key={event.id}
                className="flex flex-col gap-2 rounded-lg border p-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-normal">
                      {EVENT_LABEL[event.type] ?? event.type}
                    </Badge>
                    {event.visit ? (
                      <Link
                        href={`/dashboard/visits/${event.visit.id}`}
                        className="hover:text-primary font-mono text-sm"
                      >
                        {event.visit.ticketNumber}
                      </Link>
                    ) : null}
                  </div>
                  <span className="text-muted-foreground text-xs">
                    {new Date(event.createdAt).toLocaleString()}
                  </span>
                </div>
                {event.visit ? (
                  <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs">
                    <span>
                      Handled by {event.visit.processedBy?.name ?? "—"}
                    </span>
                    <span>
                      {event.visit.kind === "out"
                        ? "Recipient"
                        : "Brought in by"}{" "}
                      {event.visit.counterparty?.name ?? "—"}
                    </span>
                  </div>
                ) : null}
                <div className="flex flex-wrap gap-2 text-xs">
                  {event.chargerIncluded ? (
                    <Badge variant="outline" className="font-normal">
                      Charger included
                    </Badge>
                  ) : null}
                  {event.otherAccessoriesIncluded ? (
                    <Badge variant="outline" className="font-normal">
                      Accessories included
                    </Badge>
                  ) : null}
                  {event.returnReason ? (
                    <Badge variant="outline" className="font-normal">
                      {REASON_LABEL[event.returnReason] ?? event.returnReason}
                    </Badge>
                  ) : null}
                </div>
                {event.accessoryNotes ? (
                  <p className="text-muted-foreground text-xs">
                    Accessories: {event.accessoryNotes}
                  </p>
                ) : null}
                {event.returnReasonNote ? (
                  <p className="text-muted-foreground text-xs">
                    Reason: {event.returnReasonNote}
                  </p>
                ) : null}
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card size="sm">
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm">
              <div>
                <div className="text-muted-foreground text-xs">Type</div>
                <div>{TYPE_LABEL[equipment.type] ?? equipment.type}</div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs">Department</div>
                <div>
                  {equipment.department ? (
                    <Link
                      href={`/dashboard/departments/${equipment.department.id}`}
                      className="hover:text-primary"
                    >
                      {equipment.department.name}
                    </Link>
                  ) : (
                    "IT-owned stock"
                  )}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs">
                  Current holder
                </div>
                <div>
                  {equipment.currentHolder ? (
                    <Link
                      href={`/dashboard/staff/${equipment.currentHolder.id}`}
                      className="hover:text-primary"
                    >
                      {equipment.currentHolder.name}
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
