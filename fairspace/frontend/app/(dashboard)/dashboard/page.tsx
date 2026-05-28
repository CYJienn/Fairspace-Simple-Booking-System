"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  DoorOpen,
  TrendingUp,
  Users,
} from "lucide-react"
import {
  formatDateLabel,
  getBookingDurationMinutes,
  getRoomName,
  getUpcomingBookings,
} from "@/lib/booking-data"
import { useBookingStore } from "@/lib/booking-store"

export default function DashboardPage() {
  const { bookings, rooms } = useBookingStore()
  const upcomingBookings = getUpcomingBookings(bookings).slice(0, 3)
  const checkedIn = bookings.filter((booking) => booking.checkInStatus === "checked-in").length
  const checkInRate = bookings.length ? Math.round((checkedIn / bookings.length) * 100) : 0
  const activeBookings = bookings.filter((booking) => booking.status === "confirmed" || booking.status === "pending")
  const hoursBooked = Math.round(
    bookings.reduce((total, booking) => total + getBookingDurationMinutes(booking) / 60, 0),
  )
  const groupSessions = bookings.filter((booking) => booking.participants.length > 1).length

  const stats = [
    {
      title: "Active Bookings",
      value: String(activeBookings.length),
      description: `${upcomingBookings.length} next on deck`,
      icon: Calendar,
      trend: "+12%",
    },
    {
      title: "Check-in Rate",
      value: `${checkInRate}%`,
      description: "Demo account history",
      icon: CheckCircle2,
      trend: "+2%",
    },
    {
      title: "Hours Booked",
      value: String(hoursBooked),
      description: "Across all interview rooms",
      icon: Clock,
      trend: "+8%",
    },
    {
      title: "Group Sessions",
      value: String(groupSessions),
      description: "With candidates or panelists",
      icon: Users,
      trend: "+15%",
    },
  ]

  const recentActivity = bookings
    .flatMap((booking) =>
      booking.timeline.slice(-2).map((event) => ({
        action: event.action,
        time: event.time,
        roomId: booking.roomId,
      })),
    )
    .slice(-5)
    .reverse()

  const quickActions = [
    { title: "Book Interview Slot", href: "/dashboard/calendar", icon: Calendar },
    { title: "View Spaces", href: "/dashboard/rooms", icon: DoorOpen },
    { title: "My Bookings", href: "/dashboard/bookings", icon: Clock },
  ]

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Welcome back, Sarah</h1>
          <p className="text-muted-foreground mt-1">
            Manage interview slots, candidate sessions, and room usage from one place.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/calendar">
            <Calendar className="mr-2 h-4 w-4" />
            New Booking
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex items-center gap-1 text-xs font-medium text-success">
                  <TrendingUp className="h-3 w-3" />
                  {stat.trend}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </div>
              <p className="text-xs text-muted-foreground mt-3">{stat.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg font-semibold">Upcoming Bookings</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/bookings" className="gap-1">
                View all
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingBookings.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <DoorOpen className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{getRoomName(rooms, booking.roomId)}</p>
                    <Badge
                      variant={booking.status === "confirmed" ? "default" : "secondary"}
                      className={
                        booking.status === "confirmed"
                          ? "bg-success/10 text-success hover:bg-success/20 border-0"
                          : "bg-warning/10 text-warning hover:bg-warning/20 border-0"
                      }
                    >
                      {booking.status}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDateLabel(booking.date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {booking.startTime} - {booking.endTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {booking.participants.length}
                    </span>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/dashboard/bookings/${booking.id}`}>Details</Link>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {quickActions.map((action) => (
                <Link
                  key={action.title}
                  href={action.href}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors group"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary transition-colors">
                    <action.icon className="h-4 w-4 text-primary group-hover:text-primary-foreground" />
                  </div>
                  <span className="font-medium text-sm">{action.title}</span>
                  <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground group-hover:text-foreground transition-colors" />
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={`${activity.action}-${index}`} className="flex items-start gap-3">
                    <div className="flex h-2 w-2 mt-2 rounded-full bg-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{activity.action}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {getRoomName(rooms, activity.roomId)} - {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
