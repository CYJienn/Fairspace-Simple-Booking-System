"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createBrowserClient, hasBrowserSupabaseConfig } from "@/lib/supabase/browser-client"
import { Building2, Eye, EyeOff, ArrowLeft, Loader2, ShieldCheck, GraduationCap } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [role, setRole] = useState<"student" | "admin">("student")
  const isSupabaseReady = hasBrowserSupabaseConfig()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage("")

    if (!isSupabaseReady) {
      setErrorMessage("Supabase public keys are missing. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local, then restart pnpm dev.")
      setIsLoading(false)
      return
    }

    const supabase = createBrowserClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    })

    if (error) {
      setErrorMessage(error.message)
      setIsLoading(false)
      return
    }

    if (!data.session) {
      setErrorMessage("Check your email to verify your account, then sign in again.")
      setIsLoading(false)
      return
    }

    const metadataRole =
      data.session.user.user_metadata?.role === "admin" || data.session.user.user_metadata?.role === "student"
        ? data.session.user.user_metadata.role
        : undefined
    const { data: profile, error: profileError } = await supabase
      .from("fairspace_profiles")
      .select("role")
      .eq("id", data.session.user.id)
      .maybeSingle()

    if (profileError) {
      await supabase.auth.signOut()
      window.localStorage.removeItem("fairspace-role")
      setErrorMessage("Unable to verify your account role. Please try again.")
      setIsLoading(false)
      return
    }

    const profileRole = profile?.role === "admin" || profile?.role === "student" ? profile.role : undefined
    const actualRole = metadataRole ?? profileRole ?? role

    if (actualRole !== role) {
      await supabase.auth.signOut()
      window.localStorage.removeItem("fairspace-role")
      setErrorMessage(`This account is registered as ${actualRole}. Please sign in through the ${actualRole} portal.`)
      setIsLoading(false)
      return
    }

    window.localStorage.setItem("fairspace-role", role)
    router.push("/")
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setErrorMessage("")
    if (!isSupabaseReady) {
      setErrorMessage("Supabase public keys are missing. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local, then restart pnpm dev.")
      setIsLoading(false)
      return
    }

    const supabase = createBrowserClient()
    const redirectTo = `${window.location.origin}/auth/callback`
    window.localStorage.setItem("fairspace-role", role)

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    })

    if (error) {
      setErrorMessage(error.message)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="p-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Building2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-2xl font-semibold tracking-tight">FairSpace</span>
          </div>

          <Card className="border-border/50 shadow-lg shadow-primary/5">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl">Welcome back</CardTitle>
              <CardDescription>
                Choose your portal, then sign in to continue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 grid grid-cols-2 gap-2 rounded-xl bg-muted p-1">
                <Button
                  type="button"
                  variant={role === "student" ? "default" : "ghost"}
                  className="h-11"
                  onClick={() => setRole("student")}
                >
                  <GraduationCap className="mr-2 h-4 w-4" />
                  Student
                </Button>
                <Button
                  type="button"
                  variant={role === "admin" ? "default" : "ghost"}
                  className="h-11"
                  onClick={() => setRole("admin")}
                >
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Admin
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@university.edu"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link
                      href="/forgot-password"
                      className="text-xs text-primary hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      className="h-11 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full h-11" disabled={isLoading || !isSupabaseReady}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>

              {errorMessage && (
                <p className="text-sm text-destructive text-center">{errorMessage}</p>
              )}

              {!isSupabaseReady && !errorMessage && (
                <p className="text-sm text-destructive text-center">
                  Supabase public keys are missing in .env.local.
                </p>
              )}

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <Button variant="outline" className="h-11" type="button" onClick={handleGoogleSignIn} disabled={isLoading || !isSupabaseReady}>
                  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </Button>
              </div>

              <p className="text-center text-sm text-muted-foreground mt-6">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="text-primary hover:underline font-medium">
                  Sign up
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
