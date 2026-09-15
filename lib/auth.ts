import { betterAuth } from "better-auth"
import { nextCookies } from "better-auth/next-js"
import { Pool } from "pg"

// True once real Entra credentials exist — see .env's MICROSOFT_* comments.
// Until then the provider is left out of the config entirely rather than
// registered with empty strings, so the server doesn't boot into a
// half-configured OAuth client.
export const microsoftSsoConfigured = Boolean(
  process.env["MICROSOFT_CLIENT_ID"] && process.env["MICROSOFT_CLIENT_SECRET"]
)

export const auth = betterAuth({
  database: new Pool({ connectionString: process.env["DATABASE_URL"] }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: microsoftSsoConfigured
    ? {
        microsoft: {
          clientId: process.env["MICROSOFT_CLIENT_ID"]!,
          clientSecret: process.env["MICROSOFT_CLIENT_SECRET"]!,
          tenantId: process.env["MICROSOFT_TENANT_ID"] || "common",
        },
      }
    : undefined,
  // Must come last — lets server-side auth calls (if any get added later)
  // write session cookies via next/headers instead of returning them in the
  // response body.
  plugins: [nextCookies()],
})
