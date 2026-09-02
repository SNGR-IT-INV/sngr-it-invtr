import Link from "next/link"
import { Icon } from "@/components/icon"

import { PageContainer } from "@/components/layout/page-container"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getInventoryStats, getRecentVisits } from "@/lib/inventory-data"

// Live counts on every request — don't let this get prerendered as a stale
// build-time snapshot (it currently only stays dynamic incidentally, via
// the dashboard layout's cookies() call).
export const dynamic = "force-dynamic"

export default async function OverviewPage() {
  const [stats, recentVisits] = await Promise.all([
    getInventoryStats(),
    getRecentVisits(),
  ])

  const cards = [
    {
      label: "In storage",
      value: stats.inStorage,
      icon: "tabler:package",
      hint: "Ready to hand out",
    },
    {
      label: "Handed out",
      value: stats.handedOut,
      icon: "tabler:device-laptop",
      hint: "Currently with staff",
    },
    {
      label: "Awaiting repair",
      value: stats.awaitingRepair,
      icon: "tabler:tool",
      hint: "Needs attention",
    },
    {
      label: "Departments",
      value: stats.departments,
      icon: "tabler:building",
      hint: `${stats.activeStaff} active staff`,
    },
  ]

  return (
    <PageContainer>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Overview</h1>
          <p className="text-muted-foreground text-sm">
            {stats.totalEquipment} piece{stats.totalEquipment === 1 ? "" : "s"}{" "}
            of equipment tracked
          </p>
        </div>
        <Button size="sm" render={<Link href="/kiosk/intake" />}>
          Open in log <Icon icon="tabler:arrow-up-right" />
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label} size="sm">
            <CardHeader>
              <CardDescription>{c.label}</CardDescription>
              <CardTitle className="font-mono text-2xl">{c.value}</CardTitle>
              <CardAction>
                <Icon icon={c.icon} className="text-muted-foreground size-4" />
              </CardAction>
            </CardHeader>
            <CardContent className="text-muted-foreground text-xs">
              {c.hint}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card size="sm">
        <CardHeader>
          <CardTitle className="text-base">Recent visits</CardTitle>
          <CardDescription>Latest intake/return log entries</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-0 px-0">
          {recentVisits.length === 0 ? (
            <p className="text-muted-foreground px-6 text-sm">
              No visits logged yet — they&rsquo;ll show up here once the kiosk
              starts getting used.
            </p>
          ) : (
            recentVisits.map((v) => (
              <div
                key={v.id}
                className="flex items-center justify-between border-t px-6 py-3 text-sm first:border-t-0"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-muted-foreground font-mono text-xs">
                    {v.ticketNumber ?? `Visit #${v.id}`}
                  </span>
                  <span>
                    {v.items} item{v.items === 1 ? "" : "s"} · brought in by{" "}
                    {v.counterparty?.name ?? v.counterpartyNote ?? "—"}
                  </span>
                </div>
                <div className="text-muted-foreground flex flex-col items-end gap-0.5 text-xs">
                  <span>
                    {v.processedBy
                      ? `received by ${v.processedBy.name}`
                      : "awaiting pickup"}
                  </span>
                  <span>{new Date(v.occurredAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </PageContainer>
  )
}
