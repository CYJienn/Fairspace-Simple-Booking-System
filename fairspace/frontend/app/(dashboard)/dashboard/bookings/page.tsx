"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Calendar,
  Clock,
  Users,
  Search,
  Filter,
  DoorOpen,
  ArrowRight,
  QrCode,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const allBookings = [
  {
    id: 1,
    room: "Discussion Room A",
    date: "May 10, 2026",
    time: "2:00 PM - 4:00 PM",
    status: "confirmed",
    participants: 4,
    checkInStatus: "pending",
  },
  {
    id: 2,
    room: "Study Pod B",
    date: "May 10, 2026",
    time: "5:00 PM - 6:30 PM",
    status: "pending",
    participants: 2,
    checkInStatus: "pending",
  },
  {
    id: 3,
    room: "Collaboration Hub",
    date: "May 11, 2026",
    time: "10:00 AM - 12:00 PM",
    status: "confirmed",
    participants: 6,
    checkInStatus: "pending",
  },
  {
    id: 4,
    room: "Discussion Room C",
    date: "May 8, 2026",
    time: "3:00 PM - 5:00 PM",
    status: "completed",
    participants: 3,
    checkInStatus: "checked-in",
  },
  {
    id: 5,
    room: "Study Pod A",
    date: "May 7, 2026",
    time: "1:00 PM - 2:30 PM",
    status: "completed",
    participants: 2,
    checkInStatus: "checked-in",
  },
  {
    id: 6,
    room: "Meeting Room 101",
    date: "May 5, 2026",
    time: "9:00 AM - 10:00 AM",
    status: "cancelled",
    participants: 4,
    checkInStatus: "no-show",
  },
  {
    id: 7,
    room: "Quiet Study Zone",
    date: "May 3, 2026",
    time: "4:00 PM - 6:00 PM",
    status: "expired",
    participants: 1,
    checkInStatus: "no-show",
  },
]

const statusConfig = {
  confirmed: { label: "Confirmed", color: "bg-success/10 text-success", icon: CheckCircle2 },
  pending: { label: "Pending", color: "bg-warning/10 text-warning", icon: AlertCircle },
  completed: { label: "Completed", color: "bg-muted text-muted-foreground", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "bg-destructive/10 text-destructive", icon: XCircle },
  expired: { label: "Expired", color: "bg-muted text-muted-foreground", icon: XCircle },
}

export default function BookingsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("upcoming")
  const [requestOpen, setRequestOpen] = useState(false)
  const [requestForm, setRequestForm] = useState({
    room: "",
    date: "",
    startTime: "",
    endTime: "",
    durationHours: "",
    reason: "",
  })

  const filteredBookings = allBookings.filter((booking) => {
    const matchesSearch = booking.room.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter
    
    if (activeTab === "upcoming") {
      return matchesSearch && matchesStatus && (booking.status === "confirmed" || booking.status === "pending")
    } else {
      return matchesSearch && matchesStatus && (booking.status === "completed" || booking.status === "cancelled" || booking.status === "expired")
    }
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">My Bookings</h1>
          <p className="text-muted-foreground mt-1">
            View and manage your study room reservations.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Dialog open={requestOpen} onOpenChange={setRequestOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Request > 3 Hours
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[520px]">
              <DialogHeader>
                <DialogTitle>Extended Booking Request</DialogTitle>
                <DialogDescription>
                  Submit a request if you need to book more than 3 hours. Admins will review it.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="request-room">Room</Label>
                  <Input
                    id="request-room"
                    placeholder="e.g., Collaboration Hub"
                    value={requestForm.room}
                    onChange={(e) => setRequestForm({ ...requestForm, room: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="request-date">Date</Label>
                    <Input
                      id="request-date"
                      type="date"
                      value={requestForm.date}
                      onChange={(e) => setRequestForm({ ...requestForm, date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="request-duration">Duration (hours)</Label>
                    <Input
                      id="request-duration"
                      type="number"
                      min="3.5"
                      step="0.5"
                      placeholder="4"
                      value={requestForm.durationHours}
                      onChange={(e) => setRequestForm({ ...requestForm, durationHours: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="request-start">Start time</Label>
                    <Input
                      id="request-start"
                      type="time"
                      value={requestForm.startTime}
                      onChange={(e) => setRequestForm({ ...requestForm, startTime: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="request-end">End time</Label>
                    <Input
                      id="request-end"
                      type="time"
                      value={requestForm.endTime}
                      onChange={(e) => setRequestForm({ ...requestForm, endTime: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="request-reason">Reason</Label>
                  <Textarea
                    id="request-reason"
                    rows={3}
                    placeholder="Why do you need more than 3 hours?"
                    value={requestForm.reason}
                    onChange={(e) => setRequestForm({ ...requestForm, reason: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setRequestOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setRequestOpen(false)}>
                  Submit Request
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button asChild>
            <Link href="/dashboard/calendar">
              <Calendar className="mr-2 h-4 w-4" />
              New Booking
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search rooms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6">
          <BookingsList bookings={filteredBookings} />
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          <BookingsList bookings={filteredBookings} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function BookingsList({ bookings }: { bookings: typeof allBookings }) {
  if (bookings.length === 0) {
    return (
      <Card className="border-border/50">
        <CardContent className="py-16">
          <div className="text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mx-auto mb-4">
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No bookings found</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              You don&apos;t have any bookings matching your filters. Try adjusting your search or create a new booking.
            </p>
            <Button asChild>
              <Link href="/dashboard/calendar">Book a Room</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => {
        const status = statusConfig[booking.status as keyof typeof statusConfig]
        return (
          <Card key={booking.id} className="border-border/50 hover:border-primary/30 transition-colors">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 flex-shrink-0">
                  <DoorOpen className="h-7 w-7 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start sm:items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-lg">{booking.room}</h3>
                    <Badge variant="secondary" className={`${status.color} border-0`}>
                      <status.icon className="h-3 w-3 mr-1" />
                      {status.label}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      {booking.date}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      {booking.time}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="h-4 w-4" />
                      {booking.participants} participants
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:flex-shrink-0">
                  {(booking.status === "confirmed" || booking.status === "pending") && (
                    <Button variant="outline" size="sm" className="gap-2">
                      <QrCode className="h-4 w-4" />
                      <span className="hidden sm:inline">Check-in</span>
                    </Button>
                  )}
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/bookings/${booking.id}`} className="gap-2">
                      Details
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-9 w-9">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Reschedule</DropdownMenuItem>
                      <DropdownMenuItem>Invite Participants</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive focus:text-destructive">
                        Cancel Booking
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
