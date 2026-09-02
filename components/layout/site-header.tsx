"use client"

import Link from "next/link"
import { Fragment } from "react"
import { usePathname } from "next/navigation"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

function titleCase(segment: string) {
  return segment
    .split("-")
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(" ")
}

export function SiteHeader() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean).slice(1) // drop "dashboard"

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            {segments.length === 0 ? (
              <BreadcrumbPage>Overview</BreadcrumbPage>
            ) : (
              <BreadcrumbLink render={<Link href="/dashboard" />}>
                Overview
              </BreadcrumbLink>
            )}
          </BreadcrumbItem>
          {segments.map((segment, i) => {
            const href = "/dashboard/" + segments.slice(0, i + 1).join("/")
            const isLast = i === segments.length - 1
            return (
              <Fragment key={href}>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage>{titleCase(segment)}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink render={<Link href={href} />}>
                      {titleCase(segment)}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </Fragment>
            )
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  )
}
