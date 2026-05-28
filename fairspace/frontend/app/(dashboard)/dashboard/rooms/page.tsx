"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  Monitor,
  PenTool,
  Plug,
  Search,
  Snowflake,
  Users,
  Wifi,
  XCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { BookingModal } from "@/components/booking-modal"
import { dateFromString, DEMO_TODAY, parseSlotMinutes } from "@/lib/booking-data"
import { useBookingStore } from "@/lib/booking-store"

const amenityIcons = {
  whiteboard: PenTool,
  projector: Monitor,
  aircon: Snowflake,
  charging: Plug,
  wifi: Wifi,
}

export default function RoomsPage() {
  const { rooms, bookings } = useBookingStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [capacityFilter, setCapacityFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [bookingRoomId, setBookingRoomId] = useState("")
  const [bookingOpen, setBookingOpen] = useState(false)
  const demoNow = parseSlotMinutes("2:30 PM")

  const getRoomAvailability = (roomId: string) => {
    const room = rooms.find((item) => item.id === roomId)
    if (!room || room.status === "maintenance") {
      return { status: "maintenance" as const, label: "Maintenance", nextAvailable: "Tomorrow" }
    }

    const todaysBookings = bookings
      .filter((booking) => booking.roomId === roomId && booking.date === DEMO_TODAY)
      .filter((booking) => booking.status === "confirmed" || booking.status === "pending")

    const active = todaysBookings.find((booking) => {
      const start = parseSlotMinutes(booking.startTime)
      const end = parseSlotMinutes(booking.endTime)
      return demoNow >= start && demoNow < end
    })

    if (active) {
      return { status: "occupied" as const, label: `Until ${active.endTime}`, nextAvailable: active.endTime }
    }

    return { status: "available" as const, label: "Available", nextAvailable: null }
  }

  const filteredRooms = rooms.filter((room) => {
    const availability = getRoomAvailability(room.id)
    const matchesSearch =
      room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.building.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCapacity =
      capacityFilter === "all" ||
      (capacityFilter === "small" && room.capacity <= 4) ||
      (capacityFilter === "medium" && room.capacity > 4 && room.capacity <= 8) ||
      (capacityFilter === "large" && room.capacity > 8)

    const matchesStatus = statusFilter === "all" || availability.status === statusFilter

    return matchesSearch && matchesCapacity && matchesStatus
  })

  const availabilityCounts = rooms.reduce(
    (counts, room) => {
      const availability = getRoomAvailability(room.id)
      counts[availability.status] += 1
      return counts
    },
    { available: 0, occupied: 0, maintenance: 0 },
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Interview Spaces</h1>
          <p className="text-muted-foreground mt-1">
            Browse rooms for intern interviews, assessments, mentor calls, and prep sessions.
          </p>
        </div>
        <Button
          onClick={() => {
            setBookingRoomId("")
            setBookingOpen(true)
          }}
        >
          <Calendar className="mr-2 h-4 w-4" />
          Book a Room
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search rooms or buildings..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={capacityFilter} onValueChange={setCapacityFilter}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <Users className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Capacity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sizes</SelectItem>
            <SelectItem value="small">Small (1-4)</SelectItem>
            <SelectItem value="medium">Medium (5-8)</SelectItem>
            <SelectItem value="large">Large (9+)</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[170px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="occupied">Occupied</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 text-success">
          <CheckCircle2 className="h-4 w-4" />
          <span>{availabilityCounts.available} Available</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-warning/10 text-warning">
          <Clock className="h-4 w-4" />
          <span>{availabilityCounts.occupied} Occupied</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-muted-foreground">
          <XCircle className="h-4 w-4" />
          <span>{availabilityCounts.maintenance} Maintenance</span>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredRooms.map((room) => {
          const availability = getRoomAvailability(room.id)
          return (
            <Card
              key={room.id}
              className={cn(
                "group overflow-hidden border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300",
                availability.status === "maintenance" && "opacity-75",
              )}
            >
              <div className="relative h-40 bg-muted overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent z-10" />
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                  <Monitor className="h-16 w-16 opacity-20" />
                </div>
                <div className="absolute left-4 bottom-4 z-20">
                  <p className="text-sm font-medium text-foreground">{room.floor}</p>
                  <p className="text-xs text-muted-foreground">{room.building}</p>
                </div>

                <div className="absolute top-3 right-3 z-20">
                  <Badge
                    className={cn(
                      "border-0 shadow-lg",
                      availability.status === "available"
                        ? "bg-success text-success-foreground"
                        : availability.status === "occupied"
                          ? "bg-warning text-warning-foreground"
                          : "bg-muted text-muted-foreground",
                    )}
                  >
                    {availability.status === "available" ? (
                      <>
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Available
                      </>
                    ) : availability.status === "occupied" ? (
                      <>
                        <Clock className="h-3 w-3 mr-1" />
                        {availability.label}
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3 mr-1" />
                        Maintenance
                      </>
                    )}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-5">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                      {room.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{room.description}</p>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{room.bookings} total bookings</span>
                    <Badge variant="secondary" className="gap-1">
                      <Users className="h-3 w-3" />
                      {room.capacity}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {room.amenities.map((amenity) => {
                      const Icon = amenityIcons[amenity as keyof typeof amenityIcons]
                      return (
                        <div
                          key={amenity}
                          className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted text-muted-foreground"
                          title={amenity.charAt(0).toUpperCase() + amenity.slice(1)}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                      )
                    })}
                  </div>

                  <Button
                    className="w-full"
                    variant={availability.status === "available" ? "default" : "outline"}
                    disabled={availability.status === "maintenance"}
                    onClick={() => {
                      setBookingRoomId(room.id)
                      setBookingOpen(true)
                    }}
                  >
                    {availability.status === "maintenance" ? "Under Maintenance" : "Book Now"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredRooms.length === 0 && (
        <Card className="border-border/50">
          <CardContent className="py-16">
            <div className="text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mx-auto mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No rooms found</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                No spaces match your current filters. Try adjusting your search criteria.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <BookingModal
        open={bookingOpen}
        onOpenChange={setBookingOpen}
        selectedDate={dateFromString(DEMO_TODAY)}
        selectedTime="8:00 AM"
        defaultRoomId={bookingRoomId}
      />
    </div>
  )
}
