"use client"

import Link from "next/link"

import { Button } from "@/components/ui/button"

export function PrintButton({ backHref }: { backHref: string }) {
  return (
    <div className="no-print mx-auto flex max-w-md items-center justify-between gap-3 p-4">
      <Button variant="outline" render={<Link href={backHref} />}>
        Back
      </Button>
      <Button onClick={() => window.print()}>Print label</Button>
    </div>
  )
}
