# IT Inventory

Internal tool for the IT/helpdesk department to track equipment (laptops,
desktops, monitors, docking stations, printers, iPhones, iPads) across its
whole lifecycle — intake, storage, handout, and return — replacing a
Word-document-based log.

## Stack

- **Next.js 16** (App Router, Turbopack) — see `AGENTS.md` before writing
  routing/caching code, this version has real breaking changes from what
  training data usually assumes.
- **Prisma Next** ("Prisma 8", contract-first — not classic Prisma) for the
  database layer. See `prisma-next.md` for the quick reference, and
  `node_modules/@prisma/orm-postgres/skills/prisma-8/` for the full skill
  docs when working on the schema, migrations, or queries.
- **shadcn/ui on `@base-ui/react`** (not Radix) — `components.json` has
  `"style": "base-nova"`. Component composition uses base-ui's `render`
  prop pattern (`<Button render={<Link href="..." />}>`), not Radix's
  `asChild`.
- **Icons**: `@iconify/react` (Tabler set), always imported from
  `@/components/icon`, never the bare package — see that file's comments
  for why.
- **Tables**: `@tanstack/react-table` pinned to **v8** — a fresh
  `pnpm add` would pull v9, which is an unrelated, rewritten API. Don't
  bump this without checking.
- **better-auth** for Microsoft/Entra SSO (not wired up yet — the kiosk and
  dashboard are currently ungated; see `TODO`s in `app/kiosk/intake/page.tsx`
  and `app/(dashboard)/layout.tsx`).

## Structure

- `app/(dashboard)/` — the admin/back-office surface: sidebar + header
  shell, equipment overview, in-log/out-log visit history and detail pages.
- `app/kiosk/intake/` — the shared front-desk iPad "in log" form (equipment
  intake and returns). Deliberately full-screen, no dashboard chrome — see
  `design-system/sngr-it-inventory/pages/kiosk.md` for why.
- `src/prisma/contract.prisma` — the data model. Read the comments in there
  first; several fields exist for non-obvious business reasons (equipment
  status lifecycle, the `EquipmentVisit`/`EquipmentEvent` header/line-item
  split, why `Staff` rows are never renamed).
- `design-system/sngr-it-inventory/` — design tokens and rules (palette,
  density, icon usage), generated via the `ui-ux-pro-max` skill then
  adapted by hand. Check `pages/*.md` for a page-specific override before
  falling back to `MASTER.md`.

## Getting started

```bash
pnpm install
cp .env.example .env   # fill in DATABASE_URL (Postgres 15+)
pnpm prisma-cli db init  # first time only — creates tables from the contract
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) — it redirects to
`/dashboard`.

## Common commands

```bash
pnpm dev                          # dev server
pnpm build                        # production build
pnpm lint                         # eslint
pnpm contract:emit                # regenerate contract.json/contract.d.ts after editing the schema
pnpm prisma-cli db update         # sync a schema change to the database (dev-only, no migration history)
pnpm typecheck                    # tsc --noEmit
pnpm format                       # prettier --write .
```

Git hooks (husky + lint-staged) run eslint/prettier on staged files at
commit time, and a typecheck before push.

## Deploying

Vercel. `DATABASE_URL` must be set in the project's Environment Variables —
it isn't picked up from `.env` (gitignored) automatically. Pages that read
live data are explicitly marked `export const dynamic = "force-dynamic"`
— this project isn't using Next 16's Cache Components model, so anything
without that would otherwise get statically prerendered at build time
against a database that isn't reachable from the build step.
