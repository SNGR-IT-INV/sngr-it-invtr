import { PageContainer } from "@/components/layout/page-container"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function OverviewLoading() {
  return (
    <PageContainer>
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-8 w-28" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} size="sm">
            <CardHeader>
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-7 w-12" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card size="sm">
        <CardHeader>
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-4 w-40" />
        </CardHeader>
        <CardContent className="flex flex-col gap-3 px-0">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between px-6">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </CardContent>
      </Card>
    </PageContainer>
  )
}
