import Link from "next/link"
import { notFound } from "next/navigation"

import { Icon } from "@/components/icon"
import { PageContainer } from "@/components/layout/page-container"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EquipmentStatusBadge } from "@/components/status-badge"
import { EQUIPMENT_TYPES, RETURN_REASONS } from "@/lib/equipment-types"
import { getEquipmentTypeIcon, getProductImagePath } from "@/lib/product-images"
import { getVisitDetail } from "@/lib/inventory-data"

export const dynamic = "force-dynamic"

const TYPE_LABEL = Object.fromEntries(
  EQUIPMENT_TYPES.map((t) => [t.value, t.label])
)
const REASON_LABEL = Object.fromEntries(
  RETURN_REASONS.map((r) => [r.value, r.label])
)

export default async function VisitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const visit = await getVisitDetail(Number(id))
  if (!visit) notFound()

  const backHref =
    visit.kind === "out" ? "/dashboard/visits/out-log" : "/dashboard/visits"

  return (
    <PageContainer>
      <div className="flex flex-col gap-4">
        <Link
          href={backHref}
          className="text-muted-foreground hover:text-foreground flex w-fit items-center gap-1 text-sm"
        >
          <Icon icon="tabler:arrow-left" />
          Back to {visit.kind === "out" ? "out log" : "in log"}
        </Link>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="font-mono text-xl font-semibold">
              {visit.ticketNumber ?? `Visit #${visit.id}`}
            </h1>
            <Badge variant="outline">
              {visit.kind === "out" ? "Out log" : "In log"}
            </Badge>
            {visit.status === "draft" ? (
              <Badge
                variant="outline"
                className="border-warning/40 bg-warning/20 text-amber-800 dark:text-amber-300"
              >
                Awaiting pickup
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="border-success/30 bg-success/15 text-emerald-700 dark:text-emerald-300"
              >
                Completed
              </Badge>
            )}
          </div>
          <span className="text-muted-foreground text-sm">
            {new Date(visit.occurredAt).toLocaleString()}
          </span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card size="sm" className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">
              Items ({visit.items.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {visit.items.map((item) => {
              const equipment = item.equipment
              const imagePath = getProductImagePath(
                equipment.brand,
                equipment.model
              )
              return (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row"
                >
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
                        className="text-muted-foreground size-7"
                      />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-medium">
                        {equipment.brand}{" "}
                        {equipment.model ?? TYPE_LABEL[equipment.type]}
                      </span>
                      <EquipmentStatusBadge status={equipment.status} />
                    </div>
                    <span className="text-muted-foreground font-mono text-xs">
                      {equipment.serialNumber}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {equipment.department
                        ? `${equipment.department.name} equipment`
                        : "IT-owned stock"}
                    </span>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs">
                      {item.chargerIncluded ? (
                        <Badge variant="outline" className="font-normal">
                          Charger included
                        </Badge>
                      ) : null}
                      {item.otherAccessoriesIncluded ? (
                        <Badge variant="outline" className="font-normal">
                          Accessories included
                        </Badge>
                      ) : null}
                      {item.returnReason ? (
                        <Badge variant="outline" className="font-normal">
                          {REASON_LABEL[item.returnReason] ?? item.returnReason}
                        </Badge>
                      ) : null}
                      {item.ticketNumber ? (
                        <Badge
                          variant="outline"
                          className="font-mono font-normal"
                        >
                          {item.ticketNumber}
                        </Badge>
                      ) : null}
                      {item.quoteNumber ? (
                        <Badge
                          variant="outline"
                          className="font-mono font-normal"
                        >
                          {item.quoteNumber}
                        </Badge>
                      ) : null}
                    </div>
                    {item.accessoryNotes ? (
                      <p className="text-muted-foreground text-xs">
                        Accessories: {item.accessoryNotes}
                      </p>
                    ) : null}
                    {item.returnReasonNote ? (
                      <p className="text-muted-foreground text-xs">
                        Reason: {item.returnReasonNote}
                      </p>
                    ) : null}
                    {item.intendedFor ? (
                      <p className="text-muted-foreground text-xs">
                        For: {item.intendedFor.name}
                      </p>
                    ) : null}
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card size="sm">
            <CardHeader>
              <CardTitle className="text-base">Visit details</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm">
              <div>
                <div className="text-muted-foreground text-xs">Handled by</div>
                <div>{visit.processedBy?.name ?? "—"}</div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs">
                  {visit.kind === "out" ? "Recipient" : "Brought in by"}
                </div>
                <div>
                  {visit.counterparty?.name ?? visit.counterpartyNote ?? "—"}
                </div>
              </div>
              {visit.notes ? (
                <div>
                  <div className="text-muted-foreground text-xs">Notes</div>
                  <div>{visit.notes}</div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          {/* In-log is a quick walk-in/walk-out — no signature is collected
              there, so this card would be permanently empty noise. Only
              shown for out-log, or an older in-log visit that still has
              one from before this changed. */}
          {visit.kind === "out" || visit.signatureUrl ? (
            <Card size="sm">
              <CardHeader>
                <CardTitle className="text-base">Signature</CardTitle>
              </CardHeader>
              <CardContent>
                {visit.signatureUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={visit.signatureUrl}
                    alt="Signature"
                    className="w-full rounded-lg border bg-white"
                  />
                ) : (
                  <p className="text-muted-foreground text-sm">
                    Not signed yet.
                  </p>
                )}
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </PageContainer>
  )
}
