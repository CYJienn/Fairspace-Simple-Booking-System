"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Building2, Loader2, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createBrowserClient, hasBrowserSupabaseConfig } from "@/lib/supabase/browser-client"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const isSupabaseReady = hasBrowserSupabaseConfig()

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsLoading(true)
    setMessage("")
    setErrorMessage("")

    if (!isSupabaseReady) {
      setErrorMessage("Supabase public keys are missing. Add them in .env.local, then restart the dev server.")
      setIsLoading(false)
      return
    }

    const supabase = createBrowserClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/auth/callback`,
    })

    if (error) {
      setErrorMessage(error.message)
      setIsLoading(false)
      return
    }

    setMessage("If this email is registered, Supabase will send a password reset link shortly.")
    setIsLoading(false)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="p-4">
        <Link href="/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center justify-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Building2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-2xl font-semibold tracking-tight">FairSpace</span>
          </div>

          <Card className="border-border/50 shadow-lg shadow-primary/5">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-muted">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-2xl">Reset your password</CardTitle>
              <CardDescription>Enter your account email and we will send a reset link.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@university.edu"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    className="h-11"
                  />
                </div>

                <Button type="submit" className="h-11 w-full" disabled={isLoading || !isSupabaseReady}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending link...
                    </>
                  ) : (
                    "Send reset link"
                  )}
                </Button>
              </form>

              {message && <p className="mt-4 text-center text-sm text-emerald-700">{message}</p>}
              {errorMessage && <p className="mt-4 text-center text-sm text-destructive">{errorMessage}</p>}
              {!isSupabaseReady && !errorMessage && (
                <p className="mt-4 text-center text-sm text-destructive">Supabase public keys are missing in .env.local.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
