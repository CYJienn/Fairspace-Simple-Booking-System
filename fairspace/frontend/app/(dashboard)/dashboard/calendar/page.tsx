"use client"

import { useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Filter, Search } from "lucide-react"
import { BookingModal } from "@/components/booking-modal"
import { addDays, format, isSameDay } from "date-fns"
import { cn } from "@/lib/utils"
import {
  dateFromString,
  dateStringFromDate,
  DEMO_TODAY,
  getRoomName,
  getWeekDays,
  parseSlotMinutes,
  timeSlots,
} from "@/lib/booking-data"
import { useBookingStore } from "@/lib/booking-store"

export default function CalendarPage() {
  const { bookings, rooms } = useBookingStore()
  const [currentDate, setCurrentDate] = useState(dateFromString(DEMO_TODAY))
  const [selectedRoom, setSelectedRoom] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<{ date: Date; time: string } | null>(null)

  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate])
  const weekStart = weekDays[0]

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch =
      !searchQuery ||
      room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.building.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRoom = selectedRoom === "all" || room.id === selectedRoom
    return matchesSearch && matchesRoom
  })
  const visibleRoomIds = new Set(filteredRooms.map((room) => room.id))

  const visibleBookings = bookings.filter((booking) => {
    if (booking.status === "cancelled" || booking.status === "expired") return false
    return visibleRoomIds.has(booking.roomId)
  })

  const handleSlotClick = (date: Date, time: string) => {
    setSelectedSlot({ date, time })
    setIsBookingModalOpen(true)
  }

  const getBookingForSlot = (date: Date, time: string) => {
    const dateString = dateStringFromDate(date)
    return visibleBookings.find((booking) => booking.date === dateString && booking.startTime === time)
  }

  const isSlotBooked = (date: Date, time: string) => {
    const dateString = dateStringFromDate(date)
    const slotMinutes = parseSlotMinutes(time)

    return visibleBookings.some((booking) => {
      if (booking.date !== dateString) return false
      const start = parseSlotMinutes(booking.startTime)
      const end = parseSlotMinutes(booking.endTime)
      return slotMinutes >= start && slotMinutes < end
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Booking Calendar</h1>
          <p className="text-muted-foreground mt-1">
            Pick an available slot to schedule intern interviews, assessments, and mentor sessions.
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setCurrentDate(addDays(currentDate, -7))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => setCurrentDate(dateFromString(DEMO_TODAY))}>
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={() => setCurrentDate(addDays(currentDate, 7))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="ml-2 sm:ml-4 text-base sm:text-lg font-medium">
            {format(weekStart, "MMM d")} - {format(addDays(weekStart, 6), "MMM d, yyyy")}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search rooms..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={selectedRoom} onValueChange={setSelectedRoom}>
            <SelectTrigger className="w-full sm:w-[220px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter rooms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Rooms</SelectItem>
              {rooms.map((room) => (
                <SelectItem key={room.id} value={room.id}>
                  {room.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-muted border border-border" />
          <span className="text-muted-foreground">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-success/30 border border-success/50" />
          <span className="text-muted-foreground">Confirmed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-warning/30 border border-warning/50" />
          <span className="text-muted-foreground">Pending</span>
        </div>
      </div>

      <Card className="border-border/50 overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-[880px]">
              <div className="grid grid-cols-8 border-b border-border">
                <div className="p-3 text-sm font-medium text-muted-foreground border-r border-border">Time</div>
                {weekDays.map((day) => {
                  const isToday = isSameDay(day, dateFromString(DEMO_TODAY))
                  return (
                    <div
                      key={day.toISOString()}
                      className={cn("p-3 text-center border-r border-border last:border-r-0", isToday && "bg-primary/5")}
                    >
                      <p className="text-xs text-muted-foreground uppercase">{format(day, "EEE")}</p>
                      <p className={cn("text-lg font-semibold mt-0.5", isToday && "text-primary")}>
                        {format(day, "d")}
                      </p>
                    </div>
                  )
                })}
              </div>

              <div className="max-h-[600px] overflow-y-auto">
                {timeSlots.map((time) => (
                  <div key={time} className="grid grid-cols-8 border-b border-border last:border-b-0">
                    <div className="p-2 text-xs text-muted-foreground border-r border-border flex items-center justify-center">
                      {time}
                    </div>
                    {weekDays.map((day) => {
                      const booking = getBookingForSlot(day, time)
                      const booked = isSlotBooked(day, time)
                      const isToday = isSameDay(day, dateFromString(DEMO_TODAY))

                      return (
                        <div
                          key={`${day.toISOString()}-${time}`}
                          className={cn(
                            "relative h-10 border-r border-border last:border-r-0 transition-colors",
                            isToday && "bg-primary/5",
                            !booked && "hover:bg-primary/10 cursor-pointer",
                          )}
                          onClick={() => !booked && handleSlotClick(day, time)}
                        >
                          {booking && (
                            <div
                              className={cn(
                                "absolute inset-x-1 top-1 rounded-lg p-1.5 text-xs font-medium z-10 overflow-hidden",
                                booking.status === "confirmed"
                                  ? "bg-success/20 text-success border border-success/30"
                                  : "bg-warning/20 text-warning border border-warning/30",
                              )}
                              style={{
                                height: `${(timeSlots.indexOf(booking.endTime) - timeSlots.indexOf(booking.startTime)) * 40 - 8}px`,
                              }}
                            >
                              <p className="truncate font-medium">{getRoomName(rooms, booking.roomId)}</p>
                              <p className="text-[10px] opacity-75 truncate">
                                {booking.startTime} - {booking.endTime}
                              </p>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <BookingModal
        open={isBookingModalOpen}
        onOpenChange={setIsBookingModalOpen}
        selectedDate={selectedSlot?.date}
        selectedTime={selectedSlot?.time}
        defaultRoomId={selectedRoom === "all" ? "" : selectedRoom}
      />
    </div>
  )
}
