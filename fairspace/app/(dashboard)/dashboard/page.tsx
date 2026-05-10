"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  Calendar,
  Clock,
  Users,
  TrendingUp,
  ArrowRight,
  MapPin,
  CheckCircle2,
  AlertCircle,
  DoorOpen,
} from "lucide-react"

const stats = [
  {
    title: "Active Bookings",
    value: "3",
    description: "2 today, 1 tomorrow",
    icon: Calendar,
    trend: "+12%",
    trendUp: true,
  },
  {
    title: "Check-in Rate",
    value: "94%",
    description: "Last 30 days",
    icon: CheckCircle2,
    trend: "+2%",
    trendUp: true,
  },
  {
    title: "Hours Booked",
    value: "24",
    description: "This month",
    icon: Clock,
    trend: "+8%",
    trendUp: true,
  },
  {
    title: "Group Sessions",
    value: "12",
    description: "5 participants avg",
    icon: Users,
    trend: "+15%",
    trendUp: true,
  },
]

const upcomingBookings = [
  {
    id: 1,
    room: "Discussion Room A",
    date: "Today",
    time: "2:00 PM - 4:00 PM",
    status: "confirmed",
    participants: 4,
  },
  {
    id: 2,
    room: "Study Pod B",
    date: "Today",
    time: "5:00 PM - 6:30 PM",
    status: "pending",
    participants: 2,
  },
  {
    id: 3,
    room: "Collaboration Hub",
    date: "Tomorrow",
    time: "10:00 AM - 12:00 PM",
    status: "confirmed",
    participants: 6,
  },
]

const quickActions = [
  { title: "Book a Room", href: "/dashboard/calendar", icon: Calendar },
  { title: "View All Rooms", href: "/dashboard/rooms", icon: DoorOpen },
  { title: "My Bookings", href: "/dashboard/bookings", icon: Clock },
]

const recentActivity = [
  { action: "Checked in to Discussion Room A", time: "2 hours ago" },
  { action: "Booked Study Pod B for tomorrow", time: "5 hours ago" },
  { action: "Cancelled booking at Room C", time: "Yesterday" },
  { action: "Invited 3 members to group session", time: "2 days ago" },
]

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Welcome back, Sarah</h1>
          <p className="text-muted-foreground mt-1">
            Here&apos;s what&apos;s happening with your bookings today.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/calendar">
            <Calendar className="mr-2 h-4 w-4" />
            New Booking
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i} className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium ${
                  stat.trendUp ? "text-success" : "text-destructive"
                }`}>
                  <TrendingUp className="h-3 w-3" />
                  {stat.trend}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upcoming Bookings */}
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
                    <p className="font-medium truncate">{booking.room}</p>
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
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {booking.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {booking.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {booking.participants}
                    </span>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/dashboard/bookings/${booking.id}`}>Details</Link>
                </Button>
              </div>
            ))}

            {upcomingBookings.length === 0 && (
              <div className="text-center py-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted mx-auto mb-4">
                  <Calendar className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">No upcoming bookings</p>
                <Button className="mt-4" asChild>
                  <Link href="/dashboard/calendar">Book a Room</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions & Activity */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {quickActions.map((action, i) => (
                <Link
                  key={i}
                  href={action.href}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors group"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <action.icon className="h-4 w-4 text-primary group-hover:text-primary-foreground" />
                  </div>
                  <span className="font-medium text-sm">{action.title}</span>
                  <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground group-hover:text-foreground transition-colors" />
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="flex h-2 w-2 mt-2 rounded-full bg-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{activity.action}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{activity.time}</p>
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
