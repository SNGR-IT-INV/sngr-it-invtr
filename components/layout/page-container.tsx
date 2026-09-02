export function PageContainer({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">{children}</div>
}
