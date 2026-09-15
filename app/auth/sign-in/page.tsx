import { microsoftSsoConfigured } from "@/lib/auth"
import { SignInForm } from "./sign-in-form"

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const { next } = await searchParams
  return (
    <SignInForm
      microsoftEnabled={microsoftSsoConfigured}
      next={next && next.startsWith("/") ? next : "/dashboard"}
    />
  )
}
