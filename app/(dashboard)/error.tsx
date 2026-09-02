"use client"

import { useEffect } from "react"

import { PageContainer } from "@/components/layout/page-container"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/icon"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <PageContainer>
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
        <Icon icon="tabler:tool" className="size-8 text-muted-foreground" />
        <div>
          <h1 className="text-lg font-semibold">Something went wrong</h1>
          <p className="max-w-sm text-sm text-muted-foreground">
            This page hit an error loading its data. Nothing was changed —
            try again, and if it keeps happening, flag it to IT.
          </p>
        </div>
        <Button onClick={reset}>Try again</Button>
      </div>
    </PageContainer>
  )
}
