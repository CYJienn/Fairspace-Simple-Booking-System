"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  Calendar,
  DoorOpen,
  XCircle,
  Activity,
} from "lucide-react"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const stats = [
  {
    title: "Total Bookings",
    value: "1,234",
    change: "+12%",
    trend: "up",
    description: "vs last month",
    icon: Calendar,
  },
  {
    title: "Room Utilization",
    value: "78%",
    change: "+5%",
    trend: "up",
    description: "avg. occupancy",
    icon: DoorOpen,
  },
  {
    title: "No-Show Rate",
    value: "6%",
    change: "-2%",
    trend: "down",
    description: "vs last month",
    icon: XCircle,
  },
  {
    title: "Active Users",
    value: "456",
    change: "+8%",
    trend: "up",
    description: "this week",
    icon: Users,
  },
]

const weeklyData = [
  { day: "Mon", bookings: 45, checkins: 42 },
  { day: "Tue", bookings: 52, checkins: 48 },
  { day: "Wed", bookings: 61, checkins: 58 },
  { day: "Thu", bookings: 55, checkins: 52 },
  { day: "Fri", bookings: 48, checkins: 44 },
  { day: "Sat", bookings: 32, checkins: 30 },
  { day: "Sun", bookings: 28, checkins: 26 },
]

const hourlyData = [
  { hour: "8AM", bookings: 12 },
  { hour: "9AM", bookings: 28 },
  { hour: "10AM", bookings: 45 },
  { hour: "11AM", bookings: 52 },
  { hour: "12PM", bookings: 38 },
  { hour: "1PM", bookings: 42 },
  { hour: "2PM", bookings: 58 },
  { hour: "3PM", bookings: 62 },
  { hour: "4PM", bookings: 48 },
  { hour: "5PM", bookings: 35 },
  { hour: "6PM", bookings: 25 },
  { hour: "7PM", bookings: 18 },
  { hour: "8PM", bookings: 10 },
]

const roomUtilization = [
  { name: "Discussion Room A", value: 85, color: "var(--chart-1)" },
  { name: "Study Pod B", value: 72, color: "var(--chart-2)" },
  { name: "Collaboration Hub", value: 90, color: "var(--chart-3)" },
  { name: "Meeting Room 101", value: 65, color: "var(--chart-4)" },
  { name: "Quiet Study Zone", value: 58, color: "var(--chart-5)" },
]

const topRooms = [
  { name: "Collaboration Hub", bookings: 245, utilization: 90 },
  { name: "Discussion Room A", bookings: 198, utilization: 85 },
  { name: "Study Pod B", bookings: 156, utilization: 72 },
  { name: "Meeting Room 101", bookings: 134, utilization: 65 },
  { name: "Quiet Study Zone", bookings: 98, utilization: 58 },
]

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Track room usage, booking patterns, and system performance.
          </p>
        </div>
        <Select defaultValue="30days">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 days</SelectItem>
            <SelectItem value="30days">Last 30 days</SelectItem>
            <SelectItem value="90days">Last 90 days</SelectItem>
            <SelectItem value="year">This year</SelectItem>
          </SelectContent>
        </Select>
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
                  stat.trend === "up" 
                    ? stat.title === "No-Show Rate" ? "text-success" : "text-success"
                    : stat.title === "No-Show Rate" ? "text-success" : "text-destructive"
                }`}>
                  {stat.trend === "up" ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {stat.change}
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

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Weekly Bookings Chart */}
        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Weekly Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData}>
                  <defs>
                    <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorCheckins" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="day" className="text-xs" tick={{ fill: 'var(--muted-foreground)' }} />
                  <YAxis className="text-xs" tick={{ fill: 'var(--muted-foreground)' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="bookings"
                    stroke="var(--chart-1)"
                    fillOpacity={1}
                    fill="url(#colorBookings)"
                    strokeWidth={2}
                    name="Bookings"
                  />
                  <Area
                    type="monotone"
                    dataKey="checkins"
                    stroke="var(--chart-2)"
                    fillOpacity={1}
                    fill="url(#colorCheckins)"
                    strokeWidth={2}
                    name="Check-ins"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--chart-1)' }} />
                <span className="text-sm text-muted-foreground">Bookings</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--chart-2)' }} />
                <span className="text-sm text-muted-foreground">Check-ins</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Peak Hours Chart */}
        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Peak Booking Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="hour" className="text-xs" tick={{ fill: 'var(--muted-foreground)' }} />
                  <YAxis className="text-xs" tick={{ fill: 'var(--muted-foreground)' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar
                    dataKey="bookings"
                    fill="var(--chart-1)"
                    radius={[4, 4, 0, 0]}
                    name="Bookings"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-sm text-muted-foreground text-center mt-4">
              Peak hours: 2PM - 4PM with an average of 60 bookings
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Room Utilization Donut */}
        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Room Utilization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roomUtilization}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {roomUtilization.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`${value}%`, 'Utilization']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">78%</p>
              <p className="text-sm text-muted-foreground">Average Utilization</p>
            </div>
          </CardContent>
        </Card>

        {/* Most Booked Rooms */}
        <Card className="border-border/50 lg:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <DoorOpen className="h-5 w-5" />
              Most Booked Rooms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topRooms.map((room, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-semibold">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium truncate">{room.name}</span>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">{room.bookings} bookings</span>
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
                          {room.utilization}%
                        </Badge>
                      </div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${room.utilization}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
