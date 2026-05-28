"use client"

import { BookingProvider } from "@/lib/booking-store"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <BookingProvider>
        {children}
        <Toaster richColors closeButton />
      </BookingProvider>
    </ThemeProvider>
  )
}
