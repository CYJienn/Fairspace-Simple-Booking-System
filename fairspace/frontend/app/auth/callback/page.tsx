"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createBrowserClient, hasBrowserSupabaseConfig } from "@/lib/supabase/browser-client"
import { Button } from "@/components/ui/button"

type PortalRole = "student" | "admin"
const roleMismatchMessage = "This account is either not registered or the selected portal is incorrect."

function isPortalRole(value: unknown): value is PortalRole {
  return value === "student" || value === "admin"
}

export default function AuthCallbackPage() {
  const router = useRouter()
  const [status, setStatus] = useState("Finishing sign-in...")

  useEffect(() => {
    const verifyPortalRole = async (supabase: ReturnType<typeof createBrowserClient>, sessionUser: { id: string; email?: string; user_metadata?: Record<string, unknown> }) => {
      const selectedRole = window.localStorage.getItem("fairspace-role")
      if (selectedRole !== "student" && selectedRole !== "admin") return true

      const metadataRole = isPortalRole(sessionUser.user_metadata?.role) ? sessionUser.user_metadata.role : undefined
      const { data: profile, error } = await supabase
        .from("fairspace_profiles")
        .select("role, email")
        .or(`id.eq.${sessionUser.id},email.eq.${String(sessionUser.email ?? "").toLowerCase()}`)
        .limit(1)
        .maybeSingle()

      if (error) {
        await supabase.auth.signOut()
        window.localStorage.removeItem("fairspace-role")
        setStatus("Unable to verify your account role. Please try again.")
        return false
      }

      const profileRole = isPortalRole(profile?.role) ? profile.role : undefined
      const actualRole = profileRole ?? metadataRole

      if (!actualRole) {
        await supabase.auth.signOut()
        window.localStorage.removeItem("fairspace-role")
        setStatus("Unable to verify this account role. Please create an account first.")
        return false
      }

      if (actualRole !== selectedRole) {
        await supabase.auth.signOut()
        window.localStorage.removeItem("fairspace-role")
        setStatus(roleMismatchMessage)
        return false
      }

      return true
    }

    const run = async () => {
      if (!hasBrowserSupabaseConfig()) {
        setStatus("Supabase public keys are missing. Add them in .env.local, then restart the dev server.")
        return
      }

      const supabase = createBrowserClient()
      const params = new URLSearchParams(window.location.search)
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""))
      const errorParam = params.get("error") || hashParams.get("error")
      const errorDescription = params.get("error_description") || hashParams.get("error_description")
      const errorCode = params.get("error_code") || hashParams.get("error_code")

      if (errorParam || errorDescription || errorCode) {
        const details = [errorParam, errorCode, errorDescription].filter(Boolean).join(" | ")
        setStatus(details || "Sign-in failed. Please try again.")
        return
      }
      const code = params.get("code")

      if (!code) {
        const accessToken = hashParams.get("access_token")
        const refreshToken = hashParams.get("refresh_token")

        if (accessToken || refreshToken) {
          if (!accessToken || !refreshToken) {
            setStatus("Missing tokens in URL. Please try signing in again.")
            return
          }

          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })

          if (error) {
            setStatus(error.message)
            return
          }

          if (!data.session) {
            setStatus("Sign-in completed, but no session was created. Please try again.")
            return
          }

          if (!(await verifyPortalRole(supabase, data.session.user))) return
          router.replace("/")
          return
        }

        setStatus("Missing auth code. Please try signing in again.")
        return
      }

      const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

      if (exchangeError) {
        setStatus(exchangeError.message)
        return
      }

      if (!exchangeData?.session) {
        setStatus("Sign-in completed, but no session was created. Please try again.")
        return
      }

      if (!(await verifyPortalRole(supabase, exchangeData.session.user))) return
      router.replace("/")
    }

    run().catch((error) => {
      setStatus(error?.message || "Sign-in failed. Please try again.")
    })
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center space-y-4">
        <p className="text-sm text-muted-foreground">{status}</p>
        {status !== "Finishing sign-in..." && (
          <Button asChild>
            <Link href="/login">Back to sign in</Link>
          </Button>
        )}
      </div>
    </div>
  )
}
