// Runs better-auth's schema migration directly against the installed
// `better-auth` version's config, via its exported getMigrations() API.
//
// Why not `pnpm dlx @better-auth/cli migrate`: as of this writing,
// @better-auth/cli is only published up to 1.4.x on npm while this project
// runs better-auth 1.7.2 — the CLI generates an older, incompatible table
// shape (confirmed directly: it produced an `account` table missing the
// `issuer` column 1.7.x's runtime writes to, which then 500'd on first
// sign-up). Calling getMigrations() from the installed package instead
// guarantees the schema matches whatever version is actually running.
import "dotenv/config"
import { getMigrations } from "better-auth/db/migration"
import { auth } from "../lib/auth"

async function main() {
  const { toBeCreated, toBeAdded, runMigrations } = await getMigrations(
    auth.options
  )
  console.log(
    `Tables to create: ${toBeCreated.map((t) => t.table).join(", ") || "(none)"}`
  )
  console.log(
    `Columns to add: ${toBeAdded.map((t) => t.table).join(", ") || "(none)"}`
  )
  await runMigrations()
  console.log("Done.")
}

main().then(() => process.exit(0))
