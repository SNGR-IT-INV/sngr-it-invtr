"use client"

import { Icon } from "@/components/icon"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"

// Real, wired-up call — including the domain_hint that skips the account
// picker for a known tenant — but the button stays disabled until an Entra
// app registration exists and MICROSOFT_CLIENT_ID/SECRET are set (see
// lib/auth.ts's microsoftSsoConfigured). Nothing here needs to change once
// that happens; only the env vars do.
export function MicrosoftSignInButton({ enabled }: { enabled: boolean }) {
  async function signInWithMicrosoft() {
    // Next.js only inlines NEXT_PUBLIC_* vars for the browser bundle when
    // referenced with this exact literal dot-access form — bracket access
    // (even with a string literal) is treated as a dynamic lookup and
    // silently stays undefined client-side. See next.js env-vars docs.
    const domainHint = process.env.NEXT_PUBLIC_MICROSOFT_DOMAIN_HINT
    await authClient.signIn.social({
      provider: "microsoft",
      callbackURL: "/dashboard",
      ...(domainHint ? { additionalParams: { domain_hint: domainHint } } : {}),
    })
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      disabled={!enabled}
      onClick={signInWithMicrosoft}
      title={enabled ? undefined : "Microsoft sign-in isn't set up yet"}
    >
      <Icon icon="tabler:brand-windows" />
      Continue with Microsoft
    </Button>
  )
}
