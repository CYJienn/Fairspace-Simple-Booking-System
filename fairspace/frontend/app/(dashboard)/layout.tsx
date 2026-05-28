"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Building2,
  LayoutDashboard,
  Calendar,
  DoorOpen,
  FileBarChart,
  BarChart3,
  Shield,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Bookmark,
} from "lucide-react"
import { NotificationDropdown } from "@/components/notification-dropdown"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Bookings", href: "/dashboard/bookings", icon: Bookmark },
  { name: "Calendar", href: "/dashboard/calendar", icon: Calendar },
  { name: "Rooms", href: "/dashboard/rooms", icon: DoorOpen },
  { name: "Reports", href: "/dashboard/reports", icon: FileBarChart },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Admin Panel", href: "/dashboard/admin", icon: Shield },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [role, setRole] = useState<"student" | "admin">("student")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const visibleNavigation = role === "admin"
    ? navigation
    : navigation.filter((item) => item.href !== "/dashboard/admin")

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out",
          sidebarCollapsed ? "w-[72px]" : "w-64",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Sidebar Header */}
          <div className={cn(
            "flex h-16 items-center border-b border-sidebar-border px-4",
            sidebarCollapsed ? "justify-center" : "justify-between"
          )}>
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sidebar-primary">
                <Building2 className="h-5 w-5 text-sidebar-primary-foreground" />
              </div>
              {!sidebarCollapsed && (
                <span className="text-lg font-semibold text-sidebar-foreground">FairSpace</span>
              )}
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {visibleNavigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                    sidebarCollapsed && "justify-center px-2"
                  )}
                  title={sidebarCollapsed ? item.name : undefined}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!sidebarCollapsed && <span>{item.name}</span>}
                </Link>
              )
            })}
          </nav>

          {/* Collapse Button */}
          <div className="hidden lg:block px-3 pb-4">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={cn(
                "flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors",
                sidebarCollapsed && "justify-center px-2"
              )}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <>
                  <ChevronLeft className="h-5 w-5" />
                  <span>Collapse</span>
                </>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div
        className={cn(
          "transition-all duration-300 ease-in-out",
          sidebarCollapsed ? "lg:pl-[72px]" : "lg:pl-64"
        )}
      >
        {/* Top Navigation */}
        <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/95 backdrop-blur-xl">
          <div className="flex h-full items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-accent text-foreground"
              >
                <Menu className="h-5 w-5" />
              </button>
              <h1 className="text-lg font-semibold hidden sm:block">
                {visibleNavigation.find((item) => pathname === item.href || pathname.startsWith(item.href + "/"))?.name || "Dashboard"}
              </h1>
              <Badge variant="outline" className="hidden sm:inline-flex capitalize">
                {role}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              {/* Notifications */}
              <NotificationDropdown />

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src="/avatar.jpg" alt="User" />
                      <AvatarFallback className="bg-primary/10 text-primary">SC</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">Sarah Chen</p>
                      <p className="text-xs text-muted-foreground">sarah@university.edu</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setRole(role === "admin" ? "student" : "admin")}>
                    <Shield className="mr-2 h-4 w-4" />
                    Switch to {role === "admin" ? "Student" : "Admin"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive focus:text-destructive" asChild>
                    <Link href="/">
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
