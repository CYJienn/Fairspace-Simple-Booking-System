"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
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
  AlertCircle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  DoorOpen,
  Filter,
  MoreHorizontal,
  Plus,
  QrCode,
  Search,
  Users,
  XCircle,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import {
  Booking,
  formatDateLabel,
  getPastBookings,
  getRoomName,
  getUpcomingBookings,
} from "@/lib/booking-data"
import { useBookingStore } from "@/lib/booking-store"

const statusConfig = {
  confirmed: { label: "Confirmed", color: "bg-success/10 text-success", icon: CheckCircle2 },
  pending: { label: "Pending", color: "bg-warning/10 text-warning", icon: AlertCircle },
  completed: { label: "Completed", color: "bg-muted text-muted-foreground", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "bg-destructive/10 text-destructive", icon: XCircle },
  expired: { label: "Expired", color: "bg-muted text-muted-foreground", icon: XCircle },
}

export default function BookingsPage() {
  const { bookings, rooms, submitExtendedRequest } = useBookingStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("upcoming")
  const [requestOpen, setRequestOpen] = useState(false)
  const [requestForm, setRequestForm] = useState({
    roomId: "",
    date: "",
    startTime: "",
    endTime: "",
    durationHours: "",
    reason: "",
  })

  const sourceBookings = activeTab === "upcoming" ? getUpcomingBookings(bookings) : getPastBookings(bookings)
  const filteredBookings = sourceBookings.filter((booking) => {
    const roomName = getRoomName(rooms, booking.roomId).toLowerCase()
    const matchesSearch = roomName.includes(searchQuery.toLowerCase()) || booking.purpose.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleSubmitRequest = () => {
    const durationHours = Number(requestForm.durationHours)
    const result = submitExtendedRequest({
      roomId: requestForm.roomId,
      date: requestForm.date,
      startTime: requestForm.startTime,
      endTime: requestForm.endTime,
      durationHours,
      reason: requestForm.reason,
    })

    if (!result.ok) {
      toast.error(result.message)
      return
    }

    toast.success("Request submitted", {
      description: "Admins can now approve or reject the extended booking request.",
    })
    setRequestOpen(false)
    setRequestForm({ roomId: "", date: "", startTime: "", endTime: "", durationHours: "", reason: "" })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">My Bookings</h1>
          <p className="text-muted-foreground mt-1">
            View, check in, cancel, and request longer interview room slots.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Dialog open={requestOpen} onOpenChange={setRequestOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Request over 3 hours
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[520px]">
              <DialogHeader>
                <DialogTitle>Extended Booking Request</DialogTitle>
                <DialogDescription>
                  Submit a request when a hiring session needs more than 3 hours.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="request-room">Room</Label>
                  <Select
                    value={requestForm.roomId}
                    onValueChange={(value) => setRequestForm({ ...requestForm, roomId: value })}
                  >
                    <SelectTrigger id="request-room">
                      <SelectValue placeholder="Select a room" />
                    </SelectTrigger>
                    <SelectContent>
                      {rooms
                        .filter((room) => room.status === "active")
                        .map((room) => (
                          <SelectItem key={room.id} value={room.id}>
                            {room.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="request-date">Date</Label>
                    <Input
                      id="request-date"
                      type="date"
                      value={requestForm.date}
                      onChange={(event) => setRequestForm({ ...requestForm, date: event.target.value })}
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
                      onChange={(event) => setRequestForm({ ...requestForm, durationHours: event.target.value })}
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
                      onChange={(event) => setRequestForm({ ...requestForm, startTime: event.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="request-end">End time</Label>
                    <Input
                      id="request-end"
                      type="time"
                      value={requestForm.endTime}
                      onChange={(event) => setRequestForm({ ...requestForm, endTime: event.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="request-reason">Reason</Label>
                  <Textarea
                    id="request-reason"
                    rows={3}
                    placeholder="Why does this hiring session need more than 3 hours?"
                    value={requestForm.reason}
                    onChange={(event) => setRequestForm({ ...requestForm, reason: event.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setRequestOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitRequest}
                  disabled={!requestForm.roomId || !requestForm.date || !requestForm.durationHours}
                >
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

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search rooms or purpose..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
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

function BookingsList({ bookings }: { bookings: Booking[] }) {
  const { rooms, cancelBooking, checkInBooking } = useBookingStore()

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
              Adjust your filters or create a new interview room booking.
            </p>
            <Button asChild>
              <Link href="/dashboard/calendar">Book a Room</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const handleAction = (message: string, action: () => { ok: boolean; message: string }) => {
    const result = action()
    if (!result.ok) {
      toast.error(result.message)
      return
    }
    toast.success(message)
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => {
        const status = statusConfig[booking.status]
        return (
          <Card key={booking.id} className="border-border/50 hover:border-primary/30 transition-colors">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 flex-shrink-0">
                  <DoorOpen className="h-7 w-7 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start sm:items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-lg">{getRoomName(rooms, booking.roomId)}</h3>
                    <Badge variant="secondary" className={`${status.color} border-0`}>
                      <status.icon className="h-3 w-3 mr-1" />
                      {status.label}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{booking.purpose}</p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      {formatDateLabel(booking.date)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      {booking.startTime} - {booking.endTime}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="h-4 w-4" />
                      {booking.participants.length} participants
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:flex-shrink-0">
                  {(booking.status === "confirmed" || booking.status === "pending") && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => handleAction("Checked in successfully", () => checkInBooking(booking.id))}
                    >
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
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/calendar">Reschedule</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/bookings/${booking.id}`}>Invite Participants</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => handleAction("Booking cancelled", () => cancelBooking(booking.id))}
                      >
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
