import { PageContainer } from "@/components/layout/page-container"

export function ComingSoon({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <PageContainer>
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-1 text-center">
        <h1 className="text-lg font-semibold">{title}</h1>
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      </div>
    </PageContainer>
  )
}
