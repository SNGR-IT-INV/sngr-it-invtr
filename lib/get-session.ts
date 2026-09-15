import { headers } from "next/headers"
import { auth } from "@/lib/auth"

// Thin wrapper so Server Components don't each re-derive the headers() call.
export async function getSession() {
  return auth.api.getSession({ headers: await headers() })
}
