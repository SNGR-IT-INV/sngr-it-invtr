import { Skeleton } from "@/components/ui/skeleton"

export default function IntakeLoading() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <Skeleton className="mb-1 h-6 w-56" />
      <Skeleton className="mb-6 h-4 w-72" />
      <div className="flex flex-col gap-6">
        <Skeleton className="h-56 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-56 w-full rounded-xl" />
      </div>
    </main>
  )
}
