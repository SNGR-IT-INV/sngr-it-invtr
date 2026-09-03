import Link from "next/link"

import { Icon } from "@/components/icon"
import { PageContainer } from "@/components/layout/page-container"
import { getDepartmentsWithCounts } from "@/lib/inventory-data"

export const dynamic = "force-dynamic"

type DepartmentNode = Awaited<
  ReturnType<typeof getDepartmentsWithCounts>
>[number] & { children: DepartmentNode[] }

function buildTree(
  departments: Awaited<ReturnType<typeof getDepartmentsWithCounts>>
) {
  const nodes = new Map<string, DepartmentNode>(
    departments.map((d) => [d.id, { ...d, children: [] }])
  )
  const roots: DepartmentNode[] = []

  for (const node of nodes.values()) {
    if (node.parentId && nodes.has(node.parentId)) {
      nodes.get(node.parentId)!.children.push(node)
    } else {
      roots.push(node)
    }
  }

  return roots
}

function DepartmentRow({
  node,
  depth = 0,
}: {
  node: DepartmentNode
  depth?: number
}) {
  return (
    <div>
      <Link
        href={`/dashboard/departments/${node.id}`}
        className="hover:bg-muted/50 flex items-center justify-between gap-3 rounded-lg border p-3"
        style={{ marginLeft: depth * 24 }}
      >
        <div className="flex items-center gap-2">
          <Icon
            icon="tabler:building"
            className="text-muted-foreground size-4"
          />
          <span className="font-medium">{node.name}</span>
        </div>
        <div className="text-muted-foreground flex items-center gap-4 text-sm">
          <span>{node.staff} active staff</span>
          <span>
            {node.equipment} equipment item{node.equipment === 1 ? "" : "s"}
          </span>
          <Icon icon="tabler:chevron-right" className="size-4" />
        </div>
      </Link>
      {node.children.length > 0 ? (
        <div className="mt-2 flex flex-col gap-2">
          {node.children.map((child) => (
            <DepartmentRow key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      ) : null}
    </div>
  )
}

export default async function DepartmentsPage() {
  const departments = await getDepartmentsWithCounts()
  const tree = buildTree(departments)

  return (
    <PageContainer>
      <div>
        <h1 className="text-xl font-semibold">Departments</h1>
        <p className="text-muted-foreground text-sm">
          Departments and sub-departments, and what each one owns in storage.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        {tree.length === 0 ? (
          <p className="text-muted-foreground text-sm">No departments yet.</p>
        ) : (
          tree.map((node) => <DepartmentRow key={node.id} node={node} />)
        )}
      </div>
    </PageContainer>
  )
}
