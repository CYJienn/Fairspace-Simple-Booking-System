"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
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
import { Badge } from "@/components/ui/badge"
import { Calendar, CheckCircle2, Clock, Info, Loader2, Users, X } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { dateStringFromDate, timeSlots } from "@/lib/booking-data"
import { useBookingStore } from "@/lib/booking-store"

const durationOptions = [
  { value: "30", label: "30 minutes" },
  { value: "60", label: "1 hour" },
  { value: "90", label: "1.5 hours" },
  { value: "120", label: "2 hours" },
]

interface BookingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedDate?: Date
  selectedTime?: string
  defaultRoomId?: string
}

export function BookingModal({
  open,
  onOpenChange,
  selectedDate,
  selectedTime,
  defaultRoomId = "",
}: BookingModalProps) {
  const { rooms, createBooking } = useBookingStore()
  const [isLoading, setIsLoading] = useState(false)
  const [participantInput, setParticipantInput] = useState("")
  const [formData, setFormData] = useState({
    roomId: defaultRoomId,
    startTime: selectedTime || "",
    duration: "60",
    purpose: "",
    participants: [] as string[],
  })

  useEffect(() => {
    if (!open) return
    setFormData((current) => ({
      ...current,
      roomId: defaultRoomId || current.roomId,
      startTime: selectedTime || current.startTime,
    }))
  }, [defaultRoomId, open, selectedTime])

  const activeRooms = rooms.filter((room) => room.status === "active")
  const selectedRoom = rooms.find((room) => room.id === formData.roomId)

  const endTime = useMemo(() => {
    const startIndex = timeSlots.indexOf(formData.startTime)
    if (startIndex < 0) return ""
    const increments = Math.ceil(Number(formData.duration) / 30)
    return timeSlots[Math.min(timeSlots.length - 1, startIndex + increments)] ?? ""
  }, [formData.duration, formData.startTime])

  const handleAddParticipant = () => {
    const email = participantInput.trim().toLowerCase()
    if (!email || formData.participants.includes(email)) return

    setFormData({
      ...formData,
      participants: [...formData.participants, email],
    })
    setParticipantInput("")
  }

  const handleSubmit = async () => {
    if (!selectedDate || !endTime) return

    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 350))

    const result = createBooking({
      roomId: formData.roomId,
      date: dateStringFromDate(selectedDate),
      startTime: formData.startTime,
      endTime,
      purpose: formData.purpose,
      participantEmails: formData.participants,
    })

    setIsLoading(false)

    if (!result.ok) {
      toast.error(result.message)
      return
    }

    toast.success("Booking created", {
      description: `${selectedRoom?.name ?? "Room"} is reserved for ${formData.startTime}.`,
    })
    onOpenChange(false)
    setFormData({
      roomId: "",
      startTime: "",
      duration: "60",
      purpose: "",
      participants: [],
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Create Booking</DialogTitle>
          <DialogDescription>
            Reserve an interview space, invite participants, and keep the slot accountable.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {selectedDate && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">{format(selectedDate, "EEEE, MMMM d, yyyy")}</p>
                <p className="text-xs text-muted-foreground">Selected date</p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="room">Room</Label>
            <Select
              value={formData.roomId}
              onValueChange={(value) => setFormData({ ...formData, roomId: value })}
            >
              <SelectTrigger id="room" className="h-11">
                <SelectValue placeholder="Select a room" />
              </SelectTrigger>
              <SelectContent>
                {activeRooms.map((room) => (
                  <SelectItem key={room.id} value={room.id}>
                    <span className="flex items-center gap-2">
                      {room.name}
                      <Badge variant="secondary">{room.capacity} seats</Badge>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedRoom && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Users className="h-3 w-3" />
                Capacity: {selectedRoom.capacity} people
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Select
                value={formData.startTime}
                onValueChange={(value) => setFormData({ ...formData, startTime: value })}
              >
                <SelectTrigger id="startTime" className="h-11">
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.slice(0, -1).map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Select
                value={formData.duration}
                onValueChange={(value) => setFormData({ ...formData, duration: value })}
              >
                <SelectTrigger id="duration" className="h-11">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  {durationOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.startTime && endTime && (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
              <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-primary">Booking Rules</p>
                <p className="text-muted-foreground text-xs mt-1">
                  This slot runs from {formData.startTime} to {endTime}. Standard bookings are capped at 2 hours.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose</Label>
            <Textarea
              id="purpose"
              placeholder="e.g., Frontend intern interview, portfolio review, coding assessment..."
              value={formData.purpose}
              onChange={(event) => setFormData({ ...formData, purpose: event.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Add Participants</Label>
            <div className="flex gap-2">
              <Input
                placeholder="candidate@university.edu"
                value={participantInput}
                onChange={(event) => setParticipantInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault()
                    handleAddParticipant()
                  }
                }}
                className="h-10"
              />
              <Button type="button" variant="secondary" onClick={handleAddParticipant}>
                Add
              </Button>
            </div>

            {formData.participants.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.participants.map((email) => (
                  <Badge key={email} variant="secondary" className="pl-2 pr-1 py-1 gap-1 bg-muted">
                    <span className="text-xs">{email}</span>
                    <button
                      onClick={() =>
                        setFormData({
                          ...formData,
                          participants: formData.participants.filter((participant) => participant !== email),
                        })
                      }
                      className={cn("ml-1 hover:bg-destructive/20 rounded p-0.5 transition-colors")}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!formData.roomId || !formData.startTime || isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Confirm Booking
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
