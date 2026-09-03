// Seed data for local/dev use. Department and staff names are drawn from
// the user's real 2026-2027 delivery log (shared during the in-log
// rework), not invented — matches actual org structure. Run with
// `pnpm seed`. Guarded to refuse running against a non-empty database so
// it can't silently duplicate rows.
import { db } from "./db"

function daysAgo(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

async function main() {
  const existing = await db.orm.public.Department.first()
  if (existing) {
    console.error(
      "Database already has data — refusing to seed (would duplicate rows). Truncate first if you want a clean reseed."
    )
    process.exit(1)
  }

  await db.transaction(async (tx) => {
    // --- Departments -------------------------------------------------
    const departmentNames = [
      "IT",
      "HR",
      "Senior Support Hub",
      "Lands & Resources",
      "PW",
      "DWP",
      "SocServ",
      "Therapy",
    ] as const
    const departments = Object.fromEntries(
      await Promise.all(
        departmentNames.map(async (name) => [
          name,
          await tx.orm.public.Department.create({ name }),
        ])
      )
    ) as Record<(typeof departmentNames)[number], { id: string }>

    // --- Staff ---------------------------------------------------------
    // IT staff (the "To" / recipient column in the real log) plus one
    // department contact per department, matching real quote/ticket rows.
    const staffSeed = [
      { name: "Barb", department: "IT" },
      { name: "Eric", department: "IT" },
      { name: "Bug", department: "IT" },
      { name: "Mary Ann Aldis", department: "HR" },
      { name: "Kailyn", department: "Senior Support Hub" },
      { name: "Marcie", department: "Lands & Resources" },
      { name: "Mike Montour", department: "PW" },
      { name: "Rhonda Lindsay", department: "DWP" },
      { name: "Jennifer Dawson", department: "SocServ" },
      { name: "Christal Maracle", department: "Therapy" },
    ] as const
    const staff = Object.fromEntries(
      await Promise.all(
        staffSeed.map(async (s) => [
          s.name,
          await tx.orm.public.Staff.create({
            name: s.name,
            departmentId: departments[s.department].id,
          }),
        ])
      )
    ) as Record<(typeof staffSeed)[number]["name"], { id: string }>

    // --- Equipment -------------------------------------------------
    // Real serials from the log where available. Status/currentHolder set
    // directly to give a realistic mixed starting state (some out, some
    // in storage, one in repair, one retired) without needing an Out Log
    // flow (not built yet) to move them there.
    const equipmentSeed = [
      {
        serialNumber: "2MQ525XL9LX",
        type: "docking_station",
        model: "HP TB4 Ultra 180W G6 Dock",
        department: "DWP",
        status: "handed_out",
        holder: "Rhonda Lindsay",
      },
      {
        serialNumber: "2MQ526Z64B",
        type: "docking_station",
        model: "HP TB4 Ultra 180W G6 Dock",
        department: "DWP",
        status: "in_storage",
      },
      {
        serialNumber: "2MQ525X5CJ",
        type: "docking_station",
        model: "HP TB4 Ultra 180W G6 Dock",
        department: "SocServ",
        status: "handed_out",
        holder: "Jennifer Dawson",
      },
      {
        serialNumber: "2MQ525X6FQ",
        type: "docking_station",
        model: "HP TB4 Ultra 180W G6 Dock",
        department: "SocServ",
        status: "in_storage",
      },
      {
        serialNumber: "2MQ528Z4V4",
        type: "docking_station",
        model: "HP TB4 Ultra 180W G6 Dock",
        department: "Senior Support Hub",
        status: "handed_out",
        holder: "Kailyn",
      },
      {
        serialNumber: "2MQ532Z1Y1",
        type: "docking_station",
        model: "HP TB4 Ultra 180W G6 Dock",
        department: "Senior Support Hub",
        status: "in_storage",
      },
      {
        serialNumber: "2MQ532Z2VS",
        type: "docking_station",
        model: "HP TB4 Ultra 180W G6 Dock",
        department: "Lands & Resources",
        status: "handed_out",
        holder: "Marcie",
      },
      {
        serialNumber: "2MQ525X69D",
        type: "docking_station",
        model: "HP TB4 Ultra 180W G6 Dock",
        department: "Lands & Resources",
        status: "in_storage",
      },
      {
        serialNumber: "VNG54903CN",
        type: "monitor",
        model: "HP E22 G5 FHD",
        department: "DWP",
        status: "in_storage",
      },
      {
        serialNumber: "VNG54903FD",
        type: "monitor",
        model: "HP E22 G5 FHD",
        department: "DWP",
        status: "in_storage",
      },
      {
        serialNumber: "VNG54903DV",
        type: "monitor",
        model: "HP E22 G5 FHD",
        department: "Senior Support Hub",
        status: "handed_out",
        holder: "Kailyn",
      },
      {
        serialNumber: "VNG54903FB",
        type: "monitor",
        model: "HP E22 G5 FHD",
        department: "SocServ",
        status: "in_storage",
      },
      {
        serialNumber: "VNG54903FF",
        type: "monitor",
        model: "HP E22 G5 FHD",
        department: "Therapy",
        status: "handed_out",
        holder: "Christal Maracle",
      },
      {
        serialNumber: "2MQ609118S",
        type: "laptop",
        model: "EliteBook 840 U5",
        department: "PW",
        status: "handed_out",
        holder: "Mike Montour",
      },
      {
        serialNumber: "2MQ53100VN",
        type: "laptop",
        model: "EliteBook G11",
        department: "IT",
        status: "in_storage",
      },
      {
        serialNumber: "5CG04561RH",
        type: "laptop",
        model: "EliteBook G6",
        department: "IT",
        status: "awaiting_repair",
      },
      {
        serialNumber: "5CG10574O9",
        type: "laptop",
        model: "EliteBook 840",
        department: "IT",
        status: "retired",
      },
      {
        serialNumber: "5CG31049KF",
        type: "iphone",
        model: "iPhone 15",
        department: "HR",
        status: "in_storage",
      },
      {
        serialNumber: "F2LN8Q3JKP",
        type: "iphone",
        model: "iPhone 8",
        department: "SocServ",
        status: "in_storage",
      },
    ] as const

    const equipment = Object.fromEntries(
      await Promise.all(
        equipmentSeed.map(async (e) => [
          e.serialNumber,
          await tx.orm.public.Equipment.create({
            type: e.type,
            model: e.model,
            serialNumber: e.serialNumber,
            departmentId: departments[e.department].id,
            status: e.status,
            currentHolderId:
              "holder" in e ? staff[e.holder as keyof typeof staff].id : null,
          }),
        ])
      )
    ) as Record<string, { id: string }>

    // --- Visit history (In Log) -------------------------------------
    // Supplier delivery: one physical drop-off, several unrelated
    // tickets/quotes/recipients — the exact real-world shape that drove
    // moving ticket/quote to per-item.
    const audcompVisit = await tx.orm.public.EquipmentVisit.create({
      kind: "in",
      processedById: staff.Barb.id,
      counterpartyNote: "Audcomp (courier delivery)",
      occurredAt: daysAgo(9),
    })
    const audcompItems = [
      {
        serial: "2MQ525XL9LX",
        ticket: "T-5253",
        quote: "Q-17832",
        holder: "Rhonda Lindsay",
      },
      {
        serial: "2MQ525X5CJ",
        ticket: "T-5220",
        quote: "Q-17865",
        holder: "Jennifer Dawson",
      },
      {
        serial: "2MQ528Z4V4",
        ticket: "T-5215",
        quote: "Q-17754",
        holder: "Kailyn",
      },
      {
        serial: "2MQ532Z2VS",
        ticket: "T-5138",
        quote: "Q-17687",
        holder: "Marcie",
      },
    ]
    for (const item of audcompItems) {
      await tx.orm.public.EquipmentEvent.create({
        type: "intake",
        equipmentId: equipment[item.serial].id,
        visitId: audcompVisit.id,
        ticketNumber: item.ticket,
        quoteNumber: item.quote,
        intendedForId: staff[item.holder as keyof typeof staff].id,
      })
    }

    // Monitor batch, a few days later — same supplier, different tickets.
    const monitorVisit = await tx.orm.public.EquipmentVisit.create({
      kind: "in",
      processedById: staff.Bug.id,
      counterpartyNote: "Audcomp (courier delivery)",
      occurredAt: daysAgo(3),
    })
    const monitorItems = [
      { serial: "VNG54903DV", ticket: "T-5215", holder: "Kailyn" },
      { serial: "VNG54903FF", ticket: "T-5289", holder: "Christal Maracle" },
    ]
    for (const item of monitorItems) {
      await tx.orm.public.EquipmentEvent.create({
        type: "intake",
        equipmentId: equipment[item.serial].id,
        visitId: monitorVisit.id,
        ticketNumber: item.ticket,
        quoteNumber: "Q-17904",
        intendedForId: staff[item.holder as keyof typeof staff].id,
      })
    }

    // HR return — a departing/replaced laptop, handled by Eric.
    const hrReturnVisit = await tx.orm.public.EquipmentVisit.create({
      kind: "in",
      processedById: staff.Eric.id,
      counterpartyId: staff["Mary Ann Aldis"].id,
      occurredAt: daysAgo(1),
    })
    await tx.orm.public.EquipmentEvent.create({
      type: "return",
      equipmentId: equipment["5CG10574O9"].id,
      visitId: hrReturnVisit.id,
      ticketNumber: "T-3486",
      returnReason: "e_waste",
    })

    // Simple walk-in return, counterparty not in the system.
    const walkInVisit = await tx.orm.public.EquipmentVisit.create({
      kind: "in",
      processedById: staff.Barb.id,
      counterpartyNote: "Taylor Hill",
      occurredAt: daysAgo(0),
    })
    await tx.orm.public.EquipmentEvent.create({
      type: "return",
      equipmentId: equipment["5CG31049KF"].id,
      visitId: walkInVisit.id,
      ticketNumber: "T-5497",
      returnReason: "replacement",
    })
  })

  console.log(
    "Seeded 8 departments, 10 staff, 19 equipment, 4 visits (7 events)."
  )
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
