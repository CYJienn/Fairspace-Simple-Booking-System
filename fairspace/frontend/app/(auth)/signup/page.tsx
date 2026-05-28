"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createBrowserClient, hasBrowserSupabaseConfig } from "@/lib/supabase/browser-client"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Building2, Eye, EyeOff, ArrowLeft, Loader2, CheckCircle2, GraduationCap, ShieldCheck, Upload } from "lucide-react"

const faculties = [
  "Faculty of Computing",
  "Faculty of Engineering",
  "Faculty of Science",
  "Faculty of Business",
  "Faculty of Arts & Social Sciences",
  "Faculty of Medicine",
  "Faculty of Law",
]

const passwordRequirements = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "Contains uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Contains number", test: (p: string) => /[0-9]/.test(p) },
]

const DEMO_ADMIN_KEY = "FAIRSPACE-ADMIN"

export default function SignupPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState("")
  const [role, setRole] = useState<"student" | "admin">("student")
  const isSupabaseReady = hasBrowserSupabaseConfig()
  const [formData, setFormData] = useState({
    name: "",
    matricId: "",
    faculty: "",
    email: "",
    password: "",
    avatarUrl: "",
    adminKey: "",
  })

  const readPhoto = (file?: File) => {
    if (!file) return
    if (file.size > 700_000) {
      setStatusMessage("Use a profile image smaller than 700 KB for this demo.")
      return
    }

    const reader = new FileReader()
    reader.onload = () => setFormData((current) => ({ ...current, avatarUrl: String(reader.result) }))
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setStatusMessage("")

    if (!isSupabaseReady) {
      setStatusMessage("Supabase public keys are missing. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local, then restart pnpm dev.")
      setIsLoading(false)
      return
    }

    if (role === "admin" && formData.adminKey.trim() !== DEMO_ADMIN_KEY) {
      setStatusMessage("Invalid admin key. Use FAIRSPACE-ADMIN for this demo project.")
      setIsLoading(false)
      return
    }

    const supabase = createBrowserClient()
    const redirectTo = `${window.location.origin}/auth/callback`

    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        emailRedirectTo: redirectTo,
        data: {
          name: formData.name,
          matric_id: formData.matricId,
          faculty: formData.faculty,
          role,
          avatar_url: formData.avatarUrl,
          admin_key: role === "admin" ? formData.adminKey : "",
        },
      },
    })

    if (error) {
      setStatusMessage(error.message)
      setIsLoading(false)
      return
    }

    if (!data.session) {
      setStatusMessage("Check your email to verify your account, then sign in.")
      setIsLoading(false)
      return
    }

    router.push("/")
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setStatusMessage("")
    if (!isSupabaseReady) {
      setStatusMessage("Supabase public keys are missing. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local, then restart pnpm dev.")
      setIsLoading(false)
      return
    }

    const supabase = createBrowserClient()
    const redirectTo = `${window.location.origin}/auth/callback`

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    })

    if (error) {
      setStatusMessage(error.message)
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
      <main className="flex-1 flex items-center justify-center p-4 pb-12">
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
              <CardTitle className="text-2xl">Create your account</CardTitle>
              <CardDescription>
                Enter your details to get started with FairSpace
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
                <div className="flex items-center gap-4 rounded-md border border-border p-3">
                  {formData.avatarUrl ? (
                    <img src={formData.avatarUrl} alt="Profile preview" className="h-16 w-16 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
                      Photo
                    </div>
                  )}
                  <div>
                    <Label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-muted">
                      <Upload className="h-4 w-4" />
                      Upload picture
                      <input type="file" accept="image/*" className="sr-only" onChange={(event) => readPhoto(event.target.files?.[0])} />
                    </Label>
                    <p className="mt-2 text-xs text-muted-foreground">Shown on your room bookings.</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="h-11"
                  />
                </div>

                {role === "student" ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="matricId">Matric ID</Label>
                      <Input
                        id="matricId"
                        type="text"
                        placeholder="e.g., A12345678"
                        value={formData.matricId}
                        onChange={(e) => setFormData({ ...formData, matricId: e.target.value })}
                        required
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="faculty">Faculty</Label>
                      <Select
                        value={formData.faculty}
                        onValueChange={(value) => setFormData({ ...formData, faculty: value })}
                        required
                      >
                        <SelectTrigger id="faculty" className="h-11">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {faculties.map((faculty) => (
                            <SelectItem key={faculty} value={faculty}>
                              {faculty.replace("Faculty of ", "")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="adminKey">Admin matric number key</Label>
                    <Input
                      id="adminKey"
                      type="text"
                      placeholder="FAIRSPACE-ADMIN"
                      value={formData.adminKey}
                      onChange={(e) => setFormData({ ...formData, adminKey: e.target.value })}
                      required
                      className="h-11"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">University Email</Label>
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
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
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

                  {/* Password Requirements */}
                  {formData.password && (
                    <div className="mt-3 space-y-2">
                      {passwordRequirements.map((req, i) => {
                        const passed = req.test(formData.password)
                        return (
                          <div
                            key={i}
                            className={`flex items-center gap-2 text-xs transition-colors ${
                              passed ? "text-success" : "text-muted-foreground"
                            }`}
                          >
                            <CheckCircle2 className={`h-3.5 w-3.5 ${passed ? "opacity-100" : "opacity-40"}`} />
                            {req.label}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                <Button type="submit" className="w-full h-11" disabled={isLoading || !isSupabaseReady}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  By creating an account, you agree to our{" "}
                  <Link href="#" className="text-primary hover:underline">Terms of Service</Link>
                  {" "}and{" "}
                  <Link href="#" className="text-primary hover:underline">Privacy Policy</Link>
                </p>
              </form>

              {statusMessage && (
                <p className="text-sm text-center text-destructive">{statusMessage}</p>
              )}

              {!isSupabaseReady && !statusMessage && (
                <p className="text-sm text-center text-destructive">
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
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
