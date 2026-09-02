"use client"

import { useEffect } from "react"

import { Button } from "@/components/ui/button"
import { Icon } from "@/components/icon"

export default function IntakeError({
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
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-3 px-4 text-center">
      <Icon icon="tabler:tool" className="size-10 text-muted-foreground" />
      <div>
        <h1 className="text-lg font-semibold">This didn&rsquo;t load right</h1>
        <p className="max-w-sm text-base text-muted-foreground">
          Nothing was submitted or lost — tap below to reload the form.
        </p>
      </div>
      <Button className="h-11 px-6 text-base" onClick={reset}>
        Reload
      </Button>
    </main>
  )
}
