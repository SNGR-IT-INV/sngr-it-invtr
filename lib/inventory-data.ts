import { db } from "@/src/prisma/db"

export async function getItStaff() {
  const it = await db.orm.public.Department.where({ name: "IT" }).first()
  if (!it) return []
  return db.orm.public.Staff.where({ departmentId: it.id, status: "active" })
    .select("id", "name", "email")
    .orderBy((s) => s.name.asc())
    .all()
}

export async function getAllActiveStaff() {
  return db.orm.public.Staff.where({ status: "active" })
    .select("id", "name", "email")
    .include("department", (d) => d.select("name"))
    .orderBy((s) => s.name.asc())
    .all()
}

export async function getAllDepartments() {
  return db.orm.public.Department.select("id", "name")
    .orderBy((d) => d.name.asc())
    .all()
}

export async function getInventoryStats() {
  const [
    totalEquipment,
    inStorage,
    handedOut,
    awaitingRepair,
    departments,
    activeStaff,
  ] = await Promise.all([
    db.orm.public.Equipment.aggregate((a) => ({ count: a.count() })),
    db.orm.public.Equipment.where({ status: "in_storage" }).aggregate((a) => ({
      count: a.count(),
    })),
    db.orm.public.Equipment.where({ status: "handed_out" }).aggregate((a) => ({
      count: a.count(),
    })),
    db.orm.public.Equipment.where({ status: "awaiting_repair" }).aggregate(
      (a) => ({
        count: a.count(),
      })
    ),
    db.orm.public.Department.aggregate((a) => ({ count: a.count() })),
    db.orm.public.Staff.where({ status: "active" }).aggregate((a) => ({
      count: a.count(),
    })),
  ])

  return {
    totalEquipment: totalEquipment.count,
    inStorage: inStorage.count,
    handedOut: handedOut.count,
    awaitingRepair: awaitingRepair.count,
    departments: departments.count,
    activeStaff: activeStaff.count,
  }
}

export async function getRecentVisits() {
  return db.orm.public.EquipmentVisit.select(
    "id",
    "ticketNumber",
    "occurredAt",
    "counterpartyNote"
  )
    .include("processedBy", (s) => s.select("name"))
    .include("counterparty", (s) => s.select("name"))
    .include("items", (i) => i.count())
    .orderBy((v) => v.occurredAt.desc())
    .limit(8)
    .all()
}

export type VisitListFilters = {
  kind: "in" | "out"
  page: number
  perPage: number
  ticket?: string
  status?: "draft" | "completed"
  dateFrom?: string
  dateTo?: string
}

export async function getVisitsPage(filters: VisitListFilters) {
  let query = db.orm.public.EquipmentVisit.where({ kind: filters.kind })

  if (filters.ticket) {
    const term = filters.ticket
    query = query.where((v) => v.ticketNumber.ilike(`%${term}%`))
  }
  if (filters.status) {
    query = query.where({ status: filters.status })
  }
  if (filters.dateFrom) {
    const from = filters.dateFrom
    query = query.where((v) => v.occurredAt.gte(from))
  }
  if (filters.dateTo) {
    // Include the whole end day.
    const to = `${filters.dateTo}T23:59:59.999Z`
    query = query.where((v) => v.occurredAt.lte(to))
  }

  const [rows, total] = await Promise.all([
    query
      .select(
        "id",
        "kind",
        "status",
        "ticketNumber",
        "occurredAt",
        "counterpartyNote"
      )
      .include("processedBy", (s) => s.select("id", "name"))
      .include("counterparty", (s) => s.select("id", "name"))
      .include("items", (i) => i.count())
      .orderBy((v) => v.occurredAt.desc())
      .offset((filters.page - 1) * filters.perPage)
      .limit(filters.perPage)
      .all(),
    query.aggregate((a) => ({ count: a.count() })),
  ])

  return { rows, total: total.count }
}

export async function getVisitDetail(id: number) {
  return db.orm.public.EquipmentVisit.where({ id })
    .include("processedBy", (s) => s.select("id", "name", "email"))
    .include("counterparty", (s) => s.select("id", "name", "email"))
    .include("items", (i) =>
      i
        .select(
          "id",
          "type",
          "chargerIncluded",
          "otherAccessoriesIncluded",
          "accessoryNotes",
          "returnReason",
          "returnReasonNote"
        )
        .include("equipment", (e) =>
          e
            .select("id", "serialNumber", "type", "brand", "model", "status")
            .include("department", (d) => d.select("id", "name"))
        )
    )
    .first()
}

// v1: pull the whole directory client-side for the serial combobox. Fine at
// current scale (near-zero rows); revisit with a server-side search endpoint
// if the equipment table grows into the thousands.
export async function getEquipmentDirectory() {
  return db.orm.public.Equipment.select(
    "id",
    "serialNumber",
    "type",
    "brand",
    "model",
    "status"
  )
    .include("department", (d) => d.select("id", "name"))
    .include("currentHolder", (h) => h.select("id", "name"))
    .orderBy((e) => e.serialNumber.asc())
    .limit(2000)
    .all()
}
