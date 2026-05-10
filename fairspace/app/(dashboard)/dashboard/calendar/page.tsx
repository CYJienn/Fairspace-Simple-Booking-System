"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Calendar as CalendarIcon,
  Clock,
  Users,
} from "lucide-react"
import { BookingModal } from "@/components/booking-modal"
import { addDays, format, startOfWeek, isSameDay } from "date-fns"
import { cn } from "@/lib/utils"

const rooms = [
  { id: "all", name: "All Rooms" },
  { id: "room-a", name: "Discussion Room A" },
  { id: "room-b", name: "Study Pod B" },
  { id: "room-c", name: "Collaboration Hub" },
  { id: "room-d", name: "Meeting Room 101" },
  { id: "room-e", name: "Quiet Study Zone" },
]

const timeSlots = [
  "8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM",
  "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM",
  "5:00 PM", "5:30 PM", "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM",
  "8:00 PM",
]

// Mock existing bookings
const existingBookings = [
  { date: new Date(2026, 4, 10), startTime: "9:00 AM", endTime: "11:00 AM", room: "Discussion Room A", status: "confirmed" },
  { date: new Date(2026, 4, 10), startTime: "2:00 PM", endTime: "4:00 PM", room: "Study Pod B", status: "pending" },
  { date: new Date(2026, 4, 11), startTime: "10:00 AM", endTime: "12:00 PM", room: "Collaboration Hub", status: "confirmed" },
  { date: new Date(2026, 4, 12), startTime: "1:00 PM", endTime: "3:00 PM", room: "Discussion Room A", status: "confirmed" },
  { date: new Date(2026, 4, 12), startTime: "3:30 PM", endTime: "5:00 PM", room: "Meeting Room 101", status: "confirmed" },
]

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 10))
  const [selectedRoom, setSelectedRoom] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<{
    date: Date
    time: string
  } | null>(null)

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const goToPreviousWeek = () => setCurrentDate(addDays(currentDate, -7))
  const goToNextWeek = () => setCurrentDate(addDays(currentDate, 7))
  const goToToday = () => setCurrentDate(new Date(2026, 4, 10))

  const handleSlotClick = (date: Date, time: string) => {
    setSelectedSlot({ date, time })
    setIsBookingModalOpen(true)
  }

  const getBookingForSlot = (date: Date, time: string) => {
    return existingBookings.find(
      (booking) =>
        isSameDay(booking.date, date) &&
        booking.startTime === time &&
        (selectedRoom === "all" || booking.room.toLowerCase().includes(selectedRoom))
    )
  }

  const isSlotBooked = (date: Date, time: string) => {
    return existingBookings.some((booking) => {
      if (!isSameDay(booking.date, date)) return false
      if (selectedRoom !== "all" && !booking.room.toLowerCase().includes(selectedRoom)) return false
      
      const startIndex = timeSlots.indexOf(booking.startTime)
      const endIndex = timeSlots.indexOf(booking.endTime)
      const currentIndex = timeSlots.indexOf(time)
      
      return currentIndex >= startIndex && currentIndex < endIndex
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground mt-1">
            Click on a time slot to create a new booking.
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={goToPreviousWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={goToToday}>
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={goToNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="ml-4 text-lg font-medium">
            {format(weekStart, "MMM d")} - {format(addDays(weekStart, 6), "MMM d, yyyy")}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={selectedRoom} onValueChange={setSelectedRoom}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter rooms" />
            </SelectTrigger>
            <SelectContent>
              {rooms.map((room) => (
                <SelectItem key={room.id} value={room.id}>
                  {room.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Legend */}
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

      {/* Calendar Grid */}
      <Card className="border-border/50 overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Day Headers */}
              <div className="grid grid-cols-8 border-b border-border">
                <div className="p-3 text-sm font-medium text-muted-foreground border-r border-border">
                  Time
                </div>
                {weekDays.map((day, i) => {
                  const isToday = isSameDay(day, new Date(2026, 4, 10))
                  return (
                    <div
                      key={i}
                      className={cn(
                        "p-3 text-center border-r border-border last:border-r-0",
                        isToday && "bg-primary/5"
                      )}
                    >
                      <p className="text-xs text-muted-foreground uppercase">
                        {format(day, "EEE")}
                      </p>
                      <p className={cn(
                        "text-lg font-semibold mt-0.5",
                        isToday && "text-primary"
                      )}>
                        {format(day, "d")}
                      </p>
                    </div>
                  )
                })}
              </div>

              {/* Time Slots */}
              <div className="max-h-[600px] overflow-y-auto">
                {timeSlots.map((time, timeIndex) => (
                  <div key={time} className="grid grid-cols-8 border-b border-border last:border-b-0">
                    <div className="p-2 text-xs text-muted-foreground border-r border-border flex items-center justify-center">
                      {time}
                    </div>
                    {weekDays.map((day, dayIndex) => {
                      const booking = getBookingForSlot(day, time)
                      const booked = isSlotBooked(day, time)
                      const isToday = isSameDay(day, new Date(2026, 4, 10))

                      return (
                        <div
                          key={dayIndex}
                          className={cn(
                            "relative h-10 border-r border-border last:border-r-0 transition-colors",
                            isToday && "bg-primary/5",
                            !booked && "hover:bg-primary/10 cursor-pointer"
                          )}
                          onClick={() => !booked && handleSlotClick(day, time)}
                        >
                          {booking && booking.startTime === time && (
                            <div
                              className={cn(
                                "absolute inset-x-1 top-1 rounded-lg p-1.5 text-xs font-medium z-10",
                                booking.status === "confirmed"
                                  ? "bg-success/20 text-success border border-success/30"
                                  : "bg-warning/20 text-warning border border-warning/30"
                              )}
                              style={{
                                height: `${(timeSlots.indexOf(booking.endTime) - timeSlots.indexOf(booking.startTime)) * 40 - 8}px`
                              }}
                            >
                              <p className="truncate font-medium">{booking.room}</p>
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

      {/* Booking Modal */}
      <BookingModal
        open={isBookingModalOpen}
        onOpenChange={setIsBookingModalOpen}
        selectedDate={selectedSlot?.date}
        selectedTime={selectedSlot?.time}
      />
    </div>
  )
}
