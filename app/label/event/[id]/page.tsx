import { headers } from "next/headers"
import { notFound } from "next/navigation"
import QRCode from "qrcode"

import { EQUIPMENT_TYPES, RETURN_REASONS } from "@/lib/equipment-types"
import { getEventForLabel } from "@/lib/inventory-data"

import { PrintButton } from "./print-button"

export const dynamic = "force-dynamic"

const TYPE_LABEL = Object.fromEntries(
  EQUIPMENT_TYPES.map((t) => [t.value, t.label])
)
const REASON_LABEL = Object.fromEntries(
  RETURN_REASONS.map((r) => [r.value, r.label])
)

export default async function EquipmentLabelPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const event = await getEventForLabel(id)
  if (!event) notFound()

  const equipment = event.equipment
  const host = (await headers()).get("host")
  const detailUrl = `https://${host}/dashboard/equipment/${equipment.id}`
  const qrSvg = await QRCode.toString(detailUrl, {
    type: "svg",
    margin: 0,
    color: { dark: "#000000", light: "#0000" },
  })

  const forLabel =
    event.intendedFor?.name ?? equipment.department?.name ?? "IT storage"

  return (
    <>
      {/* Physical label size — S-11288 (Dymo standard address-label size).
          Plain black on transparent: the stock is clear plastic, so a
          tinted/colored background doesn't belong here. */}
      <style>{`
        @page { size: 3.5in 1.125in; margin: 0.05in; }
        @media print { .no-print { display: none !important; } }
      `}</style>

      <div
        className="mx-auto flex items-stretch gap-[0.1in] p-[0.05in] text-black"
        style={{ width: "3.4in", height: "1.025in" }}
      >
        <div
          className="shrink-0 [&>svg]:h-full [&>svg]:w-full"
          style={{ width: "0.9in", height: "0.9in" }}
          dangerouslySetInnerHTML={{ __html: qrSvg }}
        />
        <div className="flex min-w-0 flex-col justify-center gap-[0.02in] overflow-hidden">
          <span className="truncate text-[9pt] font-bold">
            {equipment.brand} {equipment.model ?? TYPE_LABEL[equipment.type]}
          </span>
          <span className="truncate font-mono text-[8pt]">
            {equipment.serialNumber}
          </span>
          <span className="truncate text-[7pt]">
            Ticket: {event.ticketNumber ?? "—"}
            {event.quoteNumber ? ` · Quote: ${event.quoteNumber}` : ""}
          </span>
          <span className="truncate text-[7pt]">For: {forLabel}</span>
          {event.returnReason ? (
            <span className="truncate text-[7pt]">
              Reason: {REASON_LABEL[event.returnReason] ?? event.returnReason}
            </span>
          ) : null}
        </div>
      </div>

      <PrintButton backHref={`/dashboard/equipment/${equipment.id}`} />
    </>
  )
}
